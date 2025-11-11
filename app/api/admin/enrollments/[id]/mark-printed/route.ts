import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { printed } = await request.json()
    const { id } = await params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const updateData: any = {
      form_printed: printed,
    }

    if (printed) {
      updateData.form_printed_at = new Date().toISOString()
      updateData.form_printed_by = "admin"
    } else {
      updateData.form_printed_at = null
      updateData.form_printed_by = null
    }

    console.log("[v0] Updating enrollment:", id, "with data:", updateData)

    const { data, error } = await supabase.from("enrollments").update(updateData).eq("id", id).select().single()

    if (error) {
      console.error("[v0] Error marking form as printed:", error)
      return NextResponse.json({ error: "Erro ao atualizar status de impressão" }, { status: 500 })
    }

    console.log("[v0] Successfully updated enrollment:", data)

    return NextResponse.json({ success: true, enrollment: data })
  } catch (error) {
    console.error("[v0] Error in mark-printed route:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
