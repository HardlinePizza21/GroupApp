# GroupApp — desarrollo local con Docker

## Arranque rápido

Desde la raíz del repositorio **no hace falta crear `Backend/.env`**: Compose usa `Backend/.env.example`. Un solo comando:

```bash
make up
```

Sin `make` (PowerShell en Windows):

```bash
docker compose up --build
```

- API: http://localhost:3000  
- Frontend (Vite): http://localhost:5173  
- Postgres: `localhost:5432` (usuario/contraseña/db: `groupapp` / `groupapp` / `groupapp`)

Para detener: `make down` o `docker compose down`.

## Variables propias

Si quieres secretos locales sin tocar el ejemplo versionado:

```bash
cp Backend/.env.example Backend/.env
```

En `docker-compose.yml`, cambia la línea `env_file` del servicio `backend` para usar `./Backend/.env`.

## Subida de archivos (S3)

La API usa AWS S3 para ficheros. En local hace falta un bucket real y credenciales AWS en el entorno (o desactivar esa ruta en desarrollo). Los valores de `AWS_BUCKET_NAME` en `.env.example` son placeholders.

## Problemas frecuentes

- **`Cannot find module 'dotenv'`**  
  El volumen `./Backend:/app` sustituye el código de la imagen; las dependencias se instalan dentro del contenedor (`backend_node_modules` + `npm ci`). Si algo quedó en mal estado:  
  `make clean && make up`

- **`docker-compose-dev.yml: no such file`**  
  En este proyecto el archivo se llama **`docker-compose.yml`**:  
  `docker compose -f docker-compose.yml up --build`

- **Flag mal escrita**  
  Es `--build` (sin llave `}` al final).
