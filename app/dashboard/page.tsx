import { Suspense } from "react";
import { getDashboardKPIs } from "@/lib/queries/encuentros";
import { getEncuentrosSemanaActual, getEncuentrosPendientes } from "@/lib/queries/encuentros";
import { getCurrentUser } from "@/lib/queries/users";
import KpiCards from "@/components/charts/KpiCards";
import EncuentrosTable from "@/components/charts/EncuentrosTable";
import BarrasCampus from "@/components/charts/BarrasCampus";
import ContadorAlmas from "@/components/charts/ContadorAlmas";

export const revalidate = 60; // revalida cada 60s

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const campusId = user?.rol === "admin_global" ? undefined : user?.campus_id ?? undefined;

  const [kpis, encuentros, pendientes] = await Promise.all([
    getDashboardKPIs(campusId),
    getEncuentrosSemanaActual(),
    getEncuentrosPendientes(),
  ]);

  // Filtrar por campus si no es admin global
  const misEncuentros = campusId
    ? encuentros.filter((e) => e.campus_id === campusId)
    : encuentros;

  return (
    <div className="page-content space-y-6">

      {/* KPIs */}
      <KpiCards kpis={kpis} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Barra campus */}
        <div className="xl:col-span-2">
          <BarrasCampus encuentros={encuentros} />
        </div>

        {/* Contador de almas */}
        <ContadorAlmas total={16384} />
      </div>

      {/* Encuentros semana */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3>Encuentros de esta semana</h3>
          {pendientes.length > 0 && (
            <span className="badge badge-amber">
              {pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <EncuentrosTable encuentros={misEncuentros} showCampus={!campusId} />
      </div>
    </div>
  );
}
