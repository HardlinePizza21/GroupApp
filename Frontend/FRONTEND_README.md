# GroupsApp — Frontend

React + Vite frontend para el sistema de mensajería distribuida del proyecto ST0263/SI3007.

## Stack

- **React 18** + **Vite 5**
- **React Router 6** (rutas protegidas)
- **Axios** (REST con interceptor JWT refresh automático)
- **Socket.IO Client** (mensajería en tiempo real)

## Estructura

```
src/
├── api/client.js          # Axios instance + todas las llamadas a la API
├── context/AuthContext.jsx # Estado de auth (user, token, login, logout)
├── hooks/useSocket.js      # Conexión Socket.IO (join_channel, send_message)
├── pages/
│   ├── AuthPage.jsx        # Login + Registro
│   └── ChatPage.jsx        # Página principal (orquesta todo el estado)
└── components/
    ├── GroupsSidebar.jsx   # Sidebar izquierdo — lista de grupos (iconos)
    ├── ChannelsSidebar.jsx # Sidebar central — canales del grupo
    ├── ChatWindow.jsx      # Panel derecho — mensajes
    ├── MessageBubble.jsx   # Burbuja de mensaje con chulitos de estado
    ├── MessageInput.jsx    # Input con adjuntar archivo + enviar
    └── modals/
        ├── CreateGroupModal.jsx   # Modal crear grupo
        ├── CreateChannelModal.jsx # Modal crear canal
        └── InviteModal.jsx        # Modal invitar usuario
```

## Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar VITE_API_URL si el backend no está en localhost:3000

# 3. Modo desarrollo (con proxy al backend)
npm run dev

# 4. Build para producción
npm run build
# Los archivos quedan en /dist — servir con nginx o el mismo Express
```

## Variables de entorno

| Variable        | Descripción                            | Default               |
|-----------------|----------------------------------------|-----------------------|
| `VITE_API_URL`  | URL base del backend                   | `http://localhost:3000` |

## ⚠️ Endpoints que el backend necesita agregar

El frontend consume todos los endpoints actuales del backend más **2 endpoints adicionales**
que son necesarios para que la UI funcione completa:

### 1. `GET /groups/my` — Listar grupos del usuario autenticado

```js
// Respuesta esperada:
[
  { id: 1, name: "Grupo A", description: "...", ownerId: 5, role: "ADMIN" },
  { id: 2, name: "Grupo B", description: null,  ownerId: 3, role: "MEMBER" }
]

// Implementación sugerida en group.controller.js:
export const getMyGroups = async (req, res) => {
  const memberships = await prisma.groupMember.findMany({
    where: { userId: req.user.userId },
    include: { group: true },
  });
  const groups = memberships.map((m) => ({ ...m.group, role: m.role }));
  res.json(groups);
};
```

Agregar en `group.routes.js`:
```js
router.get("/my", authMiddleware, controller.getMyGroups);
```

---

### 2. `GET /channels/:channelId/messages` — Historial de mensajes con paginación

```js
// Query params: ?page=1&limit=50
// Respuesta esperada:
[
  {
    id: 1,
    content: "Hola!",
    fileUrl: null,
    fileType: null,
    status: "READ",
    senderId: 3,
    createdAt: "2026-03-31T18:00:00.000Z",
    sender: { id: 3, username: "juan" }
  }
]

// Implementación sugerida en message.controller.js:
export const getMessages = async (req, res) => {
  const { channelId } = req.params;
  const page  = parseInt(req.query.page  || "1");
  const limit = parseInt(req.query.limit || "50");
  const messages = await prisma.message.findMany({
    where: { channelId: parseInt(channelId) },
    include: { sender: { select: { id: true, username: true } } },
    orderBy: { createdAt: "asc" },
    skip: (page - 1) * limit,
    take: limit,
  });
  res.json(messages);
};
```

Agregar en `message.routes.js`:
```js
router.get("/channels/:channelId/messages", authMiddleware, controller.getMessages);
```

Y registrar en `app.js`:
```js
import messageRoutes from "./modules/messages/message.routes.js";
app.use("/", messageRoutes);
```

---

## Flujo de autenticación

1. Login → guarda `accessToken` y `refreshToken` en `localStorage`
2. Cada request lleva `Authorization: Bearer <accessToken>`
3. En 401 → intenta `POST /auth/refresh` automáticamente y reintenta
4. Socket.IO conecta con `{ auth: { token: accessToken } }`

## Dockerización

Para servir el frontend junto al monolito, hay dos opciones:

**Opción A — Build estático servido por Express:**
```js
// En app.js, después de las rutas de API:
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
);
```

**Opción B — Contenedor separado (recomendado para microservicios):**
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## Funcionalidades implementadas

- [x] Login y registro con JWT
- [x] Refresh automático del token en 401
- [x] Listar y crear grupos
- [x] Invitar usuarios a grupos (por email o userId)
- [x] Listar y crear canales dentro de grupos
- [x] Chat en tiempo real vía Socket.IO
- [x] Historial de mensajes desde REST al cambiar de canal
- [x] Adjuntar y previsualizar archivos/imágenes
- [x] Indicadores de estado de mensajes (✓ enviado, ✓✓ entregado, ✓✓ leído en teal)
- [x] Agrupación visual de mensajes consecutivos del mismo usuario
- [x] Indicador online/offline de conexión Socket.IO
- [x] Auto-scroll al último mensaje
