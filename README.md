# 🏊‍♂️ Sistema de Gestión - Academia de Natación

Plataforma web profesional para gestionar la operación completa de una Academia de Natación.

## 📋 Descripción del Proyecto

El sistema maneja:
- ✅ Alumnos, inscripciones, grupos y planes
- ✅ Asistencia con control de horario y lector de código de barras
- ✅ Pagos con descuentos automáticos por antigüedad
- ✅ Profesores y personal con registro de asistencia
- ✅ Horarios variables por bloque
- ✅ Congelaciones, cambios y costos operativos
- ✅ Apertura/cierre de turno
- ✅ Reportes académicos y financieros
- ✅ Sistema de usuarios y roles escalable
- ✅ Dashboard con indicadores clave (KPIs)
- ✅ Módulo de fidelización con WhatsApp

## 🚀 Fases del Proyecto

### FASE 1: Infraestructura ✅ (COMPLETADA)
- [x] Estructura de directorios monorepo
- [x] Backend NestJS configurado
- [x] Frontend React + Vite configurado
- [x] Docker Compose (PostgreSQL + Redis)
- [x] Schema Prisma completo
- [x] Configuración de entorno

### FASE 2: Módulo IAM (Identity & Access Management)
- [ ] Entidades: User, Role, Permission
- [ ] Roles dinámicos y permisos granulares
- [ ] Autenticación JWT
- [ ] Políticas de asistencia por rol

### FASE 3: Módulo Academia - Core
- [ ] Alumnos, Planes, Grupos, Inscripciones
- [ ] Validación de horarios y cupos
- [ ] Ficha completa del alumno

### FASE 4: Módulo Academia - Operaciones
- [ ] Asistencia con validación horaria
- [ ] Pagos con descuento por antigüedad
- [ ] Congelaciones y cambios
- [ ] Turnos y costos operativos
- [ ] Liquidaciones de personal

### FASE 5: Sistema de Eventos y Acceso
- [ ] BarcodeProvider (listener global)
- [ ] Endpoint /access/scan unificado
- [ ] Registro manual fallback
- [ ] Sonidos y toasts

### FASE 6: Dashboard y Reportes
- [ ] Widgets de KPIs
- [ ] Cumpleaños (día/semana)
- [ ] Morosos y próximos a vencer
- [ ] Reportes exportables
- [ ] Configuración de mensajes

## 🛠️ Stack Tecnológico

**Backend:**
- NestJS 10+ (TypeScript)
- Prisma ORM
- PostgreSQL 15
- Redis 7
- JWT, Passport
- BullMQ (colas)
- Socket.io (tiempo real)

**Frontend:**
- React 18 + TypeScript
- Vite
- TanStack Query + Table
- Zustand (estado)
- TailwindCSS + Radix UI
- Recharts (gráficos)

## 📦 Instalación y Ejecución

### 1. Clonar y preparar entorno

```bash
cd /workspace
```

### 2. Levantar infraestructura (Docker)

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en `localhost:5432`
- Redis en `localhost:6379`

### 3. Configurar Backend

```bash
cd apps/backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```

El backend correrá en `http://localhost:3000`

### 4. Configurar Frontend

```bash
cd apps/frontend
cp .env.example .env
npm install
npm run dev
```

El frontend correrá en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
/workspace
├── apps/
│   ├── backend/          # API NestJS
│   └── frontend/         # App React
├── packages/             # Paquetes compartidos
├── docker/               # Configuración Docker
├── docs/                 # Documentación
├── scripts/              # Scripts utilitarios
├── docker-compose.yml
└── PROJECT_STRUCTURE.md  # Documentación detallada
```

## 🔐 Principios de Diseño

1. **ACID** - Transacciones atómicas para pagos
2. **SOLID** - Código mantenible
3. **DDD** - Contextos delimitados (IAM, Academy, Access)
4. **CQRS** - Dashboard como read model
5. **Event-Driven** - Escaneo como evento global
6. **Repository Pattern** - Abstracción de datos
7. **Strategy Pattern** - Políticas intercambiables

## 📝 Notas Importantes

- ❌ **No commitar `node_modules`** - Pesan mucho
- ✅ **Soft Delete** - Todas las entidades tienen `deleted_at`
- 🕐 **Timezone** - Todo en UTC, conversión en frontend
- 🔍 **Auditoría** - `created_by` y `updated_by` automáticos
- 🔄 **Idempotencia** - Claves únicas para evitar dobles cobros

## 📄 Licencia

MIT

---

**Documentación completa:** Ver `PROJECT_STRUCTURE.md`
