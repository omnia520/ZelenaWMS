# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack Warehouse Management System (WMS) for sales, picking, packing, and inventory management. Backend uses Node.js/Express/PostgreSQL, frontend uses React/Vite/TailwindCSS.

## Development Commands

### Backend (in `back/` directory)

```bash
# Install dependencies
npm install

# Development mode (auto-reload with nodemon)
npm run dev

# Production mode
npm start

# Database setup
psql -U postgres -c "CREATE DATABASE wms_db;"
psql -U postgres -d wms_db -f database/schema.sql
psql -U postgres -d wms_db -f database/seed.sql  # Optional test data
```

Backend runs on `http://localhost:3000` by default.

### Frontend (in `front/` directory)

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Lint code
npm run lint
```

Frontend dev server runs on `http://localhost:5173` by default.

## Architecture

### Backend Structure

**MVC Pattern with PostgreSQL:**
- `src/config/db.js` - PostgreSQL connection pool with query helpers and transaction support
  - **Zona Horaria:** Configurada automáticamente a Colombia (America/Bogota, UTC-5) en cada conexión
  - Todas las fechas y timestamps se registran en hora de Colombia
- `src/models/*.model.js` - Data models with static methods for database operations
- `src/controllers/*.controller.js` - Route handlers with business logic
- `src/routes/*.routes.js` - Express route definitions
- `src/middlewares/auth.js` - JWT authentication and RBAC (role-based access control)
- `src/middlewares/errorHandler.js` - Centralized error handling
- `src/utils/picking-routes.js` - Warehouse picking optimization algorithms

**Authentication:**
- JWT-based auth with roles: Vendedor, Jefe_Bodega, Operario, Facturacion, Administrador
- Tokens in `Authorization: Bearer <token>` header
- `verifyToken` middleware validates tokens
- `checkRole(...roles)` middleware enforces role-based permissions

**Key Database Tables:**
- `usuarios` - Users with roles
- `clientes` - Customers
- `productos` - Products catalog
- `ordenes_venta` - Sales orders with workflow states
- `orden_detalles` - Order line items
- `ubicaciones` - Warehouse locations (estantería/fila/nivel)
- `inventario_ubicaciones` - Product inventory by location
- `recepciones` - Inventory receipts
- `averias` - Damage reports

### Frontend Structure

**React with Zustand state management:**
- `src/store/authStore.js` - Authentication state with Zustand
- `src/services/api.js` - Axios API client with interceptors
- `src/components/layout/Layout.jsx` - Main layout wrapper
- `src/pages/` - Page components organized by feature
- `src/App.jsx` - Router configuration with protected routes

**Route Protection:**
- `<ProtectedRoute>` - Requires authentication, redirects to login
- `<PublicRoute>` - Public pages, redirects authenticated users to dashboard

## Order Workflow

Orders progress through these states:
1. `Borrador` - Draft order (created by Vendedor)
2. `Pendiente_Aprobacion` - Submitted for approval
3. `Aprobada` - Approved by Jefe_Bodega
4. `En_Alistamiento` - Being picked by Operario
5. `En_Empaque` - Being packed by Operario
6. `Lista_Facturar` - Ready for invoicing
7. `Facturada` - Invoiced (final state)
8. `Rechazada` - Rejected

## Picking List Optimization

The system optimizes warehouse picking routes:
- `getOptimizedPickingList(orden_id)` returns products ordered by warehouse location
- Locations sorted by `orden_ruta`, `estanteria`, `fila`, `nivel`
- Supports multiple locations per product (primary vs. secondary)
- Calculates picking statistics (total items, locations to visit, missing locations)

## Database Transactions

Use `getClient()` for multi-step operations requiring atomicity:
```javascript
const client = await getClient();
try {
  await client.query('BEGIN');
  // ... multiple queries
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

## Timezone Configuration

**All timestamps are recorded in Colombia time (UTC-5):**

- **Database:** PostgreSQL connections automatically set timezone to 'America/Bogota'
- **Backend:** `db.js` configures timezone on every connection (pool, transactions, test connections)
- **Schema:** All `CURRENT_TIMESTAMP` defaults use Colombia time
- **Helper Function:** `now_colombia()` available in database for explicit Colombia time queries

**Important Notes:**
- Use `CURRENT_TIMESTAMP` in SQL queries (NOT JavaScript `new Date()`)
- Existing data is not modified by timezone config
- For migrations on existing databases, run: `psql -U postgres -d wms_db -f database/migrations/001_add_colombia_timezone.sql`

## Environment Variables

Backend requires `.env` file:
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=wms_db
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## API Authentication

Default admin credentials (from schema.sql):
- Email: `admin@wms.com`
- Password: `admin123`

All API routes except `/api/auth/login` and `/api/auth/register` require JWT token.

## Testing the API

Use the health check endpoint:
```bash
curl http://localhost:3000/health
```

Login and get token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@wms.com", "password": "admin123"}'
```

## Deployment on Azure

### Frontend Deployment - Fixing React Router 404 Errors

The project includes configuration files to fix 404 errors when navigating between pages in Azure:

**Option 1: Azure Static Web Apps** (Recommended for SPAs)
- File: `front/public/staticwebapp.config.json` ✓ Included
- This file redirects all routes to `index.html` so React Router can handle routing
- Automatically deployed when you push to GitHub/GitLab with Azure Static Web Apps

**Option 2: Azure App Service (Windows/IIS)**
- File: `front/public/web.config` ✓ Included
- Uses IIS URL Rewrite module to redirect all routes to `index.html`
- Deployed automatically when you build and deploy to Azure App Service

**How to identify which service you're using:**
1. **Azure Static Web Apps**: URL looks like `https://<name>.azurestaticapps.net` or uses custom domain
2. **Azure App Service**: URL looks like `https://<name>.azurewebsites.net`
3. **Azure Storage**: URL looks like `https://<name>.z13.web.core.windows.net`

**Build and deploy steps:**
```bash
cd front
npm run build
# The dist/ folder contains your production build with config files
```

Both config files are included in `front/public/` and will be automatically copied to the build output.
