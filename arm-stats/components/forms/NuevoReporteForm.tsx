"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { crearEncuentro } from "@/lib/actions/encuentros";
import type { Campus, AsistenciaDetalle, VoluntariosDetalle } from "@/types";
import { HORARIOS } from "@/lib/utils";
import { Loader2, Save, Send } from "lucide-react";

// ── Counter sub-component ───────────────────────────────────────────────────
function Counter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="counter-box">
      <span className="text-xs text-gray-500 truncate pr-2">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          className="counter-btn"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </button>
        <span className="text-sm font-semibold w-7 text-center tabular-nums">
          {value}
        </span>
        <button
          type="button"
          className="counter-btn"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ── Section heading ─────────────────────────────────────────────────────────
function SectionCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <h3>{title}</h3>
        {badge && (
          <span className="badge badge-purple text-[10px]">{badge}</span>
        )}
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  );
}

// ── Default states ──────────────────────────────────────────────────────────
const DEFAULT_ASISTENCIA: AsistenciaDetalle = {
  auditorio: 0, kids: 0, tweens: 0,
  sala_bebe: 0, sala_sensorial: 0, cambio: 0,
};

const DEFAULT_VOLUNTARIOS: VoluntariosDetalle = {
  servicio: 0, tecnica: 0, kids: 0, tweens: 0,
  worship: 0, cocina: 0, rrss: 0, seguridad: 0,
  sala_bebes: 0, conexion: 0, oracion: 0, merch: 0,
  amor_por_la_casa: 0, sala_sensorial: 0, punto_siembra: 0, cambios: 0,
};

