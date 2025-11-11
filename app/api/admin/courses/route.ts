import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/lib/api-utils"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key")
    if (!validateApiKey(apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    const { data: courses, error } = await supabase.from("courses").select("*").eq("active", true).order("name")

    if (error) {
      console.error("[v0] Courses fetch error:", error)
      return NextResponse.json({ error: "Erro ao buscar cursos" }, { status: 500 })
    }

    return NextResponse.json({ courses }, { status: 200 })
  } catch (error) {
    console.error("[v0] Courses API error:", error)
    return NextResponse.json({ error: "Erro ao buscar cursos" }, { status: 500 })
  }
}
