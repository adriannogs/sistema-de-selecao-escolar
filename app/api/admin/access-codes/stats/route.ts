import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get total count
    const { count: total } = await supabase.from("access_codes").select("*", { count: "exact", head: true })

    // Get used count
    const { count: used } = await supabase
      .from("access_codes")
      .select("*", { count: "exact", head: true })
      .eq("utilizada", true)

    // Get available count
    const { count: available } = await supabase
      .from("access_codes")
      .select("*", { count: "exact", head: true })
      .eq("utilizada", false)

    return NextResponse.json({
      total: total || 0,
      used: used || 0,
      available: available || 0,
    })
  } catch (error) {
    console.error("Error fetching access code stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
