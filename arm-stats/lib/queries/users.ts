import { createClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types";

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("user_profiles")
    .select(`*, campus:campus_id(id, nombre, ciudad, pais)`)
    .eq("id", user.id)
    .single();

  if (error) return null;
  return data as UserProfile;
}

export async function getAllUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select(`*, campus:campus_id(id, nombre, ciudad, pais)`)
    .order("nombre");

  if (error) throw new Error(error.message);
  return data as UserProfile[];
}
