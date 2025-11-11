import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import jsPDF from "jspdf"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") // 'printed' or 'not-printed'

    const supabase = await createClient()

    // Build query based on filter
    let query = supabase
      .from("enrollments")
      .select("enrollment_number, student_name, course_name, phone_main, email, form_printed, form_printed_at, status")
      .order("enrollment_number", { ascending: true })

    if (filter === "printed") {
      query = query.eq("form_printed", true)
    } else if (filter === "not-printed") {
      query = query.or("form_printed.is.null,form_printed.eq.false")
    }

    const { data: enrollments, error } = await query

    if (error) {
      console.error("[v0] Error fetching enrollments:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Generate PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15

    // Title
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    const title =
      filter === "printed"
        ? "Relatório: Fichas de Matrícula Impressas"
        : filter === "not-printed"
          ? "Relatório: Fichas de Matrícula Pendentes"
          : "Relatório: Todas as Fichas de Matrícula"

    doc.text(title, pageWidth / 2, 20, { align: "center" })

    // Date
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, pageWidth / 2, 28, { align: "center" })
    doc.text(`Total de registros: ${enrollments?.length || 0}`, pageWidth / 2, 34, { align: "center" })

    let yPosition = 45

    // Table headers
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("Nº", margin, yPosition)
    doc.text("Nome do Aluno", margin + 15, yPosition)
    doc.text("Curso", margin + 80, yPosition)
    doc.text("Contato", margin + 130, yPosition)

    yPosition += 2
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 5

    // Table rows
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)

    enrollments?.forEach((enrollment, index) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage()
        yPosition = 20

        // Repeat headers on new page
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text("Nº", margin, yPosition)
        doc.text("Nome do Aluno", margin + 15, yPosition)
        doc.text("Curso", margin + 80, yPosition)
        doc.text("Contato", margin + 130, yPosition)
        yPosition += 2
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 5
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
      }

      doc.text(String(enrollment.enrollment_number), margin, yPosition)
      doc.text(enrollment.student_name?.substring(0, 35) || "", margin + 15, yPosition)
      doc.text(enrollment.course_name?.substring(0, 25) || "", margin + 80, yPosition)
      doc.text(enrollment.phone_main || "", margin + 130, yPosition)

      yPosition += 6
    })

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="relatorio-fichas-${filter || "todas"}-${Date.now()}.pdf"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating PDF:", error)
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 })
  }
}
