# ARM Stats · Plataforma de Estadísticas

Plataforma web para el registro y análisis de encuentros de **arm global**.  
Stack: **Next.js 15 · Supabase · Vercel · GitHub**

---

## Estructura del proyecto

```
arm-stats/
├── app/
│   ├── login/                  # Página de login
│   ├── dashboard/              # Layout + páginas protegidas
│   │   ├── layout.tsx          # Sidebar + Topbar
│   │   ├── page.tsx            # Dashboard principal
│   ├── encuentros/
│   │   ├── page.tsx            # Listado de encuentros
│   │   └── [id]/page.tsx       # Detalle de encuentro
│   ├── nuevo-reporte/
│   │   └── page.tsx            # Formulario nuevo reporte
│   ├── campus/
│   │   └── page.tsx            # Comparativo por campus
│   ├── informes/
│   │   └── page.tsx            # Informes semanales
│   ├── usuarios/
│   │   └── page.tsx            # Gestión de usuarios (admin global)
│   └── api/auth/callback/      # Callback OAuth Supabase
├── components/
│   ├── layout/                 # Sidebar, Topbar
│   ├── forms/                  # LoginForm, NuevoReporteForm, etc.
│   └── charts/                 # KpiCards, BarrasCampus, tablas
├── lib/
│   ├── supabase/               # client.ts / server.ts / middleware.ts
│   ├── queries/                # encuentros.ts / campus.ts / users.ts
│   ├── actions/                # encuentros.ts / auth.ts (Server Actions)
│   └── utils.ts                # Helpers, formatters
├── types/
│   └── index.ts                # Tipos TypeScript globales
└── supabase/
    └── migrations/
        └── 001_initial.sql     # Tablas + RLS + Seed
```

---

## Roles y permisos

| Rol            | Dashboard | Ver encuentros | Crear reporte | Validar | Usuarios |
|----------------|:---------:|:--------------:|:-------------:|:-------:|:--------:|
| `admin_global` | Global    | Todos          | Cualquier campus | ✅   | ✅       |
| `admin_campus` | Su campus | Su campus      | Su campus     | —       | —        |
| `voluntario`   | Su campus | Su campus      | Su campus     | —       | —        |

---

## Setup local

### 1. Clonar y dependencias

```bash
git clone https://github.com/TU_ORG/arm-stats.git
cd arm-stats
npm install
```

### 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Base de datos Supabase

1. Ve a [supabase.com](https://supabase.com) → tu proyecto → **SQL Editor**
2. Copia y ejecuta el contenido de `supabase/migrations/001_initial.sql`
3. Verifica que se crearon las tablas: `campus`, `user_profiles`, `encuentros`, `informes_semanales`

### 4. Crear usuario admin global

```bash
# En Supabase > Authentication > Users > "Invite user"
# Ingresa el email del admin

# Luego en SQL Editor:
UPDATE public.user_profiles
SET rol = 'admin_global', nombre = 'Tu Nombre'
WHERE email = 'tu@email.com';
```

### 5. Levantar dev server

```bash
npm run dev
# → http://localhost:3000
```

---

## Deploy en Vercel

### 1. GitHub

```bash
git init
git add .
git commit -m "feat: initial ARM Stats platform"
git remote add origin https://github.com/TU_ORG/arm-stats.git
git push -u origin main
```

### 2. Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa el repo `arm-stats`
3. Framework: **Next.js** (detección automática)
4. Agrega las variables de entorno:

```
NEXT_PUBLIC_SUPABASE_URL      → https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY → eyJ...
SUPABASE_SERVICE_ROLE_KEY     → eyJ...
NEXT_PUBLIC_SITE_URL          → https://arm-stats.vercel.app
```

5. Click **Deploy** — listo en ~2 minutos

### 3. Configurar URL de callback en Supabase

En Supabase → **Authentication → URL Configuration**:

```
Site URL:           https://arm-stats.vercel.app
Redirect URLs:      https://arm-stats.vercel.app/api/auth/callback
```

---

## Crear usuarios de campus

Una vez con admin global activo:

```sql
-- 1. Invitar desde Supabase > Authentication > Users

-- 2. Asignar rol y campus:
UPDATE public.user_profiles
SET
  rol       = 'admin_campus',
  nombre    = 'Mario Muñoz',
  campus_id = (SELECT id FROM campus WHERE nombre = 'Puente Alto')
WHERE email = 'mario@armglobal.com';

-- Para voluntario:
UPDATE public.user_profiles
SET
  rol       = 'voluntario',
  nombre    = 'Jorge Pérez',
  campus_id = (SELECT id FROM campus WHERE nombre = 'Puente Alto')
WHERE email = 'jorge@armglobal.com';
```

---

## Generar tipos TypeScript desde Supabase (opcional)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Generar tipos
npm run db:types
```

---

## Campus incluidos (seed)

| Campus       | Ciudad       | País      |
|--------------|-------------|-----------|
| Stgo Centro  | Santiago    | Chile     |
| Puente Alto  | Puente Alto | Chile     |
| Punta Arenas | Punta Arenas| Chile     |
| Concepción   | Concepción  | Chile     |
| Montevideo   | Montevideo  | Uruguay   |
| Maracaibo    | Maracaibo   | Venezuela |
| Katy Texas   | Katy        | EE.UU.    |
| La Plata     | La Plata    | Argentina |

---

## Scripts útiles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run lint       # Lint ESLint
npm run db:types   # Generar tipos TypeScript desde Supabase
```

---

## Roadmap sugerido

- [ ] Exportar informe semanal a PDF (React PDF / Puppeteer)
- [ ] Notificaciones push lunes para generar informe
- [ ] Gráficos históricos mensuales con Recharts
- [ ] Modo PWA para ingreso desde celular en el encuentro
- [ ] Invitar usuarios directamente desde la UI (sin SQL)
- [ ] Historial de cambios por encuentro (audit log)

---

*arm global · ARM Stats v0.1*
