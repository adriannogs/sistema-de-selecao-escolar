import { EnrollmentForm } from "@/components/enrollment-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Sistema de Inscrição: Processo Seletivo 2026 - EP Lúcia Baltazar",
  description: "Sistema de inscrição para o processo seletivo 2026",
}

export default function PreMatriculaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold mb-2">Sistema de Inscrição: Processo Seletivo 2026</h1>
            <p className="text-lg text-muted-foreground">EP Lúcia Baltazar</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin">Painel Administrativo</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Voltar ao Início</Link>
            </Button>
          </div>
        </div>
        <EnrollmentForm />
      </div>
    </main>
  )
}
