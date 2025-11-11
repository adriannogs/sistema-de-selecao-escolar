import { AdminEnrollmentsTable } from "@/components/admin-enrollments-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Admin - Sistema de Inscrição 2026",
  description: "Painel administrativo de inscrições",
}

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Painel Administrativo</h1>
            <p className="text-lg text-muted-foreground">Gerenciar inscrições do processo seletivo 2026</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/pre-matricula">Nova Inscrição</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Voltar ao Início</Link>
            </Button>
          </div>
        </div>
        <AdminEnrollmentsTable />
      </div>
    </main>
  )
}
