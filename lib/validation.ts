import { z } from "zod"

export const guardianSchema = z.object({
  nome: z.string().min(3, "Nome do responsável é obrigatório").max(100),
  cpfRg: z.string().min(3, "CPF/RG é obrigatório"),
  parentesco: z.string().min(2, "Parentesco é obrigatório"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido"),
})

export const enrollmentFormSchema = z.object({
  cursoEscolhido: z.string().min(1, "Curso é obrigatório"),
  nomeCompleto: z.string().min(3, "Nome completo é obrigatório").max(100),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  cpf: z.string().optional().or(z.literal("")),
  endereco: z.object({
    rua: z.string().min(3, "Rua é obrigatória"),
    numero: z.string().min(1, "Número é obrigatório"),
    complemento: z.string().optional().or(z.literal("")),
    bairro: z.string().min(2, "Bairro é obrigatório"),
    cidade: z.string().min(2, "Cidade é obrigatória"),
    estado: z.string().min(2).max(2, "Estado deve ter 2 caracteres"),
    cep: z.string().min(8, "CEP deve ter 8 dígitos"),
  }),
  escolaOrigem: z.string().min(3, "Escola de origem é obrigatória"),
  redeEnsino: z.string().min(1, "Rede de ensino é obrigatória"),
  telefoneContato: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  emailContato: z.string().email("Email inválido"),
  dadosResponsavel: z
    .array(guardianSchema)
    .min(1, "Pelo menos 1 responsável é obrigatório")
    .max(2, "Máximo 2 responsáveis"),
})

export type EnrollmentFormData = z.infer<typeof enrollmentFormSchema>
