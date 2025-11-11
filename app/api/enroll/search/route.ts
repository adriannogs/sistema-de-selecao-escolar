import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const protocolNumber = searchParams.get("protocolNumber")

    if (!protocolNumber) {
      return NextResponse.json({ error: "Protocolo não fornecido" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("protocol_number", protocolNumber)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[v0] Search enrollment error:", error)
    return NextResponse.json({ error: "Erro ao buscar inscrição" }, { status: 500 })
  }
}
