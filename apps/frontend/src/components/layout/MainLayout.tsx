import { Outlet, Link, useLocation } from 'react-router-dom'

export function MainLayout() {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Academia', href: '/academy', icon: '🏊‍♂️' },
    { name: 'Usuarios', href: '/users', icon: '👥' },
    { name: 'Accesos', href: '/access', icon: '📷' },
    { name: 'Configuración', href: '/settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-academy">🏊‍♂️ Academia</h1>
          <p className="text-xs text-gray-500 mt-1">Sistema de Gestión</p>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-academy text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-academy-light flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <p className="font-medium text-sm">Admin</p>
              <p className="text-xs text-gray-500">admin@academia.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64">
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {navigation.find(n => location.pathname === n.href || location.pathname.startsWith(n.href))?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full" title="Notificaciones">
                🔔
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full" title="Ayuda">
                ❓
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
