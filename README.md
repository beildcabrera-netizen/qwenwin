# 🏊 Academia de Natación - Plataforma de Gestión

Sistema completo para gestionar una academia de natación con control de acceso, pagos, asistencia y reportes.

## 📁 Estructura del Proyecto

```
miapp/
├── backend/                 # NestJS API
│   ├── prisma/              # Schema y migraciones
│   └── src/modules/         # Módulos: IAM, Auth, Academy, Turn, Access-Control, Dashboard, Settings
├── frontend/                # React + Vite
├── docker-compose.yml       # PostgreSQL, Redis, Backend, Frontend
└── README.md
```

## 🚀 Inicio Rápido con Docker

```bash
cd miapp
docker-compose up -d
```

**Acceso:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- **Admin por defecto:** CI `0000000`, Password `admin123`

## 📋 Características Implementadas

### ✅ Módulo Academy
- **Planes y Grupos:** CRUD completo con control de cupo y horarios
- **Inscripciones:** Wizard en 4 pasos con validaciones
- **Descuentos por antigüedad:** 5% (6 meses), 10% (1 año), 15% (2+ años)
- **Cambios:** Grupo y plan con prorrateo automático
- **Congelaciones:** Pausa de inscripción con aprobación de admin
- **Reactivación:** Recuperación con días restantes

### ✅ Módulo Turno (Caja)
- **Apertura/Cierre:** Con monto inicial y arqueo final
- **Pagos:** Registro con descuento automático por antigüedad
- **Movimientos:** Retiros y gastos con validación de fondo
- **Discrepancias:** Cálculo automático en cierre
- **Estadísticas:** Reportes mensuales

### ✅ Control de Acceso
- **Barcode Scanner:** Evento global sin interrumpir flujo
- **Validación de horario:** Alumnos solo en su ventana de clase
- **Registro manual:** Opción si olvida tarjeta
- **Políticas configurables:** Tardanza, horas extra, mínimos

### ✅ IAM (Usuarios y Roles)
- **Roles dinámicos:** Admin crea sin límite
- **Permisos granulares:** Por módulo y acción
- **Tipos de pago:** Hora/día/semana/mes/fijo configurable por usuario

## 🔧 Desarrollo Local

```bash
# Backend
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

## 📞 Soporte

Para más información, contactar al administrador del sistema.
