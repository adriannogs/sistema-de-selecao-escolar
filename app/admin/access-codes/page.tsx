"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Download, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AccessCodeStats {
  total: number
  used: number
  available: number
}

export default function AccessCodesPage() {
  const [stats, setStats] = useState<AccessCodeStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const [exportFilter, setExportFilter] = useState<"unused" | "all">("unused")

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/access-codes/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError("Erro ao carregar estatísticas")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleGenerateCodes = async () => {
    if (!confirm("Deseja gerar 1.000 novos códigos de acesso?")) return

    setIsGenerating(true)
    setError("")

    try {
      const response = await fetch("/api/admin/access-codes/generate", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to generate codes")

      const result = await response.json()
      alert(`${result.count} códigos gerados com sucesso!`)
      fetchStats()
    } catch (err) {
      setError("Erro ao gerar códigos")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      const response = await fetch(`/api/admin/access-codes/export-pdf?filter=${exportFilter}`)

      if (!response.ok) throw new Error("Failed to export PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `codigos_acesso_${exportFilter}_${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError("Erro ao exportar PDF")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Códigos de Acesso</h1>
        <p className="text-muted-foreground">Gere e exporte códigos de acesso para distribuição aos alunos</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Códigos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Códigos Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.used || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-blue-600" />
              Códigos Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.available || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gerar Novos Códigos</CardTitle>
            <CardDescription>Gere 1.000 códigos de acesso únicos para distribuição</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateCodes} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Gerar 1.000 Códigos
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exportar Códigos em PDF</CardTitle>
            <CardDescription>Baixe um PDF com os códigos para distribuição</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filtro de Exportação</label>
              <Select value={exportFilter} onValueChange={(value: "unused" | "all") => setExportFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unused">Apenas Códigos Não Utilizados</SelectItem>
                  <SelectItem value="all">Todos os Códigos (com status)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleExportPDF} className="w-full bg-transparent" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
