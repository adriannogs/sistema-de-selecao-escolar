// Utility functions for enrollment handling
export function generateProtocolNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${year}${month}${random}`
}

export interface EnrollmentData {
  courseName: string | null
  studentName: string
  dateOfBirth: string
  cpf: string | null
  rgStudent: string
  nis: string | null // Made NIS optional
  address: {
    street: string
    number: string | null // Made number optional
    complement: string | null
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  schoolOfOrigin: string
  educationNetwork: string
  phoneMain: string
  email: string | null // Made email optional
  guardians: Array<{
    nome: string
    cpf: string
    rg: string // Added separate RG field
    parentesco: string
    telefone: string
    email: string | null // Made guardian email optional
  }>
}

export function validateEnrollmentData(data: EnrollmentData): string[] {
  const errors: string[] = []

  console.log("[v0] Validating enrollment data:", JSON.stringify(data, null, 2))

  if (!data.studentName?.trim()) errors.push("Nome do aluno é obrigatório")
  if (!data.dateOfBirth) errors.push("Data de nascimento é obrigatória")
  if (!data.rgStudent?.trim()) errors.push("RG do aluno é obrigatório")
  if (!data.address?.street?.trim()) errors.push("Rua é obrigatória")
  if (!data.address?.neighborhood?.trim()) errors.push("Bairro é obrigatório")
  if (!data.address?.city?.trim()) errors.push("Cidade é obrigatória")
  if (!data.address?.state?.trim()) errors.push("Estado é obrigatório")
  if (!data.address?.zipCode?.trim()) errors.push("CEP é obrigatório")
  if (!data.schoolOfOrigin?.trim()) errors.push("Escola de origem é obrigatória")
  if (!data.educationNetwork?.trim()) errors.push("Rede de ensino é obrigatória")
  if (!data.phoneMain?.trim()) errors.push("Telefone é obrigatório")
  if (!data.guardians || data.guardians.length === 0) errors.push("Pelo menos um responsável é obrigatório")

  data.guardians?.forEach((g, idx) => {
    if (!g.nome?.trim()) errors.push(`Responsável ${idx + 1}: nome é obrigatório`)
    if (!g.cpf?.trim()) errors.push(`Responsável ${idx + 1}: CPF é obrigatório`)
    if (!g.rg?.trim()) errors.push(`Responsável ${idx + 1}: RG é obrigatório`)
    if (!g.parentesco?.trim()) errors.push(`Responsável ${idx + 1}: parentesco é obrigatório`)
    if (!g.telefone?.trim()) errors.push(`Responsável ${idx + 1}: telefone é obrigatório`)
  })

  if (errors.length > 0) {
    console.log("[v0] Validation errors:", errors)
  }

  return errors
}
