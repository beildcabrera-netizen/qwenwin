export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard - Academia de Natación</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Widgets placeholder - Se implementarán en FASE 6 */}
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Alumnos Activos</h3>
          <p className="text-3xl font-bold text-academy mt-2">--</p>
        </div>
        
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Tasa de Asistencia</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">--%</p>
        </div>
        
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Morosos</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">--</p>
        </div>
        
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Turnos del Mes</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">--</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cumpleaños del Día - FASE 6 */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">🎂 Cumpleañero del Día</h2>
          <p className="text-gray-500">No hay cumpleaños hoy</p>
        </div>
        
        {/* Personal dentro - FASE 5 */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">👥 Personal en Instalaciones</h2>
          <p className="text-gray-500">Sin registros activos</p>
        </div>
      </div>
    </div>
  )
}
