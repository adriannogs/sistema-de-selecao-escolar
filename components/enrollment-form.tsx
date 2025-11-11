"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Loader2, ChevronRight, ChevronLeft, Lock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"

const COURSES = [
  "TÉCNICO EM ADMINISTRAÇÃO",
  "TÉCNICO EM DESENVOLVIMENTO DE SISTEMAS",
  "TÉCNICO EM EDIFICAÇÕES",
  "TÉCNICO EM MASSOTERAPIA",
]

const STATES = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]

interface FormData {
  codigoAcesso: string

  // Student data
  nomeCompleto: string
  dataNascimento: string
  rg: string
  cpf: string
  nis: string

  // Address
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  cep: string

  // Schools (6th, 7th, 8th grade)
  escola6Nome: string
  escola6Rede: string
  escola7Nome: string
  escola7Rede: string
  escola8Nome: string
  escola8Rede: string

  // School of origin (9th grade)
  escola9Nome: string
  escola9Rede: string

  // Competition type (multiple checkboxes)
  tipoEscolaPublica: boolean
  tipoEscolaPrivada: boolean
  moraBairro: boolean
  pcd: boolean

  // Contacts
  telefone: string
  whatsapp: string

  // Parents
  paiNome: string
  paiRg: string
  paiCpf: string
  paiTelefone: string
  maeNome: string
  maeRg: string
  maeCpf: string
  maeTelefone: string

  // Responsible
  responsavelTipo: string // 'pai', 'mae', 'outros'
  outroResponsavelNome: string
  outroResponsavelParentesco: string
  outroResponsavelRg: string
  outroResponsavelCpf: string
  outroResponsavelTelefone: string
}

const STEPS = [
  "Código de Acesso",
  "Dados do Aluno",
  "Endereço",
  "Histórico Escolar",
  "Tipo de Concorrência",
  "Contatos",
  "Filiação",
  "Responsável",
  "Revisão",
]