// ── Main form ───────────────────────────────────────────────────────────────
export default function NuevoReporteForm({
  campusList,
  campusDefault,
}: {
  campusList: Campus[];
  campusDefault?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Básicos
  const [campusId,       setCampusId]       = useState(campusDefault ?? campusList[0]?.id ?? "");
  const [fecha,          setFecha]          = useState(new Date().toISOString().split("T")[0]);
  const [tipo,           setTipo]           = useState("domingo");
  const [horario,        setHorario]        = useState("11:00");
  const [modalidad,      setModalidad]      = useState("presencial");
  const [predicador,     setPredicador]     = useState("");
  const [nombreMensaje,  setNombreMensaje]  = useState("");
  const [totalGeneral,   setTotalGeneral]   = useState(0);
  const [paj,            setPaj]            = useState(0);

  // Asistencia
  const [asistencia, setAsistencia] = useState<AsistenciaDetalle>(DEFAULT_ASISTENCIA);
  const updateAsistencia = (k: keyof AsistenciaDetalle, v: number) =>
    setAsistencia((prev) => ({ ...prev, [k]: v }));

  // Voluntarios
  const [voluntarios, setVoluntarios] = useState<VoluntariosDetalle>(DEFAULT_VOLUNTARIOS);
  const updateVoluntario = (k: keyof VoluntariosDetalle, v: number) =>
    setVoluntarios((prev) => ({ ...prev, [k]: v }));

  // Online
  const [onlinePaj,         setOnlinePaj]         = useState(0);
  const [onlineEspectadores, setOnlineEspectadores] = useState(0);

  // Liderazgo
  const [lideresVol,   setLideresVol]   = useState("");
  const [admsCampus,   setAdmsCampus]   = useState("");

  // Totales calculados
  const totalVols = Object.values(voluntarios).reduce((s, v) => s + v, 0);
  const totalAsis = Object.values(asistencia).reduce((s, v) => s + v, 0);

  async function submit(estado: "borrador" | "enviado") {
    if (!campusId) {
      toast.error("Selecciona un campus");
      return;
    }

    startTransition(async () => {
      try {
        await crearEncuentro(
          {
            campus_id:               campusId,
            fecha,
            tipo:                    tipo as never,
            horario,
            modalidad:               modalidad as never,
            predicador:              predicador || null,
            nombre_mensaje:          nombreMensaje || null,
            total_general:           totalGeneral,
            acepto_jesus_presencial: paj,
            asistencia,
            voluntarios,
            online: { acepto_jesus: onlinePaj, espectadores_max: onlineEspectadores },
            lideres_voluntarios:     lideresVol || null,
            admins_campus:           admsCampus || null,
          },
          estado
        );
        toast.success(
          estado === "enviado" ? "Reporte enviado correctamente" : "Borrador guardado"
        );
        router.push("/encuentros");
      } catch (err) {
        toast.error((err as Error).message ?? "Error al guardar");
      }
    });
  }

  return (
    <div className="space-y-5">

      {/* ── Información general ───────────────────────────── */}
      <SectionCard title="Información del encuentro">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Campus</label>
            <select
              className="form-input"
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
            >
              {campusList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Fecha</label>
            <input
              type="date"
              className="form-input"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Tipo de encuentro</label>
            <select
              className="form-input"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="domingo">Domingo</option>
              <option value="miercoles">Miércoles</option>
              <option value="jueves">Jueves</option>
              <option value="sabado">Sábado</option>
              <option value="prayer_room">Prayer Room</option>
              <option value="encuentro_global">Encuentro Global</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="form-label">Horario</label>
            <select
              className="form-input"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
            >
              {HORARIOS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Modalidad</label>
            <select
              className="form-input"
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
            >
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Predicador/a</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Pastora Naty Segura"
              value={predicador}
              onChange={(e) => setPredicador(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Nombre del mensaje</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Tumba vacía, corazón encendido"
              value={nombreMensaje}
              onChange={(e) => setNombreMensaje(e.target.value)}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── Totales ───────────────────────────────────────── */}
      <SectionCard title="Totales generales">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Total general</label>
            <input
              type="number"
              min={0}
              className="form-input text-lg font-semibold"
              value={totalGeneral || ""}
              onChange={(e) => setTotalGeneral(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="form-label">Aceptaron a Jesús (presencial)</label>
            <input
              type="number"
              min={0}
              className="form-input text-lg font-semibold"
              style={{ color: "var(--arm-teal)" }}
              value={paj || ""}
              onChange={(e) => setPaj(Number(e.target.value))}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── Asistencia detallada ──────────────────────────── */}
      <SectionCard title="Desglose de asistencia" badge={`Total: ${totalAsis}`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(
            [
              ["auditorio",    "Auditorio"],
              ["kids",         "Kids"],
              ["tweens",       "Tweens"],
              ["sala_bebe",    "Sala bebé"],
              ["sala_sensorial","Sala sensorial"],
              ["cambio",       "Cambio"],
            ] as [keyof AsistenciaDetalle, string][]
          ).map(([key, label]) => (
            <Counter
              key={key}
              label={label}
              value={asistencia[key]}
              onChange={(v) => updateAsistencia(key, v)}
            />
          ))}
        </div>
      </SectionCard>

      {/* ── Voluntarios ───────────────────────────────────── */}
      <SectionCard title="Voluntarios" badge={`Total: ${totalVols}`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(
            [
              ["servicio",        "Servicio"],
              ["tecnica",         "Técnica"],
              ["kids",            "Kids"],
              ["tweens",          "Tweens"],
              ["worship",         "Worship"],
              ["cocina",          "Cocina"],
              ["rrss",            "R.R.S.S"],
              ["seguridad",       "Seguridad"],
              ["sala_bebes",      "Sala bebés"],
              ["conexion",        "Conexión"],
              ["oracion",         "Oración"],
              ["merch",           "Merch"],
              ["amor_por_la_casa","Amor por la casa"],
              ["sala_sensorial",  "Sala sensorial"],
              ["punto_siembra",   "Punto de siembra"],
              ["cambios",         "Cambios"],
            ] as [keyof VoluntariosDetalle, string][]
          ).map(([key, label]) => (
            <Counter
              key={key}
              label={label}
              value={voluntarios[key]}
              onChange={(v) => updateVoluntario(key, v)}
            />
          ))}
        </div>
      </SectionCard>

      {/* ── Online ────────────────────────────────────────── */}
      <SectionCard title="Online">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Aceptaron a Jesús (online)</label>
            <input
              type="number"
              min={0}
              className="form-input"
              value={onlinePaj || ""}
              onChange={(e) => setOnlinePaj(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="form-label">Espectadores simultáneos máx.</label>
            <input
              type="number"
              min={0}
              className="form-input"
              value={onlineEspectadores || ""}
              onChange={(e) => setOnlineEspectadores(Number(e.target.value))}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── Liderazgo ─────────────────────────────────────── */}
      <SectionCard title="Liderazgo">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Líderes de voluntarios</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Jorge y Susy"
              value={lideresVol}
              onChange={(e) => setLideresVol(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Administradores de campus</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ej: Mario y Mirta"
              value={admsCampus}
              onChange={(e) => setAdmsCampus(e.target.value)}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── Acciones ──────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          type="button"
          className="btn-secondary"
          disabled={isPending}
          onClick={() => submit("borrador")}
        >
          <Save size={14} />
          Guardar borrador
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={isPending}
          onClick={() => submit("enviado")}
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
          Enviar reporte
        </button>
      </div>
    </div>
  );
}
