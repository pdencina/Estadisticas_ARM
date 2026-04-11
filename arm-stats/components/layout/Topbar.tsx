"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import type { UserProfile } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":     "Dashboard global",
  "/encuentros":    "Encuentros",
  "/nuevo-reporte": "Nuevo reporte",
  "/campus":        "Por campus",
  "/informes":      "Informes semanales",
  "/usuarios":      "Usuarios y roles",
};

export default function Topbar({ user: _ }: { user: UserProfile }) {
  const pathname = usePathname();

  const title = Object.entries(PAGE_TITLES).find(([key]) =>
    key === "/dashboard" ? pathname === key : pathname.startsWith(key)
  )?.[1] ?? "ARM Stats";

  const semana = format(new Date(), "'Semana' w · MMMM yyyy", { locale: es });

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b
                       border-gray-100 px-6 py-3.5 flex items-center gap-4">
      <h1 className="text-base font-semibold text-gray-900 flex-1">{title}</h1>

      <span
        className="hidden sm:inline-flex text-xs font-medium px-3 py-1 rounded-full"
        style={{
          backgroundColor: "var(--arm-teal-light)",
          color: "var(--arm-teal)",
        }}
      >
        {semana}
      </span>

      <button className="btn-ghost p-2 relative">
        <Bell size={16} />
      </button>
    </header>
  );
}
