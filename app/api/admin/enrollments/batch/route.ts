import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey, getClientIp } from "@/lib/api-utils"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key")
    if (!validateApiKey(apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { enrollmentIds, status } = await request.json()

    if (!enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
      return NextResponse.json({ error: "IDs de inscrição inválidos" }, { status: 400 })
    }

    if (!status || !["pendente", "analisado", "aceito", "recusado"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current enrollments for audit log
    const { data: currentEnrollments, error: fetchError } = await supabase
      .from("enrollments")
      .select("*")
      .in("id", enrollmentIds)

    if (fetchError || !currentEnrollments) {
      return NextResponse.json({ error: "Erro ao buscar inscrições" }, { status: 500 })
    }

    // Update all enrollments
    const { data: updatedEnrollments, error: updateError } = await supabase
      .from("enrollments")
      .update({ status, updated_at: new Date().toISOString() })
      .in("id", enrollmentIds)
      .select()

    if (updateError) {
      console.error("[v0] Batch update error:", updateError)
      return NextResponse.json({ error: "Erro ao atualizar inscrições" }, { status: 500 })
    }

    // Create audit logs for each enrollment
    const auditLogs = currentEnrollments.map((enrollment) => ({
      enrollment_id: enrollment.id,
      action: "batch_status_changed",
      old_status: enrollment.status,
      new_status: status,
      changed_by: "admin",
      reason: `Batch status update: ${enrollment.status} → ${status}`,
      ip_address: getClientIp(request),
    }))

    await supabase.from("audit_logs").insert(auditLogs)

    return NextResponse.json(
      {
        success: true,
        updated: updatedEnrollments.length,
        enrollments: updatedEnrollments,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Batch update error:", error)
    return NextResponse.json({ error: "Erro ao atualizar inscrições em lote" }, { status: 500 })
  }
}
