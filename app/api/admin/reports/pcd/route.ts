import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import jsPDF from "jspdf"

export async function GET() {
  try {
    const supabase = await createClient()

    // Query enrollments: students with disabilities
    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select("enrollment_number, student_name, school_of_origin, education_network")
      .eq("competition_pcd", true)
      .order("enrollment_number", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching PCD enrollments:", error)
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
    doc.text("Relatório: Alunos PCD (Pessoa com Deficiência)", pageWidth / 2, 20, { align: "center" })

    // Date
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, pageWidth / 2, 28, { align: "center" })
    doc.text(`Total de alunos PCD: ${enrollments?.length || 0}`, pageWidth / 2, 34, { align: "center" })

    let yPosition = 45

    // Table headers
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.text("Nº Inscrição", margin, yPosition)
    doc.text("Nome do Aluno", margin + 30, yPosition)
    doc.text("Escola de Origem", margin + 95, yPosition)
    doc.text("Rede de Ensino", margin + 150, yPosition)

    yPosition += 2
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 5

    // Table rows
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)

    enrollments?.forEach((enrollment) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage()
        yPosition = 20

        // Repeat headers
        doc.setFont("helvetica", "bold")
        doc.setFontSize(9)
        doc.text("Nº Inscrição", margin, yPosition)
        doc.text("Nome do Aluno", margin + 30, yPosition)
        doc.text("Escola de Origem", margin + 95, yPosition)
        doc.text("Rede de Ensino", margin + 150, yPosition)
        yPosition += 2
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 5
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
      }

      doc.text(String(enrollment.enrollment_number), margin, yPosition)
      doc.text(enrollment.student_name?.substring(0, 30) || "", margin + 30, yPosition)
      doc.text(enrollment.school_of_origin?.substring(0, 25) || "", margin + 95, yPosition)

      const network =
        enrollment.education_network === "public"
          ? "Pública"
          : enrollment.education_network === "private"
            ? "Particular"
            : enrollment.education_network || "Não informado"
      doc.text(network, margin + 150, yPosition)

      yPosition += 6
    })

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="relatorio-pcd-${Date.now()}.pdf"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error generating PCD PDF:", error)
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 })
  }
}
