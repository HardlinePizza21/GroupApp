# GroupApp

Sistema distribuido de mensajeria grupal con arquitectura de microservicios.

## Arquitectura actual del repositorio

Servicios incluidos:

- `auth` - registro/login/refresh de tokens JWT.
- `groups` - grupos, miembros, invitaciones y canales.
- `messages-service` - historial y envio de mensajes (texto + adjuntos).
- `notifications` - notificaciones realtime con Socket.IO.
- `Frontend` - cliente web React + Vite.

Infraestructura local:

- RabbitMQ para eventos entre servicios.
- PostgreSQL por dominio:
  - `auth-db`
  - `groups-db`
  - `messages-db`

## Arranque local con Docker Compose

Desde la raiz:

```bash
docker compose up --build
```

Para detener:

```bash
docker compose down
```

## Puertos locales

- Frontend (Vite): `http://localhost:5173`
- Auth Service: `http://localhost:3001`
- Groups Service: `http://localhost:3002`
- Notifications Service: `http://localhost:3003`
- Messages Service: `http://localhost:3004`
- RabbitMQ UI: `http://localhost:15672` (guest/guest)

Bases de datos:

- auth-db: `localhost:5432`
- groups-db: `localhost:5433`
- messages-db: `localhost:5434`

## Variables de entorno

En `docker-compose.yml` ya se inyectan variables para desarrollo.

Variables clave por servicio:

- Auth: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `RABBITMQ_URL`
- Groups: `DATABASE_URL`, `JWT_SECRET`, `RABBITMQ_URL`
- Messages: `DATABASE_URL`, `JWT_SECRET`, `RABBITMQ_URL`, credenciales AWS S3
- Notifications: `JWT_SECRET`, `RABBITMQ_URL`
- Frontend: `VITE_API_URL`

## Endpoints principales

### Auth (`/auth`)

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`

### Groups

- `GET /groups/my`
- `POST /groups`
- `PUT /groups/:id`
- `POST /groups/:id/invite`
- `GET /groups/:groupId/channels`
- `POST /groups/:groupId/channels`

### Messages

- `GET /messages/:messageId`
- `GET /channels/:channelId/messages`
- `POST /channels/:channelId/messages` (`multipart/form-data`)

### Notifications

- `GET /health`
- Socket.IO autenticado por JWT en handshake

## Flujo de mensajeria (resumen)

1. Frontend envia mensaje a `messages-service`.
2. `messages-service` persiste en DB y publica evento `message.sent` en RabbitMQ.
3. `notifications-service` consume evento y emite `receive_message` por Socket.IO a la sala del canal.
4. Frontend actualiza vista y/o consulta detalle por REST.

## Frontend

La documentacion del cliente esta en:

- `Frontend/README.md` (guia principal del frontend)
- `Frontend/FRONTEND_README.md` (version extendida)

## Despliegue objetivo (AWS)

Estrategia del proyecto:

- 1 instancia EC2 por microservicio (`auth`, `groups`, `messages`, `notifications`)
- Frontend estatico en S3
- RabbitMQ y bases de datos como servicios compartidos de infraestructura

## Estado de pruebas

Actualmente no hay suite automatizada integral en el repo.  
La validacion principal del flujo se realiza de forma funcional/integracion manual entre frontend, APIs, RabbitMQ y Socket.IO.

## Problemas frecuentes

- Si un contenedor falla por dependencias, reconstruir:
  - `docker compose down`
  - `docker compose up --build`
- Verificar que RabbitMQ este arriba antes de `messages-service` y `notifications-service`.
- Si usas adjuntos, configurar correctamente credenciales/bucket de AWS S3 para `messages-service`.
