"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface EnrollmentData {
  id: string
  protocol_number: string
  status: string
  created_at: string
  student_name: string
  email: string
  phone_main: string
  date_of_birth: string
  student_cpf?: string
  school_of_origin: string
  course_name?: string
}

export default function VerificationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const protocolNumber = searchParams.get("protocolNumber")
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null)
  const [loading, setLoading] = useState(!!protocolNumber)
  const [error, setError] = useState("")
  const [inputProtocolo, setInputProtocolo] = useState(protocolNumber || "")
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const fetchEnrollment = async (p: string) => {
    if (!p.trim()) {
      setError("Por favor, digite um protocolo")
      return
    }

    setLoading(true)
    setError("")
    setEnrollmentData(null)

    try {
      const response = await fetch(`/api/enroll/search?protocolNumber=${encodeURIComponent(p)}`)

      if (!response.ok) {
        throw new Error("Inscrição não encontrada")
      }

      const data = await response.json()
      setEnrollmentData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar inscrição")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (protocolNumber) {
      fetchEnrollment(protocolNumber)
    }
  }, [protocolNumber])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchEnrollment(inputProtocolo)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: "bg-yellow-100 text-yellow-800",
      analisado: "bg-blue-100 text-blue-800",
      aceito: "bg-green-100 text-green-800",
      recusado: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusDescription = (status: string) => {
    const descriptions: Record<string, string> = {
      pendente: "Sua inscrição foi recebida e aguarda análise",
      analisado: "Sua inscrição está sendo analisada",
      aceito: "Parabéns! Sua inscrição foi aceita",
      recusado: "Infelizmente sua inscrição foi recusada",
    }
    return descriptions[status] || "Status desconhecido"
  }

  const handleDownloadPdf = async () => {
    if (!enrollmentData) return

    setDownloadingPdf(true)
    try {
      const response = await fetch(`/api/pdf/${enrollmentData.id}`)

      if (!response.ok) {
        throw new Error("Erro ao baixar PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ficha_inscricao_${enrollmentData.protocol_number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Error downloading PDF:", err)
      setError("Erro ao baixar o PDF. Tente novamente.")
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Verificar Inscrição - Processo Seletivo 2026</h1>
          <p className="text-lg text-muted-foreground">EP Lúcia Baltazar</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Digite seu protocolo de inscrição</CardTitle>
            <CardDescription>Use o protocolo enviado por email ou escaneie o código QR no PDF</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: 202611-1234"
                  value={inputProtocolo}
                  onChange={(e) => setInputProtocolo(e.target.value.toUpperCase())}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    "Buscar"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {enrollmentData && !loading && (
          <div className="space-y-4">
            <Card className={enrollmentData.status === "aceito" ? "border-green-200 bg-green-50" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle>Inscrição Encontrada</CardTitle>
                    <CardDescription>{enrollmentData.protocol_number}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(enrollmentData.status)}>{enrollmentData.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {enrollmentData.status === "aceito" && (
                  <div className="flex gap-3 bg-green-100 p-4 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-900">Inscrição Aceita!</p>
                      <p className="text-sm text-green-800">Sua inscrição foi aprovada. Parabéns!</p>
                    </div>
                  </div>
                )}

                {enrollmentData.status === "recusado" && (
                  <div className="flex gap-3 bg-red-100 p-4 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-900">Inscrição Recusada</p>
                      <p className="text-sm text-red-800">
                        Infelizmente sua inscrição não foi aprovada. Entre em contato com a escola para mais
                        informações.
                      </p>
                    </div>
                  </div>
                )}

                {(enrollmentData.status === "pendente" || enrollmentData.status === "analisado") && (
                  <div className="flex gap-3 bg-blue-100 p-4 rounded-lg">
                    <Loader2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
                    <div>
                      <p className="font-semibold text-blue-900">Em Processamento</p>
                      <p className="text-sm text-blue-800">{getStatusDescription(enrollmentData.status)}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Informações Pessoais</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Nome</p>
                        <p className="font-medium">{enrollmentData.student_name}</p>
                      </div>
                      {enrollmentData.course_name && (
                        <div>
                          <p className="text-muted-foreground">Curso</p>
                          <p className="font-medium">{enrollmentData.course_name}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium text-sm">{enrollmentData.email}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Telefone</p>
                        <p className="font-medium">{enrollmentData.phone_main}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Escola de Origem</p>
                        <p className="font-medium text-sm">{enrollmentData.school_of_origin}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Data da Inscrição</h4>
                    <p className="text-sm">{new Date(enrollmentData.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleDownloadPdf} disabled={downloadingPdf} className="flex-1">
                      {downloadingPdf ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Baixando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Baixar PDF
                        </>
                      )}
                    </Button>
                    <Button variant="outline" asChild className="flex-1 bg-transparent">
                      <Link href="/">Voltar</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!enrollmentData && !loading && inputProtocolo && !error && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Digite seu protocolo e clique em "Buscar" para verificar o status da sua inscrição
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
