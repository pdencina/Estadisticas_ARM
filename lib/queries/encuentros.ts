import { createClient } from "@/lib/supabase/server";
import type { Encuentro, UserProfile } from "@/types";

export async function getEncuentros(campusId?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("encuentros")
    .select(`*, campus:campus_id(id, nombre, ciudad, pais)`)
    .order("fecha", { ascending: false })
    .order("horario", { ascending: true });

  if (campusId) {
    query = query.eq("campus_id", campusId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as Encuentro[];
}

export async function getEncuentroById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("encuentros")
    .select(`*, campus:campus_id(id, nombre, ciudad, pais)`)
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Encuentro;
}

export async function getEncuentrosPendientes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("encuentros")
    .select(`*, campus:campus_id(id, nombre, ciudad, pais)`)
    .eq("estado", "borrador")
    .order("fecha", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Encuentro[];
}

export async function getEncuentrosSemanaActual() {
  const supabase = await createClient();

  // Lunes de esta semana
  const ahora = new Date();
  const diaSemana = ahora.getDay() || 7;
  const lunes = new Date(ahora);
  lunes.setDate(ahora.getDate() - diaSemana + 1);
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);

  const { data, error } = await supabase
    .from("encuentros")
    .select(`*, campus:campus_id(id, nombre, ciudad, pais)`)
    .gte("fecha", lunes.toISOString().split("T")[0])
    .lte("fecha", domingo.toISOString().split("T")[0])
    .order("fecha", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Encuentro[];
}

export async function getDashboardKPIs(campusId?: string) {
  const supabase = await createClient();

  const ahora = new Date();
  const diaSemana = ahora.getDay() || 7;

  // Semana actual (lun-dom)
  const lunesActual = new Date(ahora);
  lunesActual.setDate(ahora.getDate() - diaSemana + 1);
  const domingoActual = new Date(lunesActual);
  domingoActual.setDate(lunesActual.getDate() + 6);

  // Semana anterior
  const lunesAnterior = new Date(lunesActual);
  lunesAnterior.setDate(lunesActual.getDate() - 7);
  const domingoAnterior = new Date(lunesAnterior);
  domingoAnterior.setDate(lunesAnterior.getDate() + 6);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  let queryActual = supabase
    .from("encuentros")
    .select("total_general, asistencia, acepto_jesus_presencial, online")
    .gte("fecha", fmt(lunesActual))
    .lte("fecha", fmt(domingoActual))
    .eq("estado", "enviado");

  let queryAnterior = supabase
    .from("encuentros")
    .select("total_general, asistencia, acepto_jesus_presencial, online")
    .gte("fecha", fmt(lunesAnterior))
    .lte("fecha", fmt(domingoAnterior))
    .eq("estado", "enviado");

  if (campusId) {
    queryActual = queryActual.eq("campus_id", campusId);
    queryAnterior = queryAnterior.eq("campus_id", campusId);
  }

  const [{ data: actual }, { data: anterior }] = await Promise.all([
    queryActual,
    queryAnterior,
  ]);

  const sumar = (arr: typeof actual) => ({
    total_general: arr?.reduce((s, e) => s + (e.total_general || 0), 0) ?? 0,
    total_auditorio: arr?.reduce((s, e) => s + (e.asistencia?.auditorio || 0), 0) ?? 0,
    total_paj: arr?.reduce(
      (s, e) => s + (e.acepto_jesus_presencial || 0) + (e.online?.acepto_jesus || 0),
      0
    ) ?? 0,
  });

  const sa = sumar(actual);
  const san = sumar(anterior);

  return {
    semana_actual: sa,
    semana_anterior: san,
    diferencias: {
      total_general: sa.total_general - san.total_general,
      total_auditorio: sa.total_auditorio - san.total_auditorio,
      total_paj: sa.total_paj - san.total_paj,
    },
  };
}
