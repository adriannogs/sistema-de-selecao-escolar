import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminApiKey } from "@/lib/api-utils"

export async function GET(request: NextRequest, { params }: { params: Promise<{ enrollmentId: string }> }) {
  try {
    const apiKeyValid = await verifyAdminApiKey(request)
    if (!apiKeyValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { enrollmentId } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("socioeconomic_forms")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("[v0] Error fetching socioeconomic form:", error)
      return NextResponse.json({ error: "Erro ao buscar formulário" }, { status: 500 })
    }

    return NextResponse.json({ data: data || null })
  } catch (error) {
    console.error("[v0] Socioeconomic GET error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ enrollmentId: string }> }) {
  try {
    const apiKeyValid = await verifyAdminApiKey(request)
    if (!apiKeyValid) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { enrollmentId } = await params
    const body = await request.json()
    const supabase = await createClient()

    // Check if form already exists
    const { data: existing } = await supabase
      .from("socioeconomic_forms")
      .select("id")
      .eq("enrollment_id", enrollmentId)
      .single()

    if (existing) {
      // Update existing form
      const { data, error } = await supabase
        .from("socioeconomic_forms")
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq("enrollment_id", enrollmentId)
        .select()
        .single()

      if (error) {
        console.error("[v0] Error updating socioeconomic form:", error)
        return NextResponse.json({ error: "Erro ao atualizar formulário" }, { status: 500 })
      }

      return NextResponse.json({ data, message: "Formulário atualizado com sucesso" })
    } else {
      // Create new form
      const { data, error } = await supabase
        .from("socioeconomic_forms")
        .insert({
          enrollment_id: enrollmentId,
          ...body,
          created_by: "admin",
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Error creating socioeconomic form:", error)
        return NextResponse.json({ error: "Erro ao criar formulário" }, { status: 500 })
      }

      return NextResponse.json({ data, message: "Formulário criado com sucesso" }, { status: 201 })
    }
  } catch (error) {
    console.error("[v0] Socioeconomic POST error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