function StepAccessCode({ formData, onChange }: { formData: FormData; onChange: (data: Partial<FormData>) => void }) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationMessage, setValidationMessage] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const upperValue = value.toUpperCase()
    onChange({ codigoAcesso: upperValue })
    setValidationMessage(null)
  }

  const validateCode = async () => {
    if (!formData.codigoAcesso || formData.codigoAcesso.length < 8) {
      setValidationMessage({ type: "error", message: "Por favor, insira um código válido" })
      return
    }

    setIsValidating(true)
    setValidationMessage(null)

    try {
      const response = await fetch("/api/validate-access-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: formData.codigoAcesso }),
      })

      const result = await response.json()

      if (response.ok && result.valid) {
        setValidationMessage({ type: "success", message: "Código válido! Você pode prosseguir com a inscrição." })
      } else {
        setValidationMessage({
          type: "error",
          message: result.message || "Código inválido ou já utilizado. Verifique e tente novamente.",
        })
      }
    } catch (error) {
      setValidationMessage({ type: "error", message: "Erro ao validar código. Tente novamente." })
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Código de Acesso</h3>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Para realizar sua inscrição, você precisa de um código de acesso válido. Este código foi fornecido pela
          escola. Se você não possui um código, entre em contato com a secretaria.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="codigoAcesso">Código de Acesso *</Label>
        <div className="flex gap-2">
          <Input
            id="codigoAcesso"
            name="codigoAcesso"
            placeholder="EP26-XXXX-XXXX"
            value={formData.codigoAcesso}
            onChange={handleInputChange}
            required
            className="uppercase font-mono"
            maxLength={14}
          />
          <Button
            type="button"
            onClick={validateCode}
            disabled={isValidating || !formData.codigoAcesso}
            variant="outline"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              "Validar"
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Digite o código exatamente como foi fornecido, incluindo os hífens.
        </p>
      </div>

      {validationMessage && (
        <Alert
          variant={validationMessage.type === "error" ? "destructive" : "default"}
          className={validationMessage.type === "success" ? "border-green-500 bg-green-50" : ""}
        >
          {validationMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className={validationMessage.type === "success" ? "text-green-700" : ""}>
            {validationMessage.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function StepStudentData({ formData, onChange }: { formData: FormData; onChange: (data: Partial<FormData>) => void }) {
  const [calculatedAge, setCalculatedAge] = useState<string>("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onChange({ [name]: value })

    if (name === "dataNascimento" && value) {
      calculateAge(value)
    }
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) {
      setCalculatedAge("")
      return
    }

    const birth = new Date(birthDate)
    const today = new Date()

    let years = today.getFullYear() - birth.getFullYear()
    let months = today.getMonth() - birth.getMonth()

    if (months < 0) {
      years--
      months += 12
    }

    if (today.getDate() < birth.getDate()) {
      months--
      if (months < 0) {
        years--
        months += 12
      }
    }

    setCalculatedAge(`${years} ano(s) e ${months} mês(es)`)
  }

  useEffect(() => {
    if (formData.dataNascimento) {
      calculateAge(formData.dataNascimento)
    }
  }, [formData.dataNascimento])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Dados do Aluno</h3>

      <div className="space-y-2">
        <Label htmlFor="nome">Nome Completo *</Label>
        <Input
          id="nome"
          name="nomeCompleto"
          placeholder="Digite o nome completo"
          value={formData.nomeCompleto}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dataNasc">Data de Nascimento *</Label>
        <Input
          id="dataNasc"
          type="date"
          name="dataNascimento"
          value={formData.dataNascimento}
          onChange={handleInputChange}
          required
        />
        {calculatedAge && <p className="text-sm text-blue-600 font-medium mt-1">Idade: {calculatedAge}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rg">RG</Label>
          <Input id="rg" name="rg" placeholder="00.000.000-0" value={formData.rg} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" name="cpf" placeholder="000.000.000-00" value={formData.cpf} onChange={handleInputChange} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nis">NIS</Label>
        <Input id="nis" name="nis" placeholder="000.00000.00-0" value={formData.nis} onChange={handleInputChange} />
      </div>
    </div>
  )
}

function StepAddress({ formData, onChange }: { formData: FormData; onChange: (data: Partial<FormData>) => void }) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onChange({ [name]: value })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Endereço</h3>

      <div className="space-y-2">
        <Label htmlFor="rua">Rua *</Label>
        <Input
          id="rua"
          name="rua"
          placeholder="Nome da rua"
          value={formData.rua}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numero">Número *</Label>
          <Input
            id="numero"
            name="numero"
            placeholder="123"
            value={formData.numero}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="comp">Complemento</Label>
          <Input
            id="comp"
            name="complemento"
            placeholder="Apto, sala..."
            value={formData.complemento}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro *</Label>
          <Input
            id="bairro"
            name="bairro"
            placeholder="Nome do bairro"
            value={formData.bairro}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade *</Label>
          <Input
            id="cidade"
            name="cidade"
            placeholder="Nome da cidade"
            value={formData.cidade}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cep">CEP *</Label>
          <Input
            id="cep"
            name="cep"
            placeholder="00000-000"
            value={formData.cep}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estado">Estado *</Label>
          <Select value={formData.estado} onValueChange={(value) => onChange({ estado: value })}>
            <SelectTrigger id="estado" required>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

function StepSchoolHistory({
  formData,
  onChange,
}: { formData: FormData; onChange: (data: Partial<FormData>) => void }) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onChange({ [name]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Escola onde Cursou Ensino Fundamental</h3>

        {/* 6th Grade */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium mb-3">6º Ano</h4>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="escola6Nome">Nome da Escola *</Label>
              <Input
                id="escola6Nome"
                name="escola6Nome"
                placeholder="Nome da escola"
                value={formData.escola6Nome}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escola6Rede">Rede *</Label>
              <Select value={formData.escola6Rede} onValueChange={(value) => onChange({ escola6Rede: value })}>
                <SelectTrigger id="escola6Rede" required>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pública">Pública</SelectItem>
                  <SelectItem value="Privada">Privada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 7th Grade */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium mb-3">7º Ano</h4>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="escola7Nome">Nome da Escola *</Label>
              <Input
                id="escola7Nome"
                name="escola7Nome"
                placeholder="Nome da escola"
                value={formData.escola7Nome}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escola7Rede">Rede *</Label>
              <Select value={formData.escola7Rede} onValueChange={(value) => onChange({ escola7Rede: value })}>
                <SelectTrigger id="escola7Rede" required>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pública">Pública</SelectItem>
                  <SelectItem value="Privada">Privada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 8th Grade */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium mb-3">8º Ano</h4>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="escola8Nome">Nome da Escola *</Label>
              <Input
                id="escola8Nome"
                name="escola8Nome"
                placeholder="Nome da escola"
                value={formData.escola8Nome}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escola8Rede">Rede *</Label>
              <Select value={formData.escola8Rede} onValueChange={(value) => onChange({ escola8Rede: value })}>
                <SelectTrigger id="escola8Rede" required>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pública">Pública</SelectItem>
                  <SelectItem value="Privada">Privada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Escola de Origem</h3>

        {/* 9th Grade */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">9º Ano</h4>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="escola9Nome">Nome da Escola *</Label>
              <Input
                id="escola9Nome"
                name="escola9Nome"
                placeholder="Nome da escola"
                value={formData.escola9Nome}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escola9Rede">Rede *</Label>
              <Select value={formData.escola9Rede} onValueChange={(value) => onChange({ escola9Rede: value })}>
                <SelectTrigger id="escola9Rede" required>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pública">Pública</SelectItem>
                  <SelectItem value="Privada">Privada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepCompetitionType({
  formData,
  onChange,
}: { formData: FormData; onChange: (data: Partial<FormData>) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Tipo de Concorrência</h3>
      <p className="text-sm text-muted-foreground mb-4">Selecione todas as opções que se aplicam ao seu caso:</p>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="tipoEscolaPublica"
            checked={formData.tipoEscolaPublica}
            onCheckedChange={(checked) => onChange({ tipoEscolaPublica: checked as boolean })}
          />
          <Label htmlFor="tipoEscolaPublica" className="cursor-pointer">
            Escola Pública
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="tipoEscolaPrivada"
            checked={formData.tipoEscolaPrivada}
            onCheckedChange={(checked) => onChange({ tipoEscolaPrivada: checked as boolean })}
          />
          <Label htmlFor="tipoEscolaPrivada" className="cursor-pointer">
            Escola Privada
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="moraBairro"
            checked={formData.moraBairro}
            onCheckedChange={(checked) => onChange({ moraBairro: checked as boolean })}
          />
          <Label htmlFor="moraBairro" className="cursor-pointer">
            Mora no Bairro da Escola
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="pcd"
            checked={formData.pcd}
            onCheckedChange={(checked) => onChange({ pcd: checked as boolean })}
          />
          <Label htmlFor="pcd" className="cursor-pointer">
            PCD (Pessoa com Deficiência)
          </Label>
        </div>
      </div>
    </div>
  )
}

function StepContacts({ formData, onChange }: { formData: FormData; onChange: (data: Partial<FormData>) => void }) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onChange({ [name]: value })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Contatos</h3>

      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone Principal *</Label>
        <Input
          id="telefone"
          name="telefone"
          placeholder="(00) 00000-0000"
          value={formData.telefone}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp">WhatsApp</Label>
        <Input
          id="whatsapp"
          name="whatsapp"
          placeholder="(00) 00000-0000"
          value={formData.whatsapp}
          onChange={handleInputChange}
        />
      </div>
    </div>
  )
}

function StepParents({ formData, onChange }: { formData: FormData; onChange: (data: Partial<FormData>) => void }) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onChange({ [name]: value })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Filiação</h3>

      {/* Father */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Pai</h4>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="paiNome">Nome Completo do Pai</Label>
            <Input
              id="paiNome"
              name="paiNome"
              placeholder="Nome completo"
              value={formData.paiNome}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paiRg">RG</Label>
              <Input
                id="paiRg"
                name="paiRg"
                placeholder="00.000.000-0"
                value={formData.paiRg}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paiCpf">CPF</Label>
              <Input
                id="paiCpf"
                name="paiCpf"
                placeholder="000.000.000-00"
                value={formData.paiCpf}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paiTelefone">Telefone</Label>
            <Input
              id="paiTelefone"
              name="paiTelefone"
              placeholder="(00) 00000-0000"
              value={formData.paiTelefone}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Mother */}
      <div className="bg-pink-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">Mãe</h4>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="maeNome">Nome Completo da Mãe *</Label>
            <Input
              id="maeNome"
              name="maeNome"
              placeholder="Nome completo"
              value={formData.maeNome}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maeRg">RG</Label>
              <Input
                id="maeRg"
                name="maeRg"
                placeholder="00.000.000-0"
                value={formData.maeRg}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maeCpf">CPF</Label>
              <Input
                id="maeCpf"
                name="maeCpf"
                placeholder="000.000.000-00"
                value={formData.maeCpf}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maeTelefone">Telefone</Label>
            <Input
              id="maeTelefone"
              name="maeTelefone"
              placeholder="(00) 00000-0000"
              value={formData.maeTelefone}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StepResponsible({ formData, onChange }: { formData: FormData; onChange: (data: Partial<FormData>) => void }) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onChange({ [name]: value })
  }

  const showOtherResponsible = formData.responsavelTipo === "outros"

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Responsável pela Educação do Aluno</h3>

      <div className="space-y-2">
        <Label htmlFor="responsavelTipo">Responsável Principal *</Label>
        <Select value={formData.responsavelTipo} onValueChange={(value) => onChange({ responsavelTipo: value })}>
          <SelectTrigger id="responsavelTipo" required>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pai">Pai</SelectItem>
            <SelectItem value="mae">Mãe</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showOtherResponsible && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Outro Responsável pela Educação do Aluno</h4>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="outroResponsavelNome">Nome Completo *</Label>
              <Input
                id="outroResponsavelNome"
                name="outroResponsavelNome"
                placeholder="Nome completo"
                value={formData.outroResponsavelNome}
                onChange={handleInputChange}
                required={showOtherResponsible}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outroResponsavelParentesco">Parentesco *</Label>
              <Input
                id="outroResponsavelParentesco"
                name="outroResponsavelParentesco"
                placeholder="Ex: Tios, Avós, Primos, etc."
                value={formData.outroResponsavelParentesco}
                onChange={handleInputChange}
                required={showOtherResponsible}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="outroResponsavelRg">RG</Label>
                <Input
                  id="outroResponsavelRg"
                  name="outroResponsavelRg"
                  placeholder="00.000.000-0"
                  value={formData.outroResponsavelRg}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outroResponsavelCpf">CPF</Label>
                <Input
                  id="outroResponsavelCpf"
                  name="outroResponsavelCpf"
                  placeholder="000.000.000-00"
                  value={formData.outroResponsavelCpf}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="outroResponsavelTelefone">Telefone</Label>
              <Input
                id="outroResponsavelTelefone"
                name="outroResponsavelTelefone"
                placeholder="(00) 00000-0000"
                value={formData.outroResponsavelTelefone}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StepReview({
  formData,
  isSubmitting,
  onSubmit,
}: { formData: FormData; isSubmitting: boolean; onSubmit: () => void }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Revise seus dados antes de enviar</h3>

      <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Código de Acesso
          </h4>
          <div className="text-sm font-mono">{formData.codigoAcesso}</div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Dados do Aluno</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Nome:</span> {formData.nomeCompleto}
            </div>
            <div>
              <span className="text-muted-foreground">Data Nasc:</span> {formData.dataNascimento}
            </div>
            <div>
              <span className="text-muted-foreground">RG:</span> {formData.rg || "Não informado"}
            </div>
            <div>
              <span className="text-muted-foreground">CPF:</span> {formData.cpf || "Não informado"}
            </div>
            <div>
              <span className="text-muted-foreground">NIS:</span> {formData.nis || "Não informado"}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Endereço</h4>
          <p className="text-sm">
            {formData.rua}, {formData.numero} {formData.complemento && `- ${formData.complemento}`}
            <br />
            {formData.bairro}, {formData.cidade} - {formData.estado}
            <br />
            CEP: {formData.cep}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Histórico Escolar</h4>
          <div className="text-sm space-y-1">
            <div>
              <strong>6º Ano:</strong> {formData.escola6Nome} ({formData.escola6Rede})
            </div>
            <div>
              <strong>7º Ano:</strong> {formData.escola7Nome} ({formData.escola7Rede})
            </div>
            <div>
              <strong>8º Ano:</strong> {formData.escola8Nome} ({formData.escola8Rede})
            </div>
            <div>
              <strong>9º Ano:</strong> {formData.escola9Nome} ({formData.escola9Rede})
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Tipo de Concorrência</h4>
          <div className="text-sm space-y-1">
            {formData.tipoEscolaPublica && <div>✓ Escola Pública</div>}
            {formData.tipoEscolaPrivada && <div>✓ Escola Privada</div>}
            {formData.moraBairro && <div>✓ Mora no Bairro da Escola</div>}
            {formData.pcd && <div>✓ PCD</div>}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Contatos</h4>
          <div className="text-sm">
            <div>Telefone: {formData.telefone}</div>
            {formData.whatsapp && <div>WhatsApp: {formData.whatsapp}</div>}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Filiação</h4>
          <div className="text-sm space-y-2">
            {formData.paiNome && (
              <div>
                <strong>Pai:</strong> {formData.paiNome}
                {formData.paiTelefone && ` - Tel: ${formData.paiTelefone}`}
              </div>
            )}
            <div>
              <strong>Mãe:</strong> {formData.maeNome}
              {formData.maeTelefone && ` - Tel: ${formData.maeTelefone}`}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Responsável pela Educação</h4>
          <div className="text-sm">
            {formData.responsavelTipo === "pai" && <div>Pai</div>}
            {formData.responsavelTipo === "mae" && <div>Mãe</div>}
            {formData.responsavelTipo === "outros" && (
              <div>
                <div>
                  <strong>Outro Responsável:</strong> {formData.outroResponsavelNome}
                </div>
                <div>Parentesco: {formData.outroResponsavelParentesco}</div>
              </div>
            )}
          </div>
        </div>

        <Button onClick={onSubmit} disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            "Confirmar e Enviar"
          )}
        </Button>
      </div>
    </div>
  )
}

export function EnrollmentForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [protocolo, setProtocolo] = useState("")

  const [formData, setFormData] = useState<FormData>({
    codigoAcesso: "",
    nomeCompleto: "",
    dataNascimento: "",
    rg: "",
    cpf: "",
    nis: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    escola6Nome: "",
    escola6Rede: "Pública",
    escola7Nome: "",
    escola7Rede: "Pública",
    escola8Nome: "",
    escola8Rede: "Pública",
    escola9Nome: "",
    escola9Rede: "Pública",
    tipoEscolaPublica: false,
    tipoEscolaPrivada: false,
    moraBairro: false,
    pcd: false,
    telefone: "",
    whatsapp: "",
    paiNome: "",
    paiRg: "",
    paiCpf: "",
    paiTelefone: "",
    maeNome: "",
    maeRg: "",
    maeCpf: "",
    maeTelefone: "",
    responsavelTipo: "",
    outroResponsavelNome: "",
    outroResponsavelParentesco: "",
    outroResponsavelRg: "",
    outroResponsavelCpf: "",
    outroResponsavelTelefone: "",
  })

  const handleFormDataChange = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0: // Access code
        return formData.codigoAcesso !== "" && formData.codigoAcesso.length >= 8
      case 1: // Student data
        return formData.nomeCompleto !== "" && formData.dataNascimento !== ""
      case 2: // Address
        return (
          formData.rua !== "" &&
          formData.numero !== "" &&
          formData.bairro !== "" &&
          formData.cidade !== "" &&
          formData.estado !== "" &&
          formData.cep !== ""
        )
      case 3: // School history
        return (
          formData.escola6Nome !== "" &&
          formData.escola6Rede !== "" &&
          formData.escola7Nome !== "" &&
          formData.escola7Rede !== "" &&
          formData.escola8Nome !== "" &&
          formData.escola8Rede !== "" &&
          formData.escola9Nome !== "" &&
          formData.escola9Rede !== ""
        )
      case 4: // Competition type - at least one must be selected
        return formData.tipoEscolaPublica || formData.tipoEscolaPrivada || formData.moraBairro || formData.pcd
      case 5: // Contacts
        return formData.telefone !== ""
      case 6: // Parents
        return formData.maeNome !== ""
      case 7: // Responsible
        if (formData.responsavelTipo === "outros") {
          return formData.outroResponsavelNome !== "" && formData.outroResponsavelParentesco !== ""
        }
        return formData.responsavelTipo !== ""
      default:
        return true
    }
  }

  const onSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    setSubmitError("")
    setSubmitSuccess(false)

    try {
      const response = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessCode: formData.codigoAcesso,
          studentName: formData.nomeCompleto,
          dateOfBirth: formData.dataNascimento,
          rg: formData.rg || null,
          cpf: formData.cpf || null,
          nis: formData.nis || null,
          address: {
            street: formData.rua,
            number: formData.numero,
            complement: formData.complemento || null,
            neighborhood: formData.bairro,
            city: formData.cidade,
            state: formData.estado,
            zipCode: formData.cep,
          },
          school6thName: formData.escola6Nome,
          school6thNetwork: formData.escola6Rede,
          school7thName: formData.escola7Nome,
          school7thNetwork: formData.escola7Rede,
          school8thName: formData.escola8Nome,
          school8thNetwork: formData.escola8Rede,
          school9thName: formData.escola9Nome,
          school9thNetwork: formData.escola9Rede,
          competitionPublicSchool: formData.tipoEscolaPublica,
          competitionPrivateSchool: formData.tipoEscolaPrivada,
          competitionLivesInNeighborhood: formData.moraBairro,
          competitionPcd: formData.pcd,
          phoneMain: formData.telefone,
          phoneWhatsapp: formData.whatsapp || null,
          fatherName: formData.paiNome || null,
          fatherRg: formData.paiRg || null,
          fatherCpf: formData.paiCpf || null,
          fatherPhone: formData.paiTelefone || null,
          motherName: formData.maeNome,
          motherRg: formData.maeRg || null,
          motherCpf: formData.maeCpf || null,
          motherPhone: formData.maeTelefone || null,
          responsibleType: formData.responsavelTipo,
          otherResponsibleName: formData.outroResponsavelNome || null,
          otherResponsibleRelationship: formData.outroResponsavelParentesco || null,
          otherResponsibleRg: formData.outroResponsavelRg || null,
          otherResponsibleCpf: formData.outroResponsavelCpf || null,
          otherResponsiblePhone: formData.outroResponsavelTelefone || null,
        }),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("[v0] Non-JSON response:", text.substring(0, 200))
        setSubmitError("Erro no servidor. Por favor, tente novamente.")
        return
      }

      const result = await response.json()

      if (!response.ok) {
        setSubmitError(result.error || "Erro ao processar inscrição")
        return
      }

      setProtocolo(result.protocolNumber)
      setSubmitSuccess(true)
      setCurrentStep(0)
      // Reset form
      setFormData({
        codigoAcesso: "",
        nomeCompleto: "",
        dataNascimento: "",
        rg: "",
        cpf: "",
        nis: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        escola6Nome: "",
        escola6Rede: "Pública",
        escola7Nome: "",
        escola7Rede: "Pública",
        escola8Nome: "",
        escola8Rede: "Pública",
        escola9Nome: "",
        escola9Rede: "Pública",
        tipoEscolaPublica: false,
        tipoEscolaPrivada: false,
        moraBairro: false,
        pcd: false,
        telefone: "",
        whatsapp: "",
        paiNome: "",
        paiRg: "",
        paiCpf: "",
        paiTelefone: "",
        maeNome: "",
        maeRg: "",
        maeCpf: "",
        maeTelefone: "",
        responsavelTipo: "",
        outroResponsavelNome: "",
        outroResponsavelParentesco: "",
        outroResponsavelRg: "",
        outroResponsavelCpf: "",
        outroResponsavelTelefone: "",
      })
    } catch (error) {
      console.error("[v0] Enrollment exception:", error)
      setSubmitError("Erro de conexão. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
            <h3 className="text-lg font-semibold">Inscrição Realizada com Sucesso!</h3>
            <p className="text-sm text-muted-foreground">Seu protocolo de inscrição é:</p>
            <p className="text-xl font-bold text-green-700">{protocolo}</p>
            <p className="text-sm text-muted-foreground">Guarde o seu protocolo para futuras consultas.</p>
            <div className="flex flex-col gap-2 pt-4">
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <a href={`/verificar?protocolNumber=${protocolo}`}>Consultar Inscrição e Baixar PDF</a>
              </Button>
              <Button onClick={() => setSubmitSuccess(false)} variant="outline" className="w-full">
                Nova Inscrição
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processo Seletivo 2026</CardTitle>
        <CardDescription>
          Passo {currentStep + 1} de {STEPS.length}
        </CardDescription>
        <div className="mt-4">
          <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {currentStep === 0 && <StepAccessCode formData={formData} onChange={handleFormDataChange} />}
          {currentStep === 1 && <StepStudentData formData={formData} onChange={handleFormDataChange} />}
          {currentStep === 2 && <StepAddress formData={formData} onChange={handleFormDataChange} />}
          {currentStep === 3 && <StepSchoolHistory formData={formData} onChange={handleFormDataChange} />}
          {currentStep === 4 && <StepCompetitionType formData={formData} onChange={handleFormDataChange} />}
          {currentStep === 5 && <StepContacts formData={formData} onChange={handleFormDataChange} />}
          {currentStep === 6 && <StepParents formData={formData} onChange={handleFormDataChange} />}
          {currentStep === 7 && <StepResponsible formData={formData} onChange={handleFormDataChange} />}
          {currentStep === 8 && (
            <StepReview formData={formData} isSubmitting={isSubmitting} onSubmit={() => onSubmit()} />
          )}

          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceedToNext()}
                className="flex-1"
              >
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
