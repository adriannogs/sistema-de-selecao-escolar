import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function generateProtocolNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")
  return `EP${year}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] Enrollment request received")

    if (!body.accessCode) {
      return NextResponse.json({ error: "Código de acesso é obrigatório" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: accessCodeData, error: accessCodeError } = await supabase
      .from("access_codes")
      .select("id, codigo, utilizada, id_aluno_uso")
      .eq("codigo", body.accessCode.toUpperCase())
      .single()

    if (accessCodeError || !accessCodeData) {
      console.log("[v0] Access code not found:", body.accessCode)
      return NextResponse.json({ error: "Código de acesso inválido" }, { status: 400 })
    }

    if (accessCodeData.utilizada) {
      console.log("[v0] Access code already used:", body.accessCode)
      return NextResponse.json(
        {
          error: "Este código de acesso já foi utilizado por outro aluno. Cada código só pode ser usado uma vez.",
        },
        { status: 400 },
      )
    }

    const protocolNumber = generateProtocolNumber()

    const { data: seqData, error: seqError } = await supabase.rpc("nextval", {
      sequence_name: "enrollment_number_seq",
    })

    let enrollmentNumber = 1
    if (!seqError && seqData) {
      enrollmentNumber = seqData
    } else {
      const { count } = await supabase.from("enrollments").select("*", { count: "exact", head: true })
      enrollmentNumber = (count || 0) + 1
    }

    const enrollmentData = {
      protocol_number: protocolNumber,
      enrollment_number: enrollmentNumber,
      access_code_id: accessCodeData.id,
      year: 2026,
      student_name: body.studentName,
      date_of_birth: body.dateOfBirth,
      rg_student: body.rg,
      student_cpf: body.cpf,
      nis: body.nis,

      // Address
      address_street: body.address.street,
      address_number: body.address.number,
      address_complement: body.address.complement,
      address_neighborhood: body.address.neighborhood,
      address_city: body.address.city,
      address_state: body.address.state,
      address_zip_code: body.address.zipCode,

      // School history (6th, 7th, 8th grade)
      school_6th_name: body.school6thName,
      school_6th_network: body.school6thNetwork,
      school_7th_name: body.school7thName,
      school_7th_network: body.school7thNetwork,
      school_8th_name: body.school8thName,
      school_8th_network: body.school8thNetwork,

      // School of origin (9th grade)
      school_of_origin: body.school9thName,
      education_network: body.school9thNetwork,

      // Competition type
      competition_public_school: body.competitionPublicSchool,
      competition_private_school: body.competitionPrivateSchool,
      competition_lives_in_neighborhood: body.competitionLivesInNeighborhood,
      competition_pcd: body.competitionPcd,

      // Contacts
      phone_main: body.phoneMain,
      phone_whatsapp: body.phoneWhatsapp,

      // Parents
      father_name: body.fatherName,
      father_rg: body.fatherRg,
      father_cpf: body.fatherCpf,
      father_phone: body.fatherPhone,
      mother_name: body.motherName,
      mother_rg: body.motherRg,
      mother_cpf: body.motherCpf,
      mother_phone: body.motherPhone,

      // Responsible
      responsible_type: body.responsibleType,
      other_responsible_name: body.otherResponsibleName,
      other_responsible_relationship: body.otherResponsibleRelationship,
      other_responsible_rg: body.otherResponsibleRg,
      other_responsible_cpf: body.otherResponsibleCpf,
      other_responsible_phone: body.otherResponsiblePhone,

      course_name: null,

      status: "pendente",
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      user_agent: request.headers.get("user-agent"),
    }

    console.log("[v0] Inserting enrollment data...")

    const { data, error } = await supabase.from("enrollments").insert(enrollmentData).select()

    if (error) {
      console.error("[v0] Supabase insert error:", error)

      if (error.code === "23505" && error.message.includes("unique_access_code_per_enrollment")) {
        return NextResponse.json(
          {
            error: "Este código de acesso já foi utilizado por outro aluno. Cada código só pode ser usado uma vez.",
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: "Erro ao processar inscrição",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Enrollment created successfully with ID:", data[0].id)

    const { error: markUsedError } = await supabase.rpc("mark_access_code_used", {
      p_codigo: body.accessCode.toUpperCase(),
      p_enrollment_id: data[0].id,
    })

    if (markUsedError) {
      console.error("[v0] Error marking access code as used:", markUsedError)
      // Code is already linked via access_code_id in enrollment, so this is not critical
    }

    await supabase.from("audit_logs").insert({
      enrollment_id: data[0].id,
      action: "created",
      new_status: "pendente",
      changed_by: "system",
      reason: "Enrollment created via public form",
      ip_address: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    })

    console.log("[v0] Enrollment completed successfully with protocol:", protocolNumber)

    return NextResponse.json(
      {
        success: true,
        protocolNumber: protocolNumber,
        message: "Inscrição recebida com sucesso.",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Enrollment API exception:", error)
    return NextResponse.json(
      {
        error: "Erro ao processar inscrição",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
