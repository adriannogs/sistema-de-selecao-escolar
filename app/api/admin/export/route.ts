import { type NextRequest, NextResponse } from "next/server"
import { validateApiKey } from "@/lib/api-utils"
import { createClient } from "@/lib/supabase/server"
import PDFDocument from "pdfkit"

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key")
    if (!validateApiKey(apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "pdf" // pdf or csv
    const course = searchParams.get("course") || "all"
    const status = searchParams.get("status") || "all"

    const supabase = await createClient()

    // Build query
    let query = supabase.from("enrollments").select("*")

    if (course !== "all") {
      query = query.eq("course_name", course)
    }
    if (status !== "all") {
      query = query.eq("status", status)
    }

    const { data: enrollments, error } = await query
      .order("course_name", { ascending: true })
      .order("student_name", { ascending: true })

    if (error) {
      console.error("[v0] Export fetch error:", error)
      return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ error: "Nenhuma inscrição encontrada" }, { status: 404 })
    }

    // Group by course if exporting all
    const groupedByCourse: Record<string, typeof enrollments> = {}
    enrollments.forEach((enrollment) => {
      const courseName = enrollment.course_name || "Sem Curso"
      if (!groupedByCourse[courseName]) {
        groupedByCourse[courseName] = []
      }
      groupedByCourse[courseName].push(enrollment)
    })

    // Sort each course group alphabetically by student name
    Object.keys(groupedByCourse).forEach((courseName) => {
      groupedByCourse[courseName].sort((a, b) => a.student_name.localeCompare(b.student_name))
    })

    if (format === "csv") {
      // Generate CSV
      let csv = "Curso,Nome do Aluno,CPF,Data de Nascimento,Email,Telefone,Status,Protocolo,Data de Inscrição\n"

      Object.keys(groupedByCourse)
        .sort()
        .forEach((courseName) => {
          groupedByCourse[courseName].forEach((enrollment) => {
            csv += `"${courseName}","${enrollment.student_name}","${enrollment.student_cpf || ""}","${new Date(enrollment.date_of_birth).toLocaleDateString("pt-BR")}","${enrollment.email}","${enrollment.phone_main}","${enrollment.status}","${enrollment.protocol_number}","${new Date(enrollment.created_at).toLocaleDateString("pt-BR")}"\n`
          })
        })

      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="inscricoes_${course}_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    } else {
      // Generate PDF
      const doc = new PDFDocument({ margin: 40, size: "A4" })
      const chunks: Buffer[] = []

      doc.on("data", (chunk) => chunks.push(chunk))

      // Title
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("Relatório de Inscrições - Processo Seletivo 2026", { align: "center" })
      doc.moveDown()
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`, {
          align: "center",
        })
      doc.moveDown()

      if (course !== "all") {
        doc.fontSize(12).font("Helvetica-Bold").text(`Curso: ${course}`, { align: "center" })
        doc.moveDown()
      }

      if (status !== "all") {
        doc.fontSize(12).font("Helvetica-Bold").text(`Status: ${status}`, { align: "center" })
        doc.moveDown()
      }

      doc.fontSize(10).font("Helvetica").text(`Total de Inscrições: ${enrollments.length}`, { align: "center" })
      doc.moveDown(2)

      // Iterate through courses
      const sortedCourses = Object.keys(groupedByCourse).sort()

      sortedCourses.forEach((courseName, courseIndex) => {
        const courseEnrollments = groupedByCourse[courseName]

        // Course header
        doc.fontSize(14).font("Helvetica-Bold").fillColor("#1e40af").text(courseName)
        doc.fontSize(10).font("Helvetica").fillColor("#000000").text(`Total: ${courseEnrollments.length} alunos`)
        doc.moveDown()

        // Table header
        const tableTop = doc.y
        const colWidths = {
          num: 30,
          name: 180,
          cpf: 90,
          status: 70,
          protocol: 100,
        }

        doc.fontSize(9).font("Helvetica-Bold")
        doc.text("#", 40, tableTop, { width: colWidths.num, continued: true })
        doc.text("Nome do Aluno", 40 + colWidths.num, tableTop, { width: colWidths.name, continued: true })
        doc.text("CPF", 40 + colWidths.num + colWidths.name, tableTop, { width: colWidths.cpf, continued: true })
        doc.text("Status", 40 + colWidths.num + colWidths.name + colWidths.cpf, tableTop, {
          width: colWidths.status,
          continued: true,
        })
        doc.text("Protocolo", 40 + colWidths.num + colWidths.name + colWidths.cpf + colWidths.status, tableTop, {
          width: colWidths.protocol,
        })

        doc.moveDown(0.5)
        doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke()
        doc.moveDown(0.5)

        // Table rows
        courseEnrollments.forEach((enrollment, index) => {
          // Check if we need a new page
          if (doc.y > 700) {
            doc.addPage()
            doc.fontSize(12).font("Helvetica-Bold").fillColor("#1e40af").text(`${courseName} (continuação)`)
            doc.moveDown()
          }

          const rowY = doc.y
          doc.fontSize(8).font("Helvetica").fillColor("#000000")

          doc.text(`${index + 1}`, 40, rowY, { width: colWidths.num, continued: true })
          doc.text(enrollment.student_name, 40 + colWidths.num, rowY, { width: colWidths.name, continued: true })
          doc.text(enrollment.student_cpf || "N/A", 40 + colWidths.num + colWidths.name, rowY, {
            width: colWidths.cpf,
            continued: true,
          })
          doc.text(enrollment.status, 40 + colWidths.num + colWidths.name + colWidths.cpf, rowY, {
            width: colWidths.status,
            continued: true,
          })
          doc.text(
            enrollment.protocol_number,
            40 + colWidths.num + colWidths.name + colWidths.cpf + colWidths.status,
            rowY,
            {
              width: colWidths.protocol,
            },
          )

          doc.moveDown(0.8)
        })

        doc.moveDown()
        doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke()
        doc.moveDown(2)

        // Add page break between courses (except last one)
        if (courseIndex < sortedCourses.length - 1 && doc.y > 600) {
          doc.addPage()
        }
      })

      // Footer
      const pages = doc.bufferedPageRange()
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i)
        doc
          .fontSize(8)
          .font("Helvetica")
          .text(`Página ${i + 1} de ${pages.count}`, 40, doc.page.height - 50, {
            align: "center",
          })
      }

      doc.end()

      const pdfBuffer = await new Promise<Buffer>((resolve) => {
        doc.on("end", () => {
          resolve(Buffer.concat(chunks))
        })
      })

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="relatorio_inscricoes_${course}_${new Date().toISOString().split("T")[0]}.pdf"`,
        },
      })
    }
  } catch (error) {
    console.error("[v0] Export error:", error)
    return NextResponse.json({ error: "Erro ao gerar exportação" }, { status: 500 })
  }
}
