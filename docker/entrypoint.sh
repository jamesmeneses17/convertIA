#!/bin/sh
# ConvertIA :: entrypoint del servicio `app`
# Espera a que PostgreSQL acepte conexiones y arranca Next.js.
# Las migraciones NO se aplican aqui: de eso se encarga el servicio `migrate`
# (etapa `migrator` del Dockerfile), porque la imagen standalone lleva un
# node_modules podado donde el CLI de Prisma no puede ejecutarse.
set -e

echo "[ConvertIA] Arrancando contenedor..."

if [ -z "$DATABASE_URL" ]; then
  echo "[ConvertIA] AVISO: DATABASE_URL no definida."
  echo "[ConvertIA] La app arranca en modo solo-prompt (sin Banco de Proyectos)."
  exec "$@"
fi

# --- Espera activa a la base de datos (maximo ~60 s) ---
echo "[ConvertIA] Esperando a PostgreSQL..."
attempt=0
until node -e "
const url = new URL(process.env.DATABASE_URL);
require('net')
  .connect({ host: url.hostname, port: url.port || 5432 })
  .on('connect', function () { this.end(); process.exit(0); })
  .on('error', () => process.exit(1));
" >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "[ConvertIA] AVISO: PostgreSQL no respondio tras 60 s. Arranco igualmente;"
    echo "[ConvertIA] el compilador de prompts funciona, el Banco de Proyectos no."
    break
  fi
  sleep 2
done

if [ "$attempt" -lt 30 ]; then
  echo "[ConvertIA] PostgreSQL responde."
fi

echo "[ConvertIA] Listo. Sirviendo en el puerto ${PORT:-3000}"
exec "$@"
