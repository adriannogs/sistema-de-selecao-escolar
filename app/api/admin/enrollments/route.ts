import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/lib/api-utils"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key")
    if (!validateApiKey(apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const courseFilter = searchParams.get("course")
    const statusFilter = searchParams.get("status")

    const offset = (page - 1) * limit

    const supabase = await createClient()

    let query = supabase.from("enrollments").select("*", { count: "exact" })

    if (courseFilter) {
      query = query.eq("course_name", courseFilter)
    }
    if (statusFilter) {
      query = query.eq("status", statusFilter)
    }

    const { data: enrollments, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (!enrollments) {
      return NextResponse.json({ error: "Erro ao buscar inscrições" }, { status: 500 })
    }

    return NextResponse.json(
      {
        enrollments,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Admin enrollments error:", error)
    return NextResponse.json({ error: "Erro ao buscar inscrições" }, { status: 500 })
  }
}
