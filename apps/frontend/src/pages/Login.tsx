interface LoginProps {
  onLogin: () => void
}

export default function Login({ onLogin }: LoginProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Placeholder - implementación real en FASE 2
    onLogin()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-academy-light to-academy-dark">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-academy">🏊‍♂️ Academia</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email o CI
            </label>
            <input
              type="text"
              className="input-base"
              placeholder="usuario@academia.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="input-base"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="w-full btn-primary py-3">
            Iniciar Sesión
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Solo personal autorizado. Todos los accesos son registrados.
        </p>
      </div>
    </div>
  )
}
