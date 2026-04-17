import Link from "next/link";
import { formatFecha, formatNumero, TIPO_ENCUENTRO_LABELS } from "@/lib/utils";
import type { Encuentro } from "@/types";

interface Props {
  encuentros: Encuentro[];
  showCampus?: boolean;
}

const ESTADO_BADGE: Record<string, string> = {
  enviado:   "badge-green",
  validado:  "badge-teal",
  borrador:  "badge-amber",
};

const ESTADO_LABEL: Record<string, string> = {
  enviado:  "Enviado",
  validado: "Validado",
  borrador: "Borrador",
};

export default function EncuentrosTable({
  encuentros,
  showCampus = true,
}: Props) {
  if (!encuentros.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-400">Sin encuentros registrados esta semana</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            {showCampus && <th>Campus</th>}
            <th>Tipo</th>
            <th>Horario</th>
            <th>Predicador</th>
            <th className="text-right">Asistentes</th>
            <th className="text-right">Auditorio</th>
            <th className="text-right">PAJ</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {encuentros.map((e) => (
            <tr key={e.id}>
              <td className="text-gray-500">{formatFecha(e.fecha)}</td>
              {showCampus && (
                <td>
                  <span className="font-medium text-gray-800">
                    {e.campus?.nombre ?? "—"}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">
                    {e.campus?.pais}
                  </span>
                </td>
              )}
              <td>{TIPO_ENCUENTRO_LABELS[e.tipo] ?? e.tipo}</td>
              <td>{e.horario}</td>
              <td className="text-gray-500 max-w-[160px] truncate">
                {e.predicador ?? "—"}
              </td>
              <td className="text-right font-medium">
                {formatNumero(e.total_general)}
              </td>
              <td className="text-right text-gray-500">
                {formatNumero(e.asistencia?.auditorio ?? 0)}
              </td>
              <td className="text-right font-medium" style={{ color: "var(--arm-teal)" }}>
                {e.acepto_jesus_presencial + (e.online?.acepto_jesus ?? 0)}
              </td>
              <td>
                <span className={`badge ${ESTADO_BADGE[e.estado]}`}>
                  {ESTADO_LABEL[e.estado]}
                </span>
              </td>
              <td>
                <Link
                  href={`/encuentros/${e.id}`}
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Ver →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
