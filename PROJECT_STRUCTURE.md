# 🏊‍♂️ ACADEMIA DE NATACIÓN - ESTRUCTURA DEL PROYECTO

## 📌 DIVISIÓN POR FASES PROFESIONALES

### FASE 1: Infraestructura y Configuración Base ✅
- [x] Estructura de directorios monorepo
- [x] Backend: NestJS + TypeScript
- [x] Frontend: React + TypeScript + Vite
- [x] Docker Compose: PostgreSQL + Redis
- [x] Prisma ORM con esquema de base de datos
- [x] Configuración de entorno (.env.example)
- [x] Scripts de inicialización

### FASE 2: Módulo IAM (Identity & Access Management)
- [ ] Entidades: User, Role, Permission
- [ ] Roles dinámicos (CRUD completo)
- [ ] Permisos granulares por módulo
- [ ] Autenticación JWT con refresh tokens
- [ ] Políticas de asistencia configurables por rol
- [ ] Códigos de barras basados en CI
- [ ] Tipos de pago configurables por usuario

### FASE 3: Módulo Academia - Core
- [ ] Entidades: Student, Plan, Group, Enrollment
- [ ] Planes: Regulares y Especiales
- [ ] Grupos con horarios y cupos
- [ ] Inscripciones (wizard 4 pasos)
- [ ] Validación de superposición de horarios
- [ ] Ficha completa del alumno
- [ ] Estado de cuenta en tiempo real

### FASE 4: Módulo Academia - Operaciones
- [ ] Asistencia con validación de ventana horaria
- [ ] Pagos con descuento por antigüedad automático
- [ ] Congelaciones (licencia médica)
- [ ] Cambios de grupo/horario/plan con prorrateo
- [ ] Turnos: Apertura, pagos, retiros, cierre
- [ ] Costos operativos (servicios, mantenimiento)
- [ ] Sueldos y liquidaciones de personal
- [ ] Generación asíncrona de recibos PDF

### FASE 5: Sistema de Eventos y Acceso
- [ ] BarcodeProvider (listener global frontend)
- [ ] Endpoint unificado /access/scan
- [ ] Servicios de asistencia polimórficos
- [ ] Registro manual (fallback)
- [ ] Toasts y sonidos por evento
- [ ] Integración WhatsApp (botones y mensajes)
- [ ] Socket.io para contador en tiempo real

### FASE 6: Dashboard y Reportes
- [ ] Widgets: Activos, asistencia, morosos, turnos, costos, utilidad
- [ ] Cumpleañeros del día (banner destacado)
- [ ] Cumpleaños de la semana (lista + WhatsApp)
- [ ] Morosos / Próximos a vencer
- [ ] Personal dentro de instalaciones
- [ ] Reportes: Ingresos, alumnos, asistencia, ocupación, liquidaciones
- [ ] Exportación Excel/PDF
- [ ] Panel de configuración de mensajes automatizados

---

## 🗂️ ESTRUCTURA DE DIRECTORIOS

```
/workspace
├── apps/
│   ├── backend/              # NestJS API
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/       # Guards, interceptors, filters, decorators
│   │   │   ├── config/       # Configuraciones
│   │   │   └── modules/      # Módulos del sistema
│   │   │       ├── iam/      # Identity & Access Management
│   │   │       ├── academy/  # Módulo Academia
│   │   │       ├── access/   # Control de acceso (escáner)
│   │   │       ├── dashboard/# Dashboard read-only
│   │   │       └── settings/ # Configuración de mensajes
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── test/
│   │   ├── .env.example
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/             # React + Vite
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── components/   # Componentes reutilizables
│       │   │   ├── ui/       # Componentes base (Button, Input, etc.)
│       │   │   ├── layout/   # Layouts (Sidebar, Header, etc.)
│       │   │   ├── barcode/  # BarcodeProvider
│       │   │   └── widgets/  # Widgets del dashboard
│       │   ├── pages/        # Páginas por módulo
│       │   ├── hooks/        # Custom hooks
│       │   ├── services/     # API calls
│       │   ├── stores/       # State management (Zustand)
│       │   ├── utils/        # Utilidades
│       │   └── types/        # TypeScript types
│       ├── public/
│       │   ├── sounds/       # Sonidos para eventos
│       │   └── images/
│       ├── .env.example
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
│
├── packages/                 # Paquetes compartidos
│   ├── shared-types/         # Tipos TypeScript compartidos
│   └── ui-components/        # Componentes UI compartidos (opcional)
│
├── docker/
│   ├── postgres/
│   │   └── init.sql
│   └── redis/
│
├── docs/                     # Documentación
│   ├── api/                  # Documentación de API
│   ├── architecture/         # Decisiones arquitectónicas
│   └── user-manual/          # Manual de usuario
│
├── scripts/                  # Scripts de utilería
│   ├── seed.ts               # Seed de base de datos
│   └── generate-pdf.ts       # Generación de PDFs
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .gitignore
├── .env.example
├── README.md
└── PROJECT_STRUCTURE.md
```

