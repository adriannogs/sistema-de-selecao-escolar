"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { getSocioeconomicForm, saveSocioeconomicForm } from "@/app/actions/socioeconomic"

interface SocioeconomicFormProps {
  enrollmentId: string
  studentName: string
  onClose: () => void
}

interface FormData {
  family_income: string
  number_of_residents: string
  housing_type: string
  housing_conditions: string
  has_electricity: boolean
  has_water: boolean
  has_sewage: boolean
  has_internet: boolean
  transportation_type: string
  receives_bolsa_familia: boolean
  receives_other_benefits: boolean
  other_benefits_description: string
  has_health_insurance: boolean
  health_insurance_type: string
  has_special_needs: boolean
  special_needs_description: string
  guardian1_education: string
  guardian1_occupation: string
  guardian2_education: string
  guardian2_occupation: string
  additional_info: string
}

export function SocioeconomicForm({ enrollmentId, studentName, onClose }: SocioeconomicFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState<FormData>({
    family_income: "",
    number_of_residents: "",
    housing_type: "",
    housing_conditions: "",
    has_electricity: true,
    has_water: true,
    has_sewage: true,
    has_internet: false,
    transportation_type: "",
    receives_bolsa_familia: false,
    receives_other_benefits: false,
    other_benefits_description: "",
    has_health_insurance: false,
    health_insurance_type: "",
    has_special_needs: false,
    special_needs_description: "",
    guardian1_education: "",
    guardian1_occupation: "",
    guardian2_education: "",
    guardian2_occupation: "",
    additional_info: "",
  })

  useEffect(() => {
    fetchExistingData()
  }, [enrollmentId])

  const fetchExistingData = async () => {
    try {
      const result = await getSocioeconomicForm(enrollmentId)

      if (result.data) {
        setFormData(result.data)
      }
    } catch (err) {
      console.error("[v0] Error fetching socioeconomic data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      const result = await saveSocioeconomicForm(enrollmentId, formData)

      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulário Socioeconômico</CardTitle>
        <CardDescription>Aluno: {studentName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Formulário salvo com sucesso!</AlertDescription>
            </Alert>
          )}

          {/* Renda Familiar */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Renda Familiar</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="family_income">Renda Familiar Mensal</Label>
                <Select value={formData.family_income} onValueChange={(value) => updateField("family_income", value)}>
                  <SelectTrigger id="family_income">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ate_1_salario">Até 1 salário mínimo</SelectItem>
                    <SelectItem value="1_a_2_salarios">1 a 2 salários mínimos</SelectItem>
                    <SelectItem value="2_a_3_salarios">2 a 3 salários mínimos</SelectItem>
                    <SelectItem value="3_a_5_salarios">3 a 5 salários mínimos</SelectItem>
                    <SelectItem value="acima_5_salarios">Acima de 5 salários mínimos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="number_of_residents">Número de Moradores</Label>
                <Input
                  id="number_of_residents"
                  type="number"
                  value={formData.number_of_residents}
                  onChange={(e) => updateField("number_of_residents", e.target.value)}
                  placeholder="Ex: 4"
                />
              </div>
            </div>
          </div>

          {/* Moradia */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Moradia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="housing_type">Tipo de Moradia</Label>
                <Select value={formData.housing_type} onValueChange={(value) => updateField("housing_type", value)}>
                  <SelectTrigger id="housing_type">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="propria">Própria</SelectItem>
                    <SelectItem value="alugada">Alugada</SelectItem>
                    <SelectItem value="cedida">Cedida</SelectItem>
                    <SelectItem value="financiada">Financiada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="housing_conditions">Condições da Moradia</Label>
                <Select
                  value={formData.housing_conditions}
                  onValueChange={(value) => updateField("housing_conditions", value)}
                >
                  <SelectTrigger id="housing_conditions">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boa">Boa</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="precaria">Precária</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Serviços Básicos</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_electricity"
                    checked={formData.has_electricity}
                    onCheckedChange={(checked) => updateField("has_electricity", checked)}
                  />
                  <Label htmlFor="has_electricity" className="font-normal cursor-pointer">
                    Energia Elétrica
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_water"
                    checked={formData.has_water}
                    onCheckedChange={(checked) => updateField("has_water", checked)}
                  />
                  <Label htmlFor="has_water" className="font-normal cursor-pointer">
                    Água Encanada
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_sewage"
                    checked={formData.has_sewage}
                    onCheckedChange={(checked) => updateField("has_sewage", checked)}
                  />
                  <Label htmlFor="has_sewage" className="font-normal cursor-pointer">
                    Esgoto
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has_internet"
                    checked={formData.has_internet}
                    onCheckedChange={(checked) => updateField("has_internet", checked)}
                  />
                  <Label htmlFor="has_internet" className="font-normal cursor-pointer">
                    Internet
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Transporte */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Transporte</h3>
            <div className="space-y-2">
              <Label htmlFor="transportation_type">Meio de Transporte Principal</Label>
              <Input
                id="transportation_type"
                value={formData.transportation_type}
                onChange={(e) => updateField("transportation_type", e.target.value)}
                placeholder="Ex: Ônibus, Carro próprio, A pé, Bicicleta"
              />
            </div>
          </div>

          {/* Benefícios Sociais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Benefícios Sociais</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="receives_bolsa_familia"
                  checked={formData.receives_bolsa_familia}
                  onCheckedChange={(checked) => updateField("receives_bolsa_familia", checked)}
                />
                <Label htmlFor="receives_bolsa_familia" className="font-normal cursor-pointer">
                  Recebe Bolsa Família
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="receives_other_benefits"
                  checked={formData.receives_other_benefits}
                  onCheckedChange={(checked) => updateField("receives_other_benefits", checked)}
                />
                <Label htmlFor="receives_other_benefits" className="font-normal cursor-pointer">
                  Recebe Outros Benefícios
                </Label>
              </div>
              {formData.receives_other_benefits && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="other_benefits_description">Descreva os Benefícios</Label>
                  <Textarea
                    id="other_benefits_description"
                    value={formData.other_benefits_description}
                    onChange={(e) => updateField("other_benefits_description", e.target.value)}
                    placeholder="Descreva quais benefícios recebe"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Saúde */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Saúde</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_health_insurance"
                  checked={formData.has_health_insurance}
                  onCheckedChange={(checked) => updateField("has_health_insurance", checked)}
                />
                <Label htmlFor="has_health_insurance" className="font-normal cursor-pointer">
                  Possui Plano de Saúde
                </Label>
              </div>
              {formData.has_health_insurance && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="health_insurance_type">Tipo de Plano</Label>
                  <Input
                    id="health_insurance_type"
                    value={formData.health_insurance_type}
                    onChange={(e) => updateField("health_insurance_type", e.target.value)}
                    placeholder="Nome do plano de saúde"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_special_needs"
                  checked={formData.has_special_needs}
                  onCheckedChange={(checked) => updateField("has_special_needs", checked)}
                />
                <Label htmlFor="has_special_needs" className="font-normal cursor-pointer">
                  Possui Necessidades Especiais
                </Label>
              </div>
              {formData.has_special_needs && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="special_needs_description">Descreva as Necessidades</Label>
                  <Textarea
                    id="special_needs_description"
                    value={formData.special_needs_description}
                    onChange={(e) => updateField("special_needs_description", e.target.value)}
                    placeholder="Descreva as necessidades especiais"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Educação dos Responsáveis */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Educação e Ocupação dos Responsáveis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guardian1_education">Escolaridade - Responsável 1</Label>
                <Select
                  value={formData.guardian1_education}
                  onValueChange={(value) => updateField("guardian1_education", value)}
                >
                  <SelectTrigger id="guardian1_education">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fundamental_incompleto">Fundamental Incompleto</SelectItem>
                    <SelectItem value="fundamental_completo">Fundamental Completo</SelectItem>
                    <SelectItem value="medio_incompleto">Médio Incompleto</SelectItem>
                    <SelectItem value="medio_completo">Médio Completo</SelectItem>
                    <SelectItem value="superior_incompleto">Superior Incompleto</SelectItem>
                    <SelectItem value="superior_completo">Superior Completo</SelectItem>
                    <SelectItem value="pos_graduacao">Pós-graduação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardian1_occupation">Ocupação - Responsável 1</Label>
                <Input
                  id="guardian1_occupation"
                  value={formData.guardian1_occupation}
                  onChange={(e) => updateField("guardian1_occupation", e.target.value)}
                  placeholder="Profissão ou ocupação"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardian2_education">Escolaridade - Responsável 2</Label>
                <Select
                  value={formData.guardian2_education}
                  onValueChange={(value) => updateField("guardian2_education", value)}
                >
                  <SelectTrigger id="guardian2_education">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fundamental_incompleto">Fundamental Incompleto</SelectItem>
                    <SelectItem value="fundamental_completo">Fundamental Completo</SelectItem>
                    <SelectItem value="medio_incompleto">Médio Incompleto</SelectItem>
                    <SelectItem value="medio_completo">Médio Completo</SelectItem>
                    <SelectItem value="superior_incompleto">Superior Incompleto</SelectItem>
                    <SelectItem value="superior_completo">Superior Completo</SelectItem>
                    <SelectItem value="pos_graduacao">Pós-graduação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardian2_occupation">Ocupação - Responsável 2</Label>
                <Input
                  id="guardian2_occupation"
                  value={formData.guardian2_occupation}
                  onChange={(e) => updateField("guardian2_occupation", e.target.value)}
                  placeholder="Profissão ou ocupação"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Informações Adicionais</h3>
            <div className="space-y-2">
              <Label htmlFor="additional_info">Observações</Label>
              <Textarea
                id="additional_info"
                value={formData.additional_info}
                onChange={(e) => updateField("additional_info", e.target.value)}
                placeholder="Informações adicionais relevantes"
                rows={4}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Formulário"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
