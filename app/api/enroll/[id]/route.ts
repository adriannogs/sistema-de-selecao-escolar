import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data, error } = await supabase.from("enrollments").select("*").eq("id", id).single()

    if (error || !data) {
      return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar inscrição" }, { status: 500 })
  }
}
