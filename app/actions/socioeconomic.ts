"use server"

import { createClient } from "@/lib/supabase/server"

export async function getSocioeconomicForm(enrollmentId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("socioeconomic_forms")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("[v0] Error fetching socioeconomic form:", error)
      return { error: "Erro ao buscar formulário" }
    }

    return { data: data || null }
  } catch (error) {
    console.error("[v0] Socioeconomic GET error:", error)
    return { error: "Erro interno" }
  }
}

export async function saveSocioeconomicForm(enrollmentId: string, formData: any) {
  try {
    const supabase = await createClient()

    // Check if form already exists
    const { data: existing } = await supabase
      .from("socioeconomic_forms")
      .select("id")
      .eq("enrollment_id", enrollmentId)
      .single()

    if (existing) {
      // Update existing form
      const { data, error } = await supabase
        .from("socioeconomic_forms")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("enrollment_id", enrollmentId)
        .select()
        .single()

      if (error) {
        console.error("[v0] Error updating socioeconomic form:", error)
        return { error: "Erro ao atualizar formulário" }
      }

      return { data, message: "Formulário atualizado com sucesso" }
    } else {
      // Create new form
      const { data, error } = await supabase
        .from("socioeconomic_forms")
        .insert({
          enrollment_id: enrollmentId,
          ...formData,
          created_by: "admin",
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Error creating socioeconomic form:", error)
        return { error: "Erro ao criar formulário" }
      }

      return { data, message: "Formulário criado com sucesso" }
    }
  } catch (error) {
    console.error("[v0] Socioeconomic POST error:", error)
    return { error: "Erro interno" }
  }
}
