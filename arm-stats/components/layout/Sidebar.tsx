"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, PlusCircle, Building2,
  FileText, Users, LogOut, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/actions/auth";
import type { UserProfile } from "@/types";
import { ROL_LABELS } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard",      icon: LayoutDashboard, label: "Dashboard"        },
      { href: "/encuentros",     icon: Calendar,        label: "Encuentros"       },
      { href: "/nuevo-reporte",  icon: PlusCircle,      label: "Nuevo reporte"    },
    ],
  },
  {
    label: "Análisis",
    items: [
      { href: "/campus",   icon: Building2, label: "Por campus"        },
      { href: "/informes", icon: FileText,  label: "Informes semanales" },
    ],
  },
  {
    label: "Administración",
    items: [
      { href: "/usuarios", icon: Users, label: "Usuarios y roles", adminOnly: true },
    ],
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function Sidebar({ user }: { user: UserProfile }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center
                        text-white text-xs font-semibold shrink-0"
            style={{ backgroundColor: "var(--arm-purple)" }}
          >
            AR
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              ARM Stats
            </p>
            <p className="text-xs text-gray-400">arm global</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_ITEMS.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !("adminOnly" in item && item.adminOnly && user.rol !== "admin_global")
          );
          if (!visibleItems.length) return null;

          return (
            <div key={section.label}>
              <p className="section-heading px-2 mb-2">{section.label}</p>
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn("nav-link", active && "active")}
                      >
                        <item.icon
                          size={16}
                          className={active ? "" : "text-gray-400"}
                        />
                        <span>{item.label}</span>
                        {active && (
                          <ChevronRight size={12} className="ml-auto opacity-50" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center
                        text-xs font-semibold shrink-0"
            style={{
              backgroundColor: "var(--arm-purple-light)",
              color: "var(--arm-purple)",
            }}
          >
            {initials(user.nombre)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">
              {user.nombre}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {ROL_LABELS[user.rol]}
              {user.campus && ` · ${user.campus.nombre}`}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="Cerrar sesión"
            >
              <LogOut size={14} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
