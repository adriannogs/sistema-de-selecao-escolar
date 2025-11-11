import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { jsPDF } from "jspdf"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filter = searchParams.get("filter") || "unused"

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    let query = supabase.from("access_codes").select("codigo, utilizada, data_uso").order("codigo", { ascending: true })

    if (filter === "unused") {
      query = query.eq("utilizada", false)
    }

    const { data: codes, error } = await query

    if (error) {
      throw error
    }

    if (!codes || codes.length === 0) {
      return NextResponse.json({ error: "Nenhum código encontrado" }, { status: 404 })
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const codesPerRow = 5
    const columnWidth = (pageWidth - 2 * margin - 4 * 2) / codesPerRow // 4*2 for gaps between columns
    const rowHeight = 10
    const codesPerPage = 25 * codesPerRow // 25 rows per page

    doc.setFontSize(16)
    doc.setFont(undefined, "bold")
    doc.text("Códigos de Acesso - Processo Seletivo 2026", pageWidth / 2, 15, { align: "center" } as any)

    doc.setFontSize(10)
    doc.setFont(undefined, "normal")
    doc.text(filter === "unused" ? "Códigos Não Utilizados" : "Todos os Códigos", pageWidth / 2, 22, {
      align: "center",
    } as any)

    let yPos = 35
    let codeIndex = 0

    codes.forEach((code, index) => {
      if (index > 0 && index % codesPerPage === 0) {
        doc.addPage()
        yPos = 35
        codeIndex = 0
      }

      const col = codeIndex % codesPerRow
      const row = Math.floor(codeIndex / codesPerRow)
      const xPos = margin + col * (columnWidth + 2)
      const currentYPos = yPos + row * rowHeight

      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.rect(xPos, currentYPos, columnWidth, rowHeight - 1)

      doc.setFontSize(8)
      doc.setFont(undefined, "bold")
      doc.text(code.codigo, xPos + columnWidth / 2, currentYPos + 6, { align: "center" } as any)

      if (filter === "all") {
        doc.setFontSize(6)
        doc.setFont(undefined, "normal")
        const status = code.utilizada ? "USADO" : "DISP"
        const statusColor = code.utilizada ? [220, 38, 38] : [34, 197, 94]
        doc.setTextColor(...(statusColor as [number, number, number]))
        doc.text(status, xPos + columnWidth - 2, currentYPos + 3, { align: "right" } as any)
        doc.setTextColor(0, 0, 0)
      }

      codeIndex++

      if (codeIndex % codesPerPage === 0) {
        yPos = 35
        codeIndex = 0
      }
    })

    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.text(`Página ${i} de ${totalPages} - Total: ${codes.length} código(s)`, pageWidth / 2, pageHeight - 10, {
        align: "center",
      } as any)
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="codigos_acesso_${filter}_${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error exporting PDF:", error)
    return NextResponse.json({ error: "Failed to export PDF" }, { status: 500 })
  }
}
