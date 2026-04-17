import type { Encuentro } from "@/types";
import { formatNumero } from "@/lib/utils";

interface Props {
  encuentros: Encuentro[];
}

export default function BarrasCampus({ encuentros }: Props) {
  // Agrupar por campus
  const map: Record<string, { nombre: string; total: number; pais: string }> = {};

  for (const e of encuentros) {
    const key = e.campus_id;
    if (!map[key]) {
      map[key] = {
        nombre: e.campus?.nombre ?? "—",
        total: 0,
        pais: e.campus?.pais ?? "",
      };
    }
    map[key].total += e.total_general;
  }

  const sorted = Object.values(map).sort((a, b) => b.total - a.total);
  const max = sorted[0]?.total || 1;

  const COLORS: Record<string, string> = {
    Chile:     "var(--arm-purple)",
    Uruguay:   "var(--arm-teal)",
    Venezuela: "#D85A30",
    "EE.UU.":  "#534AB7",
  };

  return (
    <div className="card p-5 h-full">
      <h3 className="mb-4">Asistencia por campus — semana actual</h3>
      <div className="space-y-3">
        {sorted.map((c) => {
          const pct = Math.round((c.total / max) * 100);
          const color = COLORS[c.pais] ?? "var(--arm-purple)";

          return (
            <div key={c.nombre} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-28 text-right shrink-0 truncate">
                {c.nombre}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600 w-14 text-right shrink-0">
                {formatNumero(c.total)}
              </span>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            Sin datos esta semana
          </p>
        )}
      </div>
    </div>
  );
}
