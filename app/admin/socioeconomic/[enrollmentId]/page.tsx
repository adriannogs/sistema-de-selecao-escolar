import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SocioeconomicFormWrapper } from "@/components/socioeconomic-form-wrapper"

export default async function SocioeconomicPage({ params }: { params: Promise<{ enrollmentId: string }> }) {
  const { enrollmentId } = await params

  // Verify admin access (you can add proper auth check here)
  const supabase = await createClient()

  // Fetch enrollment data
  const { data: enrollment, error } = await supabase.from("enrollments").select("*").eq("id", enrollmentId).single()

  if (error || !enrollment) {
    redirect("/admin")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <SocioeconomicFormWrapper enrollmentId={enrollmentId} studentName={enrollment.student_name} />
    </div>
  )
}
