Backend for /excel (Warehouse Inventory)

1) Requirements
- Node 20+
- MariaDB running locally (port 3306) with schema jk_vue
  - Provide DB credentials via environment variables in server/.env (not committed)

2) Setup DB schema (if schema is missing)
CREATE DATABASE IF NOT EXISTS jk_vue CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

3) Install deps
npm install

4) Run servers
- API server (port 5174):
  npm run server
- Vite dev server (port 5173 default):
  npm run dev

5) Environment variables (create server/.env)
PORT=5174
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_local_password
DB_NAME=jk_vue
DB_CONN_LIMIT=5

6) Endpoints
- GET http://localhost:5174/inventory
- POST http://localhost:5174/inventory { name, stock, etc }
- PUT http://localhost:5174/inventory/:id { name? | stock? | etc? }

The server auto-creates the table `inventory` if it does not exist.
