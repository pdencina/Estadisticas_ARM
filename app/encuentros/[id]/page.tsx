import { notFound, redirect } from "next/navigation";
import { getEncuentroById } from "@/lib/queries/encuentros";
import { getCurrentUser } from "@/lib/queries/users";
import { formatFecha, formatNumero, TIPO_ENCUENTRO_LABELS, MODALIDAD_LABELS } from "@/lib/utils";
import { validarEncuentro } from "@/lib/actions/encuentros";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, Shield } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const ESTADO_CONFIG = {
  borrador: { badge: "badge-amber", icon: Clock,       label: "Borrador" },
  enviado:  { badge: "badge-green", icon: CheckCircle, label: "Enviado"  },
  validado: { badge: "badge-teal",  icon: Shield,      label: "Validado" },
} as const;

export default async function EncuentroDetailPage({ params }: Props) {
  const { id } = await params;
  const [user, encuentro] = await Promise.all([
    getCurrentUser(),
    getEncuentroById(id).catch(() => null),
  ]);

  if (!encuentro) notFound();

  if (
    user?.rol !== "admin_global" &&
    encuentro.campus_id !== user?.campus_id
  ) {
    redirect("/encuentros");
  }

  const estadoConfig = ESTADO_CONFIG[encuentro.estado];
  const Icon = estadoConfig.icon;

  const totalVols = encuentro.voluntarios
    ? Object.values(encuentro.voluntarios).reduce((s, v) => s + (v as number), 0)
    : 0;

  async function validar() {
    "use server";
    await validarEncuentro(id);
    redirect(`/encuentros/${id}`);
  }

  return (
    <div className="page-content max-w-3xl space-y-5">
      <div>
        <Link href="/encuentros" className="btn-ghost text-xs mb-3 inline-flex">
          <ArrowLeft size={13} /> Volver a encuentros
        </Link>
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1">
            <h2>
              {TIPO_ENCUENTRO_LABELS[encuentro.tipo]} {encuentro.horario}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {encuentro.campus?.nombre} · {formatFecha(encuentro.fecha)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${estadoConfig.badge} flex items-center gap-1`}>
              <Icon size={10} />
              {estadoConfig.label}
            </span>
            {user?.rol === "admin_global" && encuentro.estado === "enviado" && (
              <form action={validar}>
                <button type="submit" className="btn-primary text-xs py-1.5 px-3">
                  <Shield size={12} />
                  Validar
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4">Información del encuentro</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm">
          <Field label="Modalidad"     value={MODALIDAD_LABELS[encuentro.modalidad]} />
          <Field label="Predicador"    value={encuentro.predicador ?? "—"} />
          <Field label="Mensaje"       value={encuentro.nombre_mensaje ?? "—"} />
          <Field label="Líderes vol."  value={encuentro.lideres_voluntarios ?? "—"} />
          <Field label="Admins campus" value={encuentro.admins_campus ?? "—"} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="kpi-card text-center">
          <p className="text-xs text-gray-400 mb-1">Total general</p>
          <p className="text-3xl font-bold">{formatNumero(encuentro.total_general)}</p>
        </div>
        <div className="kpi-card text-center">
          <p className="text-xs text-gray-400 mb-1">Auditorio</p>
          <p className="text-3xl font-bold">{formatNumero(encuentro.asistencia?.auditorio ?? 0)}</p>
        </div>
        <div className="kpi-card text-center">
          <p className="text-xs text-gray-400 mb-1">Aceptaron a Jesús</p>
          <p className="text-3xl font-bold" style={{ color: "var(--arm-teal)" }}>
            {(encuentro.acepto_jesus_presencial ?? 0) + (encuentro.online?.acepto_jesus ?? 0)}
          </p>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4">Desglose de asistencia</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(encuentro.asistencia ?? {}).map(([k, v]) => (
            <StatRow key={k} label={k} value={v as number} />
          ))}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3>Voluntarios</h3>
          <span className="badge badge-purple">Total: {totalVols}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(encuentro.voluntarios ?? {}).map(([k, v]) => (
            <StatRow key={k} label={k} value={v as number} />
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4">Online</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Aceptaron a Jesús"      value={String(encuentro.online?.acepto_jesus ?? 0)} />
          <Field label="Espectadores simultáneos" value={String(encuentro.online?.espectadores_max ?? 0)} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pb-8">
        <Link href={`/nuevo-reporte?edit=${id}`} className="btn-secondary">
          Editar reporte
        </Link>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  const labelMap: Record<string, string> = {
    auditorio: "Auditorio", kids: "Kids", tweens: "Tweens",
    sala_bebe: "Sala bebé", sala_sensorial: "Sala sensorial", cambio: "Cambio",
    servicio: "Servicio", tecnica: "Técnica", worship: "Worship",
    cocina: "Cocina", rrss: "RRSS", seguridad: "Seguridad",
    sala_bebes: "Sala bebés", conexion: "Conexión", oracion: "Oración",
    merch: "Merch", amor_por_la_casa: "Amor casa", punto_siembra: "Pto. siembra",
    cambios: "Cambios",
  };

  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 text-sm">
      <span className="text-gray-500 capitalize text-xs">
        {labelMap[label] ?? label}
      </span>
      <span className="font-semibold tabular-nums text-gray-800">{value}</span>
    </div>
  );
}
