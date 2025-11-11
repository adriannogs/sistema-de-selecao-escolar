import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const year = new Date().getFullYear().toString().slice(-2)

  let code = `EP${year}-`

  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  code += "-"

  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return code
}

export async function POST() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const codes = new Set<string>()

    while (codes.size < 1000) {
      codes.add(generateAccessCode())
    }

    const codesData = Array.from(codes).map((codigo) => ({
      codigo,
      utilizada: false,
    }))

    const batchSize = 100
    let inserted = 0

    for (let i = 0; i < codesData.length; i += batchSize) {
      const batch = codesData.slice(i, i + batchSize)

      const { error } = await supabase.from("access_codes").insert(batch)

      if (error) {
        console.error(`Error inserting batch:`, error)
        throw error
      }

      inserted += batch.length
    }

    return NextResponse.json({
      success: true,
      count: inserted,
      message: `${inserted} códigos gerados com sucesso`,
    })
  } catch (error) {
    console.error("Error generating access codes:", error)
    return NextResponse.json({ error: "Failed to generate codes" }, { status: 500 })
  }
}
