import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { jsPDF } from "jspdf"
import QRCode from "qrcode"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: enrollments, error } = await supabase.from("enrollments").select("*").eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Erro ao buscar inscrição no banco de dados" }, { status: 500 })
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ error: "Inscrição não encontrada" }, { status: 404 })
    }

    const enrollment = enrollments[0]

    // await supabase.from("enrollments").update({ form_printed: true, ... }).eq("id", id)

    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verificar?protocolNumber=${enrollment.protocol_number}`
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl)

    const doc = new jsPDF()

    const primaryColor: [number, number, number] = [37, 99, 235]
    const textColor: [number, number, number] = [31, 41, 55]
    const lightBg: [number, number, number] = [249, 250, 251]
    const borderColor: [number, number, number] = [229, 231, 235]

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 12
    const contentWidth = pageWidth - 2 * margin

    let yPos = 15

    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, pageWidth, 35, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont(undefined, "bold")
    doc.text("FICHA DE INSCRIÇÃO", pageWidth / 2, 12, { align: "center" } as any)
    doc.setFontSize(10)
    doc.setFont(undefined, "normal")
    doc.text("EP Lúcia Baltazar - Processo Seletivo 2026", pageWidth / 2, 19, { align: "center" } as any)

    doc.setFontSize(8)
    doc.text(`Protocolo: ${enrollment.protocol_number}`, pageWidth / 2, 26, { align: "center" } as any)

    doc.setFont(undefined, "normal")
    doc.setFontSize(10)
    doc.setTextColor(...textColor)

    const qrSize = 22
    const qrX = 8
    const qrY = 6
    doc.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize)

    const boxSize = 22
    const boxX = pageWidth - boxSize - 8
    const boxY = 6

    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(1)
    doc.rect(boxX, boxY, boxSize, boxSize, "S")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont(undefined, "bold")
    doc.text("Nº", boxX + boxSize / 2, boxY + 8, { align: "center" } as any)
    doc.setFontSize(12)
    doc.text(String(enrollment.enrollment_number || "---"), boxX + boxSize / 2, boxY + 16, { align: "center" } as any)

    doc.setTextColor(...textColor)
    doc.setFont(undefined, "normal")
    doc.setFontSize(10)

    yPos = 40

    const drawSectionHeader = (title: string, y: number) => {
      doc.setFillColor(...lightBg)
      doc.rect(margin, y, contentWidth, 7, "F")
      doc.setTextColor(...primaryColor)
      doc.setFontSize(9)
      doc.setFont(undefined, "bold")
      doc.text(title, margin + 2, y + 5)
      return y + 9
    }

    const drawField = (label: string, value: string, x: number, y: number, width: number) => {
      doc.setTextColor(...textColor)
      doc.setFontSize(7)
      doc.setFont(undefined, "bold")
      doc.text(label + ":", x, y)
      doc.setFont(undefined, "normal")
      const lines = doc.splitTextToSize(value || "Não informado", width - 2)
      doc.text(lines, x, y + 3)
      return y + 3 + lines.length * 3
    }

    yPos = drawSectionHeader("1. DADOS DO ALUNO", yPos)

    const col1X = margin + 2
    const col2X = margin + 2 + contentWidth / 4
    const col3X = margin + 2 + (contentWidth / 4) * 2
    const col4X = margin + 2 + (contentWidth / 4) * 3
    const colWidth = contentWidth / 4 - 2

    let col1Y = yPos
    let col2Y = yPos
    let col3Y = yPos
    let col4Y = yPos

    col1Y = drawField("Nome Completo", enrollment.student_name, col1X, col1Y, colWidth)
    col2Y = drawField(
      "Data de Nascimento",
      new Date(enrollment.date_of_birth).toLocaleDateString("pt-BR"),
      col2X,
      col2Y,
      colWidth,
    )
    col3Y = drawField("RG", enrollment.rg_student || "", col3X, col3Y, colWidth)
    col4Y = drawField("CPF", enrollment.student_cpf || "", col4X, col4Y, colWidth)

    col1Y = drawField("NIS", enrollment.nis || "", col1X, col1Y, colWidth)
    col2Y = drawField("Telefone Principal", enrollment.phone_main, col2X, col2Y, colWidth)
    col3Y = drawField("WhatsApp", enrollment.phone_whatsapp || "", col3X, col3Y, colWidth)

    yPos = Math.max(col1Y, col2Y, col3Y, col4Y) + 4

    yPos = drawSectionHeader("2. ENDEREÇO", yPos)

    const col1XAddr = margin + 2
    const col2XAddr = margin + 2 + contentWidth / 3
    const col3XAddr = margin + 2 + (contentWidth / 3) * 2
    const colWidthAddr = contentWidth / 3 - 2

    col1Y = yPos
    col2Y = yPos
    col3Y = yPos

    col1Y = drawField("Logradouro", enrollment.address_street, col1XAddr, col1Y, colWidthAddr)
    col2Y = drawField("Número", enrollment.address_number, col2XAddr, col2Y, colWidthAddr)
    col3Y = drawField("Complemento", enrollment.address_complement || "", col3XAddr, col3Y, colWidthAddr)

    col1Y = drawField("Bairro", enrollment.address_neighborhood, col1XAddr, col1Y, colWidthAddr)
    col2Y = drawField("Cidade", enrollment.address_city, col2XAddr, col2Y, colWidthAddr)
    col3Y = drawField("Estado", enrollment.address_state, col3XAddr, col3Y, colWidthAddr)

    col1Y = drawField("CEP", enrollment.address_zip_code, col1XAddr, col1Y, colWidthAddr)

    yPos = Math.max(col1Y, col2Y, col3Y) + 4

    yPos = drawSectionHeader("3. ESCOLA ONDE CURSOU ENSINO FUNDAMENTAL", yPos)

    const schoolCol1X = margin + 2
    const schoolCol2X = margin + 2 + contentWidth / 2
    const schoolColWidth = contentWidth / 2 - 4

    col1Y = yPos
    col2Y = yPos

    doc.setFontSize(7)
    doc.setFont(undefined, "bold")
    doc.text("6º Ano:", schoolCol1X, col1Y)
    col1Y += 3
    doc.setFont(undefined, "normal")
    const school6thText = doc.splitTextToSize(
      `${enrollment.school_6th_name || "Não informado"} (${enrollment.school_6th_network || "N/A"})`,
      schoolColWidth,
    )
    doc.text(school6thText, schoolCol1X + 2, col1Y)
    col1Y += school6thText.length * 3 + 3

    doc.setFont(undefined, "bold")
    doc.text("7º Ano:", schoolCol1X, col1Y)
    col1Y += 3
    doc.setFont(undefined, "normal")
    const school7thText = doc.splitTextToSize(
      `${enrollment.school_7th_name || "Não informado"} (${enrollment.school_7th_network || "N/A"})`,
      schoolColWidth,
    )
    doc.text(school7thText, schoolCol1X + 2, col1Y)
    col1Y += school7thText.length * 3

    doc.setFont(undefined, "bold")
    doc.text("8º Ano:", schoolCol2X, col2Y)
    col2Y += 3
    doc.setFont(undefined, "normal")
    const school8thText = doc.splitTextToSize(
      `${enrollment.school_8th_name || "Não informado"} (${enrollment.school_8th_network || "N/A"})`,
      schoolColWidth,
    )
    doc.text(school8thText, schoolCol2X + 2, col2Y)
    col2Y += school8thText.length * 3 + 3

    doc.setFont(undefined, "bold")
    doc.text("9º Ano:", schoolCol2X, col2Y)
    col2Y += 3
    doc.setFont(undefined, "normal")
    const school9thText = doc.splitTextToSize(
      `${enrollment.school_of_origin || "Não informado"} (${enrollment.education_network || "N/A"})`,
      schoolColWidth,
    )
    doc.text(school9thText, schoolCol2X + 2, col2Y)
    col2Y += school9thText.length * 3

    yPos = Math.max(col1Y, col2Y) + 3

    yPos = drawSectionHeader("4. MÉDIAS DO ALUNO", yPos)

    const tableStartY = yPos
    const cellHeight = 8
    const cellWidth = (contentWidth - 4) / 5

    doc.setDrawColor(...borderColor)
    doc.setLineWidth(0.3)

    doc.setFillColor(...lightBg)
    doc.rect(margin + 2, tableStartY, contentWidth - 4, cellHeight, "FD")

    const headers = ["MÉDIA 6º ANO", "MÉDIA 7º ANO", "MÉDIA 8º ANO", "MÉDIA 9º ANO", "MÉDIA FINAL"]
    headers.forEach((header, index) => {
      const cellX = margin + 2 + index * cellWidth
      if (index > 0) {
        doc.line(cellX, tableStartY, cellX, tableStartY + cellHeight)
      }
      doc.setTextColor(...primaryColor)
      doc.setFontSize(6)
      doc.setFont(undefined, "bold")
      doc.text(header, cellX + cellWidth / 2, tableStartY + 5, { align: "center" } as any)
    })

    const dataRowY = tableStartY + cellHeight
    doc.setFillColor(255, 255, 255)
    doc.rect(margin + 2, dataRowY, contentWidth - 4, cellHeight, "D")

    headers.forEach((_, index) => {
      if (index > 0) {
        const cellX = margin + 2 + index * cellWidth
        doc.line(cellX, dataRowY, cellX, dataRowY + cellHeight)
      }
    })

    yPos = dataRowY + cellHeight + 5

    doc.setTextColor(...textColor)
    doc.setFont(undefined, "normal")
    doc.setFontSize(10)

    yPos = drawSectionHeader("5. TIPO DE CONCORRÊNCIA", yPos)

    doc.setFontSize(7)
    doc.setFont(undefined, "normal")
    const competitionTypes = []
    if (enrollment.competition_public_school) competitionTypes.push("Escola Pública")
    if (enrollment.competition_private_school) competitionTypes.push("Escola Privada")
    if (enrollment.competition_lives_in_neighborhood) competitionTypes.push("Mora no Bairro da Escola")
    if (enrollment.competition_pcd) competitionTypes.push("PCD")
    doc.text(competitionTypes.length > 0 ? competitionTypes.join(", ") : "Não informado", margin + 2, yPos)
    yPos += 3

    yPos = drawSectionHeader("6. FILIAÇÃO", yPos)

    col1Y = yPos
    col2Y = yPos
    col3Y = yPos

    doc.setFontSize(7)
    doc.setFont(undefined, "bold")
    doc.text("Pai:", col1XAddr, col1Y)
    col1Y += 3
    doc.setFont(undefined, "normal")
    doc.text(`Nome: ${enrollment.father_name || "Não informado"}`, col1XAddr, col1Y)
    col1Y += 3
    if (enrollment.father_rg) {
      doc.text(`RG: ${enrollment.father_rg}`, col1XAddr, col1Y)
      col1Y += 3
    }
    if (enrollment.father_cpf) {
      doc.text(`CPF: ${enrollment.father_cpf}`, col1XAddr, col1Y)
      col1Y += 3
    }
    if (enrollment.father_phone) {
      doc.text(`Telefone: ${enrollment.father_phone}`, col1XAddr, col1Y)
      col1Y += 3
    }

    doc.setFont(undefined, "bold")
    doc.text("Mãe:", col2XAddr, col2Y)
    col2Y += 3
    doc.setFont(undefined, "normal")
    doc.text(`Nome: ${enrollment.mother_name || "Não informado"}`, col2XAddr, col2Y)
    col2Y += 3
    if (enrollment.mother_rg) {
      doc.text(`RG: ${enrollment.mother_rg}`, col2XAddr, col2Y)
      col2Y += 3
    }
    if (enrollment.mother_cpf) {
      doc.text(`CPF: ${enrollment.mother_cpf}`, col2XAddr, col2Y)
      col2Y += 3
    }
    if (enrollment.mother_phone) {
      doc.text(`Telefone: ${enrollment.mother_phone}`, col2XAddr, col2Y)
      col2Y += 3
    }

    yPos = Math.max(col1Y, col2Y, col3Y) + 3

    yPos = drawSectionHeader("7. RESPONSÁVEL PELA EDUCAÇÃO DO ALUNO", yPos)

    doc.setFontSize(8)
    doc.setFont(undefined, "normal")
    if (enrollment.responsible_type === "pai") {
      doc.text("Responsável: Pai", margin + 2, yPos)
      yPos += 3
    } else if (enrollment.responsible_type === "mae") {
      doc.text("Responsável: Mãe", margin + 2, yPos)
      yPos += 3
    } else if (enrollment.responsible_type === "outros" && enrollment.other_responsible_name) {
      doc.setFont(undefined, "bold")
      doc.text("Outro Responsável:", margin + 2, yPos)
      yPos += 4

      col1Y = yPos
      col2Y = yPos
      col3Y = yPos

      doc.setFontSize(7)
      doc.setFont(undefined, "normal")

      col1Y = drawField("Nome", enrollment.other_responsible_name, col1XAddr, col1Y, colWidthAddr)
      col2Y = drawField("Parentesco", enrollment.other_responsible_relationship || "", col2XAddr, col2Y, colWidthAddr)
      col3Y = drawField("RG", enrollment.other_responsible_rg || "", col3XAddr, col3Y, colWidthAddr)

      col1Y = drawField("CPF", enrollment.other_responsible_cpf || "", col1XAddr, col1Y, colWidthAddr)
      col2Y = drawField("Telefone", enrollment.other_responsible_phone || "", col2XAddr, col2Y, colWidthAddr)

      yPos = Math.max(col1Y, col2Y, col3Y) + 2
    } else {
      doc.text("Não informado", margin + 2, yPos)
      yPos += 3
    }

    yPos = drawSectionHeader("8. CURSOS OFERTADOS PARA 2026", yPos)

    doc.setFontSize(7)
    doc.setFont(undefined, "normal")

    const coursesLeft = ["• TÉCNICO EM ADMINISTRAÇÃO", "• TÉCNICO EM DESENVOLVIMENTO DE SISTEMAS"]
    const coursesRight = ["• TÉCNICO EM EDIFICAÇÕES", "• TÉCNICO EM MASSOTERAPIA"]

    let leftCourseY = yPos
    let rightCourseY = yPos

    coursesLeft.forEach((course) => {
      doc.text(course, col1XAddr, leftCourseY)
      leftCourseY += 4
    })

    coursesRight.forEach((course) => {
      doc.text(course, col2XAddr, rightCourseY)
      rightCourseY += 4
    })

    yPos = Math.max(leftCourseY, rightCourseY) + 3

    yPos = drawSectionHeader("9. CURSO ESCOLHIDO", yPos)

    doc.setFontSize(8)
    doc.setFont(undefined, "normal")
    doc.text("_________________________________________________________________", margin + 2, yPos)
    doc.setFontSize(6)
    doc.setTextColor(...textColor)
    doc.text("(Preencher manualmente após consultar a lista de cursos ofertados acima)", margin + 2, yPos + 3)
    yPos += 6

    yPos = drawSectionHeader("10. ASSINATURAS", yPos)

    const sigWidth = (contentWidth - 6) / 3

    doc.setDrawColor(...textColor)
    doc.setLineWidth(0.5)
    doc.line(margin + 2, yPos + 10, margin + 2 + sigWidth, yPos + 10)
    doc.setFontSize(6)
    doc.setFont(undefined, "normal")
    doc.text("Assinatura do Aluno", margin + 2 + sigWidth / 2, yPos + 13, { align: "center" } as any)

    doc.line(margin + 4 + sigWidth, yPos + 10, margin + 4 + sigWidth * 2, yPos + 10)
    doc.text("Assinatura do Responsável", margin + 4 + sigWidth + sigWidth / 2, yPos + 13, { align: "center" } as any)

    doc.line(margin + 6 + sigWidth * 2, yPos + 10, margin + 6 + sigWidth * 3, yPos + 10)
    doc.text("Equipe Lucia Baltazar Costa", margin + 6 + sigWidth * 2 + sigWidth / 2, yPos + 13, {
      align: "center",
    } as any)

    yPos += 17

    doc.setFontSize(7)
    doc.setFont(undefined, "normal")
    doc.text("Data: ____/____/________", margin + 2, yPos)

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="ficha_inscricao_${enrollment.protocol_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Erro ao gerar PDF" }, { status: 500 })
  }
}
