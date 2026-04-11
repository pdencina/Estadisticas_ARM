import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center
                        text-white text-sm font-bold mx-auto mb-4"
            style={{ backgroundColor: "var(--arm-purple)" }}
          >
            AR
          </div>
          <h1 className="text-xl font-semibold text-gray-900">ARM Stats</h1>
          <p className="text-sm text-gray-400 mt-1">arm global</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Iniciar sesión
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Ingresa con tu cuenta ARM Global
          </p>
          <LoginForm />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ¿Problemas para ingresar? Contacta al administrador.
        </p>
      </div>
    </div>
  );
}
