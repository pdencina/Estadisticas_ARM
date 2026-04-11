import { getCampus } from "@/lib/queries/campus";
import { getCurrentUser } from "@/lib/queries/users";
import NuevoReporteForm from "@/components/forms/NuevoReporteForm";

export default async function NuevoReportePage() {
  const [user, campusList] = await Promise.all([
    getCurrentUser(),
    getCampus(),
  ]);

  // Filtrar campus según rol
  const camposDisponibles =
    user?.rol === "admin_global"
      ? campusList
      : campusList.filter((c) => c.id === user?.campus_id);

  return (
    <div className="page-content max-w-3xl">
      <div className="mb-6">
        <h2>Nuevo reporte de encuentro</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Completa todos los campos del encuentro
        </p>
      </div>
      <NuevoReporteForm
        campusList={camposDisponibles}
        campusDefault={user?.campus_id ?? undefined}
      />
    </div>
  );
}
