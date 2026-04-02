# GroupsApp — Frontend

React + Vite · Dark terminal theme · Socket.IO · JWT auth

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + Vite 5 |
| Routing | React Router v6 |
| HTTP | Axios (con interceptor de refresh automático) |
| Tiempo real | Socket.IO Client v4 |
| Estilos | CSS custom properties (sin librerías externas) |
| Fuentes | Syne · JetBrains Mono · DM Sans (Google Fonts) |

---

## Estructura

```
src/
├── api/
│   └── client.js          # Axios + todos los endpoints REST
├── context/
│   └── AuthContext.jsx    # Login / register / logout + localStorage
├── hooks/
│   └── useSocket.js       # Conexión Socket.IO, join_channel, send_message
├── pages/
│   ├── AuthPage.jsx/css   # Login + registro con toggle animado
│   └── ChatPage.jsx/css   # Orquestador principal (grupos, canales, mensajes)
└── components/
    ├── GroupsSidebar      # Rail izquierdo de grupos (icon-only)
    ├── ChannelsSidebar    # Panel de canales del grupo activo
    ├── ChatWindow         # Lista de mensajes + header
    ├── MessageBubble      # Burbuja con chulitos ✓ ✓✓ ✓✓(teal)
    ├── MessageInput       # Textarea + adjuntar archivo + botón enviar
    └── modals/
        ├── CreateGroupModal
        ├── CreateChannelModal
        └── InviteModal
```

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env
# Editar VITE_API_URL si el backend no corre en localhost:3000

# 3. Correr en desarrollo
npm run dev

# 4. Build para producción
npm run build
```

La app queda en `http://localhost:5173`.  
El `vite.config.js` ya tiene proxy configurado para no tener CORS en desarrollo.

---

## Variables de entorno

```env
VITE_API_URL=http://localhost:3000
# En producción: VITE_API_URL=https://tu-ec2.amazonaws.com
```

Para producción con Docker, esta variable se puede inyectar en build time:
```dockerfile
ARG VITE_API_URL
RUN VITE_API_URL=$VITE_API_URL npm run build
```

---

## Dockerfile sugerido

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL=http://localhost:3000
RUN VITE_API_URL=$VITE_API_URL npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

`nginx.conf`:
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## ⚠️ Endpoints que el backend NECESITA agregar

El frontend asume que estos dos endpoints existen. Sin ellos, las listas de grupos y el historial de mensajes no cargan (el app falla silenciosamente, no rompe).

### 1. `GET /groups/my` — grupos del usuario autenticado

Retorna los grupos donde el usuario es miembro.

```js
// group.routes.js
router.get("/my", authMiddleware, controller.getMyGroups);
```

```js
// group.controller.js
export const getMyGroups = async (req, res) => {
  const groups = await prisma.groupMember.findMany({
    where: { userId: req.user.userId },
    include: {
      group: true,
    },
  });

  const result = groups.map(({ group, role }) => ({ ...group, role }));
  res.json(result);
};
```

---

### 2. `GET /channels/:channelId/messages` — historial de mensajes

Con paginación básica. Los mensajes en tiempo real llegan por Socket.IO, pero el historial previo viene de este endpoint.

```js
// message.routes.js
router.get(
  "/channels/:channelId/messages",
  authMiddleware,
  controller.getMessages
);
```

```js
// message.controller.js
export const getMessages = async (req, res) => {
  const { channelId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const messages = await prisma.message.findMany({
    where: { channelId: parseInt(channelId) },
    include: {
      sender: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: "asc" },
    skip,
    take: parseInt(limit),
  });

  res.json(messages);
};
```

---

## Funcionalidades implementadas

| Feature | Estado |
|---------|--------|
| Login / Registro con JWT | ✅ |
| Refresh token automático | ✅ |
| Crear grupos | ✅ |
| Listar mis grupos | ✅ (requiere endpoint #1) |
| Crear canales `#nombre` | ✅ |
| Listar canales de un grupo | ✅ |
| Invitar miembros (por email o userId) | ✅ |
| Chat en tiempo real (Socket.IO) | ✅ |
| Historial de mensajes | ✅ (requiere endpoint #2) |
| Subida de archivos / imágenes | ✅ |
| Preview de imágenes antes de enviar | ✅ |
| Visualización de imágenes en chat | ✅ |
| Descarga de archivos adjuntos | ✅ |
| Estado de mensajes ✓ ✓✓ ✓✓🟢 | ✅ |
| Auto-scroll al último mensaje | ✅ |
| Mensajes agrupados por emisor | ✅ |
| Indicador online/offline (socket) | ✅ |
| Cerrar sesión | ✅ |
| Rutas protegidas (ProtectedRoute) | ✅ |

---

## ST0263 / SI3007 — Sistemas Distribuidos 2026-1
