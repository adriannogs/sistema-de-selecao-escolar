import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Zap, Shield } from "lucide-react"

export const metadata = {
  title: "Sistema de Inscrição: Processo Seletivo 2026 - EP Lúcia Baltazar",
  description: "Sistema de inscrição para o processo seletivo 2026",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header/Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">EP Lúcia Baltazar</h1>
            <p className="text-2xl text-slate-600">Sistema de Inscrição: Processo Seletivo 2026</p>
            <p className="text-lg text-slate-500 mt-4">Cursos Técnicos de Qualidade com Futuro Garantido</p>
          </div>

          <Card className="p-8 mb-8 bg-white shadow-lg">
            <div className="space-y-6">
              <p className="text-slate-700 text-lg font-medium leading-relaxed">
                Bem-vindo ao sistema de inscrição do processo seletivo EP Lúcia Baltazar 2026. Escolha um dos nossos
                cursos técnicos e inicie sua jornada de aprendizado e desenvolvimento profissional.
              </p>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition">
                  <h3 className="font-semibold text-slate-900 mb-1">Administração</h3>
                  <p className="text-sm text-slate-600">Gestão de negócios e organizações</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition">
                  <h3 className="font-semibold text-slate-900 mb-1">Desenvolvimento de Sistemas</h3>
                  <p className="text-sm text-slate-600">Programação e tecnologia da informação</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition">
                  <h3 className="font-semibold text-slate-900 mb-1">Edificações</h3>
                  <p className="text-sm text-slate-600">Construção civil e engenharia</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:shadow-md transition">
                  <h3 className="font-semibold text-slate-900 mb-1">Massoterapia</h3>
                  <p className="text-sm text-slate-600">Terapias corporais e bem-estar</p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8 pt-8 border-t">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Rápido e Seguro</h3>
                  <p className="text-sm text-slate-600">Formulário seguro com criptografia de dados</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">LGPD Compliant</h3>
                  <p className="text-sm text-slate-600">Dados protegidos conforme Lei de Proteção de Dados</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Confirmação Instantânea</h3>
                  <p className="text-sm text-slate-600">Receba seu protocolo e PDF imediatamente</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/pre-matricula" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Fazer Inscrição
                  </Button>
                </Link>
                <Link href="/verificar" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline">
                    Verificar Inscrição
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          <div className="text-sm text-slate-600 space-y-2">
            <div className="flex justify-center gap-4">
              <Link href="/admin" className="text-blue-600 hover:text-blue-700 font-medium">
                Painel Administrativo
              </Link>
            </div>
            <p className="text-xs text-slate-500">© 2026 EP Lúcia Baltazar. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
