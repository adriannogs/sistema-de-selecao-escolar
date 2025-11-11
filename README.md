# Sistema de Pré-Matrícula - EEEP Lúcia Baltazar Costa

Sistema completo de pré-matrícula online para inscrição em cursos técnicos: Administração, Desenvolvimento de Sistemas, Edificações e Massoterapia.

## Tecnologias

- **Frontend**: React, Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, TypeScript
- **Database**: PostgreSQL com Prisma ORM
- **Validação**: Zod
- **Deployment**: Vercel

## Funcionalidades

### Público
- Formulário de inscrição responsivo com validação em tempo real
- Suporte a até 2 responsáveis por aluno
- Auto-save em localStorage para recuperação de dados em caso de perda de conexão
- Confirmação visual com número de protocolo único
- Máscaras de entrada para CPF, CEP, telefone

### Admin
- Painel protegido por API key para gerenciar inscrições
- Filtros por curso, status e data
- Visualização detalhada de inscrições
- Atualização de status (pendente → analisado → aceito/recusado)
- Download de PDF de inscrição
- Logs de auditoria das alterações

### Backend
- Validação server-side com Zod
- Proteção contra requisições inválidas
- Rate limiting preparado
- Registro de IP e timestamps
- Geração de hash SHA-256 dos dados

## Setup e Deployment

### 1. Pré-requisitos

- Node.js 18+ 
- Conta Vercel (recomendado para deploy)
- Banco de dados PostgreSQL (Supabase, Neon ou Vercel Postgres)

### 2. Instalação Local

\`\`\`bash
# Clone o repositório
git clone <seu-repo>
cd prematricula-system

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Edite .env.local com suas credenciais

# Execute as migrações do banco de dados
npx prisma migrate dev --name init

# Inicie o servidor de desenvolvimento
npm run dev
\`\`\`

### 3. Configuração de Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

\`\`\`env
# Database
DATABASE_URL="postgresql://usuario:senha@host:5432/prematricula"

# Admin
ADMIN_API_KEY="sua-chave-secreta-aqui-min-32-caracteres"

# School Info
NEXT_PUBLIC_SCHOOL_NAME="EEEP Lúcia Baltazar Costa"
NEXT_PUBLIC_SCHOOL_LOGO_URL="https://exemplo.com/logo.png"

# Email (Opcional - para integração futura)
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="sua-chave-sendgrid"

# Storage (Opcional - para PDF em cloud storage)
STORAGE_PROVIDER="vercel"
\`\`\`

### 4. Deploy em Vercel

\`\`\`bash
# 1. Faça push do código para GitHub
git push

# 2. Vá para vercel.com e crie um novo projeto
# 3. Conecte seu repositório GitHub
# 4. Configure as variáveis de ambiente no painel Vercel
# 5. Deploy!
\`\`\`

Ou usando Vercel CLI:

\`\`\`bash
npm i -g vercel
vercel
\`\`\`

## Estrutura do Projeto

\`\`\`
├── app/
│   ├── api/
│   │   ├── admin/                    # Rotas administrativas
│   │   │   └── enrollments/
│   │   ├── enroll/                   # Inscrição pública
│   │   └── pdf/                      # Geração de PDF
│   ├── admin/                        # Painel admin
│   ├── pre-matricula/                # Formulário público
│   └── layout.tsx
├── components/
│   ├── enrollment-form.tsx           # Componente principal do formulário
│   ├── admin-enrollments-table.tsx   # Painel de inscrições
│   └── ui/                           # Componentes shadcn
├── lib/
│   ├── validation.ts                 # Schemas Zod
│   └── api-utils.ts                  # Utilitários de API
├── prisma/
│   ├── schema.prisma                 # Schema do banco de dados
│   └── migrations/                   # Histórico de migrações
└── README.md
\`\`\`

## Endpoints da API

### Público

#### POST `/api/enroll`
Submeter nova inscrição

\`\`\`json
{
  "cursoEscolhido": "Desenvolvimento de Sistemas",
  "nomeCompleto": "João Silva",
  "dataNascimento": "2006-05-15",
  "cpf": "12345678901",
  "endereco": {
    "rua": "Rua Principal",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "Fortaleza",
    "estado": "CE",
    "cep": "60015090"
  },
  "escolaOrigem": "Escola Estadual X",
  "redeEnsino": "Pública",
  "telefoneContato": "85999999999",
  "emailContato": "joao@email.com",
  "dadosResponsavel": [
    {
      "nome": "Maria Silva",
      "cpfRg": "98765432100",
      "parentesco": "Mãe",
      "telefone": "85988888888",
      "email": "maria@email.com"
    }
  ]
}
\`\`\`

Response (201):
\`\`\`json
{
  "success": true,
  "enrollmentId": "abc123",
  "protocolo": "PRE-2Z5Q8-ABCD",
  "pdfUrl": "/api/pdf/abc123"
}
\`\`\`

#### GET `/api/enroll/:id`
Obter detalhes de uma inscrição

Response (200):
\`\`\`json
{
  "id": "abc123",
  "protocolo": "PRE-2Z5Q8-ABCD",
  "status": "pendente",
  "student": { ... },
  "course": { ... },
  "createdAt": "2025-01-15T10:30:00Z"
}
\`\`\`

### Admin (requer header `x-api-key`)

#### GET `/api/admin/enrollments?page=1&limit=10&course=Administração&status=pendente`
Listar inscrições com filtros

Headers:
\`\`\`
x-api-key: sua-chave-secreta
\`\`\`

#### PATCH `/api/admin/enrollments/:id/status`
Atualizar status de inscrição

\`\`\`json
{
  "status": "analisado"
}
\`\`\`

## Validação

### Regras de Validação do Formulário

- **Nome Completo**: Mínimo 3 caracteres, máximo 100
- **Data de Nascimento**: Mínimo 14 anos
- **Email**: Formato de email válido
- **Telefone**: Mínimo 10 dígitos
- **CEP**: Mínimo 8 dígitos
- **Responsáveis**: Mínimo 1, máximo 2
- **Curso**: Deve estar na lista de cursos válidos

## Segurança

- Validação server-side de todos os dados
- Proteção de rotas admin com API key
- Hash SHA-256 dos dados de inscrição
- Registro de IP e timestamps para auditoria
- Logs de alterações de status
- CSRF protection nativa do Next.js

## Desenvolvimento Futuro

- [ ] Integração com SendGrid para envio de emails
- [ ] Geração de PDF com react-pdf e assinaturas digitais
- [ ] Upload de assinatura do gestor
- [ ] Exportação de dados em CSV
- [ ] Autenticação com NextAuth
- [ ] Dashboard com gráficos e estatísticas
- [ ] Notificações em tempo real com WebSocket
- [ ] Sistema de assinatura eletrônica

## Suporte

Para problemas ou dúvidas, crie uma issue no repositório ou entre em contato com a equipe de desenvolvimento.
\`\`\`

\`\`\`env.example file=".env.example"
# Database
DATABASE_URL="postgresql://usuario:senha@host:5432/prematricula"

# Admin Security
ADMIN_API_KEY="gerar-chave-secreta-aleatoria-min-32-caracteres"

# School Information
NEXT_PUBLIC_SCHOOL_NAME="EEEP Lúcia Baltazar Costa"
NEXT_PUBLIC_SCHOOL_LOGO_URL="https://exemplo.com/logo.png"

# Email Configuration (Optional)
EMAIL_PROVIDER="sendgrid"
SENDGRID_API_KEY="sua-chave-aqui"

# Storage Configuration (Optional)
STORAGE_PROVIDER="vercel"

# Development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://localhost:3000/pre-matricula"
