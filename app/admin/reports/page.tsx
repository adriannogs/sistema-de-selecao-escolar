"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileText, Download, Users, School, Accessibility, Lock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ReportsPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const savedApiKey = localStorage.getItem("admin_api_key")
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("admin_api_key", apiKey)
    }
  }, [apiKey])

  const downloadReport = async (endpoint: string, filename: string) => {
    if (!apiKey) {
      setError("Por favor, insira a chave API para acessar os relatórios")
      return
    }

    setLoading(filename)
    setError("")
    try {
      const response = await fetch(endpoint, {
        headers: {
          "x-api-key": apiKey,
        },
      })

      if (response.status === 401) {
        setError("Chave API inválida. Verifique e tente novamente.")
        setLoading(null)
        return
      }

      if (!response.ok) throw new Error("Erro ao gerar relatório")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error downloading report:", error)
      setError("Erro ao baixar relatório. Tente novamente.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Relatórios</h1>
            <p className="text-lg text-muted-foreground">Gerar relatórios e exportar dados</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Voltar ao Painel</Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Autenticação
            </CardTitle>
            <CardDescription>
              {apiKey
                ? "Chave API configurada (mesma do painel administrativo)"
                : "Insira a chave API para acessar os relatórios protegidos"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Digite sua chave API"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setError("")
                }}
              />
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {apiKey && (
                <p className="text-sm text-muted-foreground">
                  ✓ Usando a mesma chave de acesso do painel administrativo
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {apiKey ? (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Enrollment Forms Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Fichas de Matrícula
                </CardTitle>
                <CardDescription>Relatórios de fichas impressas e pendentes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() =>
                    downloadReport("/api/admin/reports/enrollment-forms?filter=printed", "fichas-impressas.pdf")
                  }
                  disabled={loading === "fichas-impressas.pdf"}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading === "fichas-impressas.pdf" ? "Gerando..." : "Fichas Já Impressas"}
                </Button>
                <Button
                  onClick={() =>
                    downloadReport("/api/admin/reports/enrollment-forms?filter=not-printed", "fichas-pendentes.pdf")
                  }
                  disabled={loading === "fichas-pendentes.pdf"}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading === "fichas-pendentes.pdf" ? "Gerando..." : "Fichas Pendentes"}
                </Button>
                <Button
                  onClick={() => downloadReport("/api/admin/reports/enrollment-forms", "todas-fichas.pdf")}
                  disabled={loading === "todas-fichas.pdf"}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading === "todas-fichas.pdf" ? "Gerando..." : "Todas as Fichas"}
                </Button>
              </CardContent>
            </Card>

            {/* Location-based Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Alunos por Localização
                </CardTitle>
                <CardDescription>Moradores do bairro por tipo de escola</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() =>
                    downloadReport("/api/admin/reports/by-location?schoolType=public", "escola-publica-bairro.pdf")
                  }
                  disabled={loading === "escola-publica-bairro.pdf"}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading === "escola-publica-bairro.pdf" ? "Gerando..." : "Escola Pública + Bairro"}
                </Button>
                <Button
                  onClick={() =>
                    downloadReport("/api/admin/reports/by-location?schoolType=private", "escola-particular-bairro.pdf")
                  }
                  disabled={loading === "escola-particular-bairro.pdf"}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading === "escola-particular-bairro.pdf" ? "Gerando..." : "Escola Particular + Bairro"}
                </Button>
              </CardContent>
            </Card>

            {/* PCD Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Accessibility className="h-5 w-5" />
                  Alunos PCD
                </CardTitle>
                <CardDescription>Relatório de alunos com deficiência</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => downloadReport("/api/admin/reports/pcd", "alunos-pcd.pdf")}
                  disabled={loading === "alunos-pcd.pdf"}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading === "alunos-pcd.pdf" ? "Gerando..." : "Relatório Completo PCD"}
                </Button>
              </CardContent>
            </Card>

            {/* All Students Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Relatórios Gerais
                </CardTitle>
                <CardDescription>Outros relatórios disponíveis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/admin/access-codes">
                    <FileText className="h-4 w-4 mr-2" />
                    Códigos de Acesso
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Insira a chave API acima para acessar os relatórios</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
