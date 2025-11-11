import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { codigo } = await request.json()

    if (!codigo) {
      return NextResponse.json({ valid: false, message: "Código de acesso não fornecido" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if code exists and is not used
    const { data, error } = await supabase
      .from("access_codes")
      .select("id, codigo, utilizada")
      .eq("codigo", codigo.toUpperCase())
      .single()

    if (error || !data) {
      return NextResponse.json({ valid: false, message: "Código de acesso inválido" }, { status: 200 })
    }

    if (data.utilizada) {
      return NextResponse.json(
        {
          valid: false,
          message: "Este código já foi utilizado por outro aluno. Cada código só pode ser usado uma vez.",
        },
        { status: 200 },
      )
    }

    return NextResponse.json({ valid: true, message: "Código válido" }, { status: 200 })
  } catch (error) {
    console.error("Error validating access code:", error)
    return NextResponse.json({ valid: false, message: "Erro ao validar código" }, { status: 500 })
  }
}
