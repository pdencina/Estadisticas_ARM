"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/queries/users";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { NuevoEncuentroForm } from "@/types";

export async function crearEncuentro(
  form: NuevoEncuentroForm,
  estado: "borrador" | "enviado" = "enviado"
) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  // Voluntarios solo pueden reportar su propio campus
  if (user.rol === "voluntario" && form.campus_id !== user.campus_id) {
    throw new Error("No tienes permiso para reportar este campus.");
  }

  // Admins de campus solo su campus
  if (user.rol === "admin_campus" && form.campus_id !== user.campus_id) {
    throw new Error("Solo puedes reportar tu campus asignado.");
  }

  const { data, error } = await supabase
    .from("encuentros")
    .insert({
      ...form,
      estado,
      reportado_por: user.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/encuentros");

  return data;
}

export async function actualizarEncuentro(
  id: string,
  form: Partial<NuevoEncuentroForm>,
  estado?: "borrador" | "enviado" | "validado"
) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const updates: Record<string, unknown> = { ...form, updated_at: new Date().toISOString() };
  if (estado) updates.estado = estado;

  const { error } = await supabase
    .from("encuentros")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/encuentros");
  revalidatePath(`/encuentros/${id}`);
}

export async function validarEncuentro(id: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user || user.rol !== "admin_global") {
    throw new Error("Solo el admin global puede validar reportes.");
  }

  const { error } = await supabase
    .from("encuentros")
    .update({ estado: "validado", updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/encuentros");
}

export async function eliminarEncuentro(id: string) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user || user.rol !== "admin_global") {
    throw new Error("Solo el admin global puede eliminar reportes.");
  }

  const { error } = await supabase.from("encuentros").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/encuentros");
}
