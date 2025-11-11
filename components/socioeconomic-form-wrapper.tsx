"use client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { SocioeconomicForm } from "@/components/socioeconomic-form"

interface SocioeconomicFormWrapperProps {
  enrollmentId: string
  studentName: string
}

export function SocioeconomicFormWrapper({ enrollmentId, studentName }: SocioeconomicFormWrapperProps) {
  const router = useRouter()

  const handleClose = () => {
    router.push("/admin")
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Button variant="outline" onClick={handleClose}>
          ← Voltar para Admin
        </Button>
      </div>
      <SocioeconomicForm enrollmentId={enrollmentId} studentName={studentName} onClose={handleClose} />
    </div>
  )
}
