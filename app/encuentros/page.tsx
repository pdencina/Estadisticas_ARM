import Link from "next/link";
import { getEncuentros } from "@/lib/queries/encuentros";
import { getCurrentUser } from "@/lib/queries/users";
import EncuentrosTable from "@/components/charts/EncuentrosTable";
import { PlusCircle } from "lucide-react";

export const revalidate = 60;

export default async function EncuentrosPage() {
  const user = await getCurrentUser();
  const campusId = user?.rol === "admin_global" ? undefined : user?.campus_id ?? undefined;
  const encuentros = await getEncuentros(campusId);

  const pendientes = encuentros.filter((e) => e.estado === "borrador").length;
  const enviados   = encuentros.filter((e) => e.estado === "enviado").length;
  const validados  = encuentros.filter((e) => e.estado === "validado").length;

  return (
    <div className="page-content space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Encuentros</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Historial de todos los encuentros reportados
          </p>
        </div>
        <Link href="/nuevo-reporte" className="btn-primary">
          <PlusCircle size={15} />
          Nuevo reporte
        </Link>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        <span className="badge badge-gray">
          Total: {encuentros.length}
        </span>
        {pendientes > 0 && (
          <span className="badge badge-amber">
            {pendientes} pendiente{pendientes !== 1 ? "s" : ""}
          </span>
        )}
        {enviados > 0 && (
          <span className="badge badge-green">
            {enviados} enviado{enviados !== 1 ? "s" : ""}
          </span>
        )}
        {validados > 0 && (
          <span className="badge badge-teal">
            {validados} validado{validados !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="card overflow-hidden">
        <EncuentrosTable
          encuentros={encuentros}
          showCampus={!campusId}
        />
      </div>
    </div>
  );
}
