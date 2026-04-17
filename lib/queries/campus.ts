import { createClient } from "@/lib/supabase/server";
import type { Campus } from "@/types";

export async function getCampus() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campus")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  if (error) throw new Error(error.message);
  return data as Campus[];
}

export async function getCampusById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campus")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Campus;
}

export async function getCampusConEstadisticas() {
  const supabase = await createClient();

  const ahora = new Date();
  const diaSemana = ahora.getDay() || 7;

  const lunesActual = new Date(ahora);
  lunesActual.setDate(ahora.getDate() - diaSemana + 1);
  const domingoActual = new Date(lunesActual);
  domingoActual.setDate(lunesActual.getDate() + 6);

  const lunesAnterior = new Date(lunesActual);
  lunesAnterior.setDate(lunesActual.getDate() - 7);
  const domingoAnterior = new Date(lunesAnterior);
  domingoAnterior.setDate(lunesAnterior.getDate() + 6);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const [{ data: campusList }, { data: actual }, { data: anterior }] =
    await Promise.all([
      supabase.from("campus").select("*").eq("activo", true).order("nombre"),
      supabase
        .from("encuentros")
        .select("campus_id, total_general, asistencia, acepto_jesus_presencial, online")
        .gte("fecha", fmt(lunesActual))
        .lte("fecha", fmt(domingoActual))
        .eq("estado", "enviado"),
      supabase
        .from("encuentros")
        .select("campus_id, total_general, asistencia, acepto_jesus_presencial, online")
        .gte("fecha", fmt(lunesAnterior))
        .lte("fecha", fmt(domingoAnterior))
        .eq("estado", "enviado"),
    ]);

  const agrupar = (arr: typeof actual) => {
    const map: Record<string, { total: number; aud: number; paj: number }> = {};
    arr?.forEach((e) => {
      if (!map[e.campus_id]) map[e.campus_id] = { total: 0, aud: 0, paj: 0 };
      map[e.campus_id].total += e.total_general || 0;
      map[e.campus_id].aud += e.asistencia?.auditorio || 0;
      map[e.campus_id].paj +=
        (e.acepto_jesus_presencial || 0) + (e.online?.acepto_jesus || 0);
    });
    return map;
  };

  const mapActual = agrupar(actual);
  const mapAnterior = agrupar(anterior);

  return campusList?.map((c) => {
    const a = mapActual[c.id] || { total: 0, aud: 0, paj: 0 };
    const an = mapAnterior[c.id] || { total: 0, aud: 0, paj: 0 };
    return {
      ...c,
      semana_actual: a,
      semana_anterior: an,
      diferencias: {
        total: a.total - an.total,
        aud: a.aud - an.aud,
        paj: a.paj - an.paj,
      },
    };
  }) ?? [];
}
