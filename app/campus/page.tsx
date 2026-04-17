import { getCampusConEstadisticas } from "@/lib/queries/campus";
import { getCurrentUser } from "@/lib/queries/users";
import { formatNumero, deltaClass, formatDelta } from "@/lib/utils";
import { Building2, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const revalidate = 60;

export default async function CampusPage() {
  const [user, campusList] = await Promise.all([
    getCurrentUser(),
    getCampusConEstadisticas(),
  ]);

  const visible =
    user?.rol === "admin_global"
      ? campusList
      : campusList.filter((c) => c.id === user?.campus_id);

  return (
    <div className="page-content space-y-6">
      <div>
        <h2>Por campus</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Comparativo de asistencia semana actual vs semana anterior
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {visible.map((campus) => {
          const { semana_actual: sa, diferencias: d } = campus;

          return (
            <div key={campus.id} className="card p-5 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "var(--arm-purple-light)" }}
                >
                  <Building2 size={16} style={{ color: "var(--arm-purple)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {campus.nombre}
                  </p>
                  <p className="text-xs text-gray-400">
                    {campus.ciudad} · {campus.pais}
                  </p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                <Stat
                  label="Total"
                  value={sa.total}
                  delta={d.total}
                />
                <Stat
                  label="Auditorio"
                  value={sa.aud}
                  delta={d.aud}
                />
                <Stat
                  label="PAJ"
                  value={sa.paj}
                  delta={d.paj}
                  accent
                />
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div className="col-span-3 py-16 text-center text-sm text-gray-400">
            Sin campus disponibles
          </div>
        )}
      </div>

      {/* Tabla comparativa */}
      {user?.rol === "admin_global" && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3>Tabla comparativa — todas las sedes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campus</th>
                  <th>País</th>
                  <th className="text-right">Total gral</th>
                  <th className="text-right">Auditorio</th>
                  <th className="text-right">PAJ</th>
                  <th className="text-right">Δ Total</th>
                  <th className="text-right">Δ Aud.</th>
                  <th className="text-right">Δ PAJ</th>
                </tr>
              </thead>
              <tbody>
                {visible
                  .sort((a, b) => b.semana_actual.total - a.semana_actual.total)
                  .map((c) => (
                    <tr key={c.id}>
                      <td className="font-medium">{c.nombre}</td>
                      <td className="text-gray-400">{c.pais}</td>
                      <td className="text-right font-medium tabular-nums">
                        {formatNumero(c.semana_actual.total)}
                      </td>
                      <td className="text-right tabular-nums text-gray-500">
                        {formatNumero(c.semana_actual.aud)}
                      </td>
                      <td
                        className="text-right font-semibold tabular-nums"
                        style={{ color: "var(--arm-teal)" }}
                      >
                        {c.semana_actual.paj}
                      </td>
                      <td className={`text-right text-xs tabular-nums ${deltaClass(c.diferencias.total)}`}>
                        {formatDelta(c.diferencias.total)}
                      </td>
                      <td className={`text-right text-xs tabular-nums ${deltaClass(c.diferencias.aud)}`}>
                        {formatDelta(c.diferencias.aud)}
                      </td>
                      <td className={`text-right text-xs tabular-nums ${deltaClass(c.diferencias.paj)}`}>
                        {formatDelta(c.diferencias.paj)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  delta,
  accent = false,
}: {
  label: string;
  value: number;
  delta: number;
  accent?: boolean;
}) {
  const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;

  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </p>
      <p
        className="text-lg font-semibold tabular-nums"
        style={accent ? { color: "var(--arm-teal)" } : {}}
      >
        {formatNumero(value)}
      </p>
      <div className={`flex items-center justify-center gap-0.5 mt-0.5 ${deltaClass(delta)}`}>
        <Icon size={9} />
        <span className="text-[10px] tabular-nums">{Math.abs(delta)}</span>
      </div>
    </div>
  );
}
