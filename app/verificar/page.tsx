import { Suspense } from "react"
import VerificationContent from "./_components/VerificationContent"

export const metadata = {
  title: "Verificar Inscrição - EEEP Lúcia Baltazar Costa",
  description: "Verificar o status de sua inscrição",
}

export default function VerificarPage() {
  return (
    <Suspense>
      <VerificationContent />
    </Suspense>
  )
}
