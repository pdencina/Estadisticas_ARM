import { redirect } from "next/navigation";
import { getAllUsers } from "@/lib/queries/users";
import { getCurrentUser } from "@/lib/queries/users";
import { getCampus } from "@/lib/queries/campus";
import { ROL_LABELS } from "@/lib/utils";
import { UserPlus, Shield } from "lucide-react";
import type { UserProfile } from "@/types";

export const revalidate = 60;

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const ROL_COLORS: Record<string, { bg: string; text: string }> = {
  admin_global:  { bg: "#EFF6FF", text: "#1D4ED8" },
  admin_campus:  { bg: "var(--arm-purple-light)", text: "var(--arm-purple)" },
  voluntario:    { bg: "#FFFBEB", text: "#B45309" },
};

const AVATAR_COLORS = [
  { bg: "var(--arm-purple-light)", text: "var(--arm-purple)" },
  { bg: "var(--arm-teal-light)",   text: "var(--arm-teal)" },
  { bg: "#FAECE7", text: "#D85A30" },
  { bg: "#EFF6FF", text: "#1D4ED8" },
];

export default async function UsuariosPage() {
  const user = await getCurrentUser();
  if (user?.rol !== "admin_global") redirect("/dashboard");

  const [users, campus] = await Promise.all([getAllUsers(), getCampus()]);

  const campusMap = Object.fromEntries(campus.map((c) => [c.id, c.nombre]));

  return (
    <div className="page-content space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Usuarios y roles</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Gestión de accesos a la plataforma
          </p>
        </div>
        <button className="btn-primary">
          <UserPlus size={14} />
          Invitar usuario
        </button>
      </div>

      {/* Roles explanation */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={14} className="text-gray-400" />
          <h3>Niveles de acceso</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <RoleInfo
            role="admin_global"
            desc="Ve todos los campus, genera informes, gestiona usuarios y campus. Puede validar reportes."
          />
          <RoleInfo
            role="admin_campus"
            desc="Ingresa y edita reportes de su campus asignado. Ve estadísticas propias."
          />
          <RoleInfo
            role="voluntario"
            desc="Solo puede ingresar datos del encuentro asignado por el administrador de campus."
          />
        </div>
      </div>

      {/* Users grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {users.map((u, i) => {
          const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const roleColor = ROL_COLORS[u.rol];

          return (
            <div
              key={u.id}
              className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center
                           text-xs font-semibold shrink-0"
                style={{ backgroundColor: av.bg, color: av.text }}
              >
                {initials(u.nombre)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {u.nombre}
                </p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span
                    className="badge text-[10px]"
                    style={{
                      backgroundColor: roleColor.bg,
                      color: roleColor.text,
                    }}
                  >
                    {ROL_LABELS[u.rol]}
                  </span>
                  {u.campus_id && (
                    <span className="badge badge-gray text-[10px]">
                      {campusMap[u.campus_id] ?? "—"}
                    </span>
                  )}
                  {!u.activo && (
                    <span className="badge badge-red text-[10px]">Inactivo</span>
                  )}
                </div>
              </div>

              <button className="btn-ghost text-xs text-gray-400 shrink-0">
                Editar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoleInfo({ role, desc }: { role: string; desc: string }) {
  const c = ROL_COLORS[role];
  return (
    <div className="p-3 rounded-lg bg-gray-50">
      <span
        className="badge text-xs mb-2"
        style={{ backgroundColor: c.bg, color: c.text }}
      >
        {ROL_LABELS[role]}
      </span>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
