# 🚀 Guía de Deployment - Plex Random Picker

Esta guía te ayudará a publicar y compartir tu aplicación Plex Random Picker con tu familia.

## Opción 1: Servidor Local (NAS/Raspberry Pi) - ⭐ RECOMENDADO

Si tienes un servidor Plex corriendo en tu red (NAS, Raspberry Pi, etc.), es la mejor opción.

### Paso 1: Preparar el Servidor

```bash
# En tu servidor (NAS/Pi)
cd /ruta/al/plex-random-picker

# Instalar dependencias
npm run install-all

# Crear archivo .env
cp .env.example .env
# Editar .env con tu configuración Plex
nano .env
```

### Paso 2: Build de Producción

```bash
# Build del frontend
npm run build

# Verificar que se creó client/dist
ls -la client/dist/
```

### Paso 3: Iniciar en Producción

```bash
# Opción A: Ejecución simple
npm start

# Opción B: Con PM2 (recomendado para que continue corriendo)
npm install -g pm2
pm2 start npm --name "plex-picker" -- start
pm2 startup
pm2 save
```

### Paso 4: Acceder desde tu Red

En cualquier dispositivo de tu red:
```
http://[IP_DEL_SERVIDOR]:3001
```

Ejemplo: `http://192.168.1.88:3001`

### Paso 5: Acceso Remoto (Opcional)

Si quieres acceder desde fuera de tu red:

1. **Configurar port forwarding en router**:
   - Abre tu router
   - Busca "Port Forwarding"
   - Puerto externo: `8080` → Puerto interno: `3001`
   - IP destino: `192.168.1.88`

2. **Acceder remotamente**:
   ```
   http://[TU_IP_PUBLICA]:8080
   ```
   Obtén tu IP pública en: https://www.cualesmiip.com/

**⚠️ IMPORTANTE**: El token de Plex está protegido en el servidor, no se expone al cliente.

---

## Opción 2: Docker (Para Producción Avanzada)

Si prefieres usar Docker:

### Crear Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar archivos
COPY package*.json ./
COPY client/package*.json ./client/
COPY server.js .

# Instalar dependencias
RUN npm install
RUN cd client && npm install && npm run build && cd ..

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3001

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["npm", "start"]
```

### Construir y ejecutar

```bash
# Construir imagen
docker build -t plex-random-picker .

# Ejecutar contenedor
docker run -d \
  -p 3001:3001 \
  -e VITE_PLEX_URL=http://192.168.1.88:32400 \
  -e VITE_PLEX_TOKEN=tu-token-aqui \
  --name plex-picker \
  plex-random-picker
```

---

## Opción 3: Servicios en la Nube (Avanzado)

### Heroku (Deprecated - Usar alternativas)

Alternativas gratuitas:
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Fly.io**: https://fly.io

⚠️ **Nota**: Requiere que tu servidor Plex sea accesible desde internet.

---

## Mantenimiento

### Ver logs

```bash
# En desarrollo
npm run dev

# Con PM2
pm2 logs plex-picker

# Docker
docker logs plex-picker -f
```

### Actualizar aplicación

```bash
# Descargar cambios
git pull

# Instalar nuevas dependencias (si las hay)
npm install
cd client && npm install && cd ..

# Rebuild
npm run build

# Reiniciar servicio
pm2 restart plex-picker
# O
npm start
```

### Cambiar configuración Plex

```bash
# Editar .env
nano .env

# Reiniciar servidor
pm2 restart plex-picker
```

---

## Solución de Problemas

### "No puedo acceder desde otro dispositivo"

1. Verifica la IP: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
2. Asegúrate que están en la misma red
3. Revisa firewall: `sudo ufw allow 3001`
4. Prueba: `http://[IP_SERVIDOR]:3001`

### "El puerto 3001 está en uso"

```bash
# Cambiar en .env
PORT=3002

# O matar proceso que lo ocupa
lsof -ti:3001 | xargs kill -9
```

### "No conecta a Plex"

1. Verifica URL en .env: `http://192.168.1.88:32400`
2. Verifica token: Abre browser dev tools en Plex, busca en red
3. Prueba conectividad: `curl http://192.168.1.88:32400/library/sections?X-Plex-Token=TOKEN`

### "Favoritos no se guardan"

localStorage es por navegador. Cada dispositivo tiene su propio almacenamiento.
Para sincronizar entre dispositivos, necesitaría backend (futura feature).

---

## Checklist de Deployment

- [ ] `.env` creado con URL y token correcto
- [ ] `npm run build` ejecutado sin errores
- [ ] `npm start` inicia correctamente
- [ ] Puedo acceder desde `http://localhost:3001`
- [ ] Puedo acceder desde otro dispositivo en la red
- [ ] (Opcional) PM2 está configurado y autoreinicia
- [ ] (Opcional) Port forwarding configurado en router

---

## Seguridad

- ✅ Token de Plex en servidor (no expuesto)
- ✅ CORS configurado correctamente
- ✅ Variables de entorno protegidas
- ⚠️ Sin autenticación de usuarios (cualquiera con acceso a la IP puede usar)

Si quieres añadir autenticación, abre un issue.

---

## Soporte

¿Problemas con el deployment?
- Revisa los logs
- Abre un issue con los detalles
- Incluye output de: `npm run dev` o `pm2 logs plex-picker`

---

**Disfruta descubriendo contenido nuevo sin algoritmos** 🎬
