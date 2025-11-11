import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey, getClientIp } from "@/lib/api-utils"
import { createClient } from "@/lib/supabase/server"

// GET single enrollment
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiKey = request.headers.get("x-api-key")
    if (!validateApiKey(apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    const { data: enrollment, error } = await supabase.from("enrollments").select("*").eq("id", id).single()

    if (error || !enrollment) {
      return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 })
    }

    return NextResponse.json(enrollment, { status: 200 })
  } catch (error) {
    console.error("[v0] Get enrollment error:", error)
    return NextResponse.json({ error: "Erro ao buscar inscrição" }, { status: 500 })
  }
}

// UPDATE enrollment
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiKey = request.headers.get("x-api-key")
    if (!validateApiKey(apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()

    // Get current enrollment for audit log
    const { data: currentEnrollment, error: fetchError } = await supabase
      .from("enrollments")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !currentEnrollment) {
      return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 })
    }

    const { data: updatedEnrollment, error: updateError } = await supabase
      .from("enrollments")
      .update({
        student_name: body.student_name,
        date_of_birth: body.date_of_birth,
        student_cpf: body.student_cpf,
        rg_student: body.rg_student,
        nis: body.nis,
        email: body.email,
        phone_main: body.phone_main,
        phone_whatsapp: body.phone_whatsapp,
        address_street: body.address_street,
        address_number: body.address_number,
        address_complement: body.address_complement,
        address_neighborhood: body.address_neighborhood,
        address_city: body.address_city,
        address_state: body.address_state,
        address_zip_code: body.address_zip_code,
        school_of_origin: body.school_of_origin,
        school_9th_network: body.school_9th_network,
        school_6th_name: body.school_6th_name,
        school_6th_network: body.school_6th_network,
        school_7th_name: body.school_7th_name,
        school_7th_network: body.school_7th_network,
        school_8th_name: body.school_8th_name,
        school_8th_network: body.school_8th_network,
        father_name: body.father_name,
        father_rg: body.father_rg,
        father_cpf: body.father_cpf,
        father_phone: body.father_phone,
        mother_name: body.mother_name,
        mother_rg: body.mother_rg,
        mother_cpf: body.mother_cpf,
        mother_phone: body.mother_phone,
        responsible_type: body.responsible_type,
        other_responsible_name: body.other_responsible_name,
        other_responsible_relationship: body.other_responsible_relationship,
        other_responsible_rg: body.other_responsible_rg,
        other_responsible_cpf: body.other_responsible_cpf,
        other_responsible_phone: body.other_responsible_phone,
        competition_public_school: body.competition_public_school,
        competition_private_school: body.competition_private_school,
        competition_lives_in_neighborhood: body.competition_lives_in_neighborhood,
        competition_pcd: body.competition_pcd,
        course_name: body.course_name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Update error:", updateError)
      return NextResponse.json({ error: "Erro ao atualizar inscrição" }, { status: 500 })
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
      enrollment_id: id,
      action: "updated",
      changed_by: "admin",
      reason: "Enrollment data updated via admin panel",
      ip_address: getClientIp(request),
    })

    return NextResponse.json(updatedEnrollment, { status: 200 })
  } catch (error) {
    console.error("[v0] Update enrollment error:", error)
    return NextResponse.json({ error: "Erro ao atualizar inscrição" }, { status: 500 })
  }
}

// DELETE enrollment
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiKey = request.headers.get("x-api-key")
    if (!validateApiKey(apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    // Get enrollment before deletion for audit
    const { data: enrollment, error: fetchError } = await supabase.from("enrollments").select("*").eq("id", id).single()

    if (fetchError || !enrollment) {
      return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 })
    }

    // Create audit log before deletion
    await supabase.from("audit_logs").insert({
      enrollment_id: id,
      action: "deleted",
      changed_by: "admin",
      reason: `Enrollment deleted: ${enrollment.student_name} (${enrollment.protocol_number})`,
      ip_address: getClientIp(request),
    })

    // Delete enrollment (audit logs will be cascade deleted)
    const { error: deleteError } = await supabase.from("enrollments").delete().eq("id", id)

    if (deleteError) {
      console.error("[v0] Delete error:", deleteError)
      return NextResponse.json({ error: "Erro ao excluir inscrição" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Inscrição excluída com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Delete enrollment error:", error)
    return NextResponse.json({ error: "Erro ao excluir inscrição" }, { status: 500 })
  }
}