---

## 🛠️ STACK TECNOLÓGICO

### Backend
- **Framework:** NestJS 10+ (TypeScript)
- **ORM:** Prisma
- **Base de Datos:** PostgreSQL 15+
- **Caché/Cola:** Redis 7+
- **Autenticación:** JWT (passport-jwt)
- **Validación:** class-validator, class-transformer
- **PDF:** PDFKit
- **Colas:** BullMQ (para PDFs y alertas)
- **WebSockets:** Socket.io (tiempo real)

### Frontend
- **Framework:** React 18+ (TypeScript)
- **Build Tool:** Vite
- **Estado:** Zustand
- **UI Components:** Radix UI + TailwindCSS
- **HTTP Client:** Axios / TanStack Query
- **Sonidos:** use-sound
- **Gráficos:** Recharts
- **Tablas:** TanStack Table
- **Formularios:** React Hook Form + Zod

### DevOps
- **Contenedores:** Docker + Docker Compose
- **Tests:** Jest (backend), Vitest (frontend)
- **E2E:** Playwright
- **CI/CD:** GitHub Actions (pendiente)

---

## 📊 MODELO DE DATOS (Resumen)

### Contexto IAM
- `users` - Usuarios del sistema
- `roles` - Roles dinámicos
- `permissions` - Permisos granulares
- `role_permissions` - Relación roles-permisos
- `user_roles` - Relación usuarios-roles
- `attendance_policies` - Políticas por rol
- `user_payment_configs` - Configuración de pago por usuario

### Contexto Academy
- `academy_students` - Alumnos
- `academy_plans` - Planes de estudio
- `academy_groups` - Grupos con horarios
- `academy_enrollments` - Inscripciones activas
- `academy_payments` - Pagos de mensualidades
- `academy_attendance` - Asistencia de alumnos
- `academy_freezes` - Congelaciones
- `academy_changes` - Cambios (grupo/horario/plan)
- `academy_shifts` - Turnos (apertura/cierre)
- `academy_shift_payments` - Pagos en turno
- `academy_shift_withdrawals` - Retiros de turno
- `academy_operational_costs` - Gastos operativos

### Contexto Access
- `access_logs` - Registro universal de accesos
- `barcodes` - Códigos de barras asociados

### Contexto Settings
- `message_templates` - Plantillas de mensajes WhatsApp

---

## 🔐 PRINCIPIOS DE DISEÑO APLICADOS

1. **ACID** - Transacciones atómicas para pagos y stock
2. **SOLID** - Código mantenible y escalable
3. **Domain-Driven Design** - Contextos delimitados claros
4. **CQRS** - Dashboard como read model separado
5. **Event-Driven** - Sistema de eventos para escaneo global
6. **Repository Pattern** - Abstracción de acceso a datos
7. **Strategy Pattern** - Políticas de asistencia intercambiables

---

## 🚀 COMANDOS DE INICIO RÁPIDO

```bash
# Levantar infraestructura (PostgreSQL + Redis)
docker-compose up -d

# Backend
cd apps/backend
npm install
npx prisma migrate dev
npm run start:dev

# Frontend
cd apps/frontend
npm install
npm run dev
```

---

## 📝 NOTAS IMPORTANTES

- **No commitar node_modules** - Todos los paquetes se instalan localmente
- **Soft Delete** - Todas las entidades principales tienen `deleted_at`
- **Timezone** - Todo en UTC, conversión en frontend a America/La_Paz
- **Auditoría** - created_by y updated_by automáticos vía interceptor
- **Idempotencia** - Claves únicas para evitar dobles cobros
