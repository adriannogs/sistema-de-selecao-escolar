import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey, getClientIp } from "@/lib/api-utils"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiKey = request.headers.get("x-api-key")
    if (!validateApiKey(apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { status } = await request.json()

    const supabase = await createClient()

    // Get current enrollment to retrieve old status
    const { data: enrollment, error: fetchError } = await supabase.from("enrollments").select("*").eq("id", id).single()

    if (fetchError || !enrollment) {
      return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 })
    }

    // Update status
    const { data: updatedEnrollment, error: updateError } = await supabase
      .from("enrollments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 })
    }

    // Create audit log
    await supabase.from("audit_logs").insert({
      enrollment_id: id,
      action: "status_changed",
      old_status: enrollment.status,
      new_status: status,
      changed_by: "admin",
      ip_address: getClientIp(request),
    })

    return NextResponse.json(updatedEnrollment, { status: 200 })
  } catch (error) {
    console.error("[v0] Status update error:", error)
    return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 })
  }
}
