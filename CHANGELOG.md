# Changelog - Plex Random Picker

## [v1.1.0] - 2025-11-11

### 🔧 Cambios Importantes

#### Backend (server.js)
- ✅ **Arreglo Critical**: Corregido `machineIdentifier undefined` en URLs de Plex
  - Ahora obtiene el identifier del servidor Plex al iniciar
  - Se cachea para evitar llamadas repetidas
- ✅ **Nuevo**: Soporte para variables de entorno (.env)
  - `VITE_PLEX_URL` - URL del servidor Plex
  - `VITE_PLEX_TOKEN` - Token de autenticación
  - `PORT` - Puerto del servidor (default: 3001)
- ✅ **Nuevo**: Instalación de `dotenv` para gestionar configuración
- ✅ **Nuevo**: Endpoint `/api/config` para obtener configuración del servidor
- ✅ **Optimización**: Corregido parámetro de contenedor en requests a Plex
  - Cambiado de `X-Plex-Container-Size={totalSize}` a `500` (más eficiente)

#### Frontend (client/src/App.jsx)
- ✅ **Nuevo**: Ordenamiento alfabético en vista "Ver Todo"
  - Implementado con `localeCompare()` para soporte multiidioma
  - Se ordena por `es` (español) para caracteres especiales
  - Afecta a la vista `/api/library/:key/all`

#### Archivos de Configuración
- ✅ **Nuevo**: `.env.example` - Plantilla de configuración
- ✅ **Nuevo**: `.env` - Archivo de configuración local (gitignored)
- ✅ **Nuevo**: `.gitignore` - Configuración segura de git
- ✅ **Nuevo**: `DEPLOYMENT.md` - Guía completa de deployment
- ✅ **Actualizado**: `README.md` - Documentación mejorada

### 📋 Resumen de Características

#### Funcionalidades Core
1. **🎯 Picker Inteligente**
   - Selecciona películas aleatorias con filtros
   - Filtros: Género, Año (min/max), Rating IMDB, Solo no vistas
   - Resultado: 8 películas o 1 (Ruleta Total)

2. **📚 Catálogo Completo**
   - Visualiza todas las películas de la biblioteca
   - Ordenadas alfabéticamente
   - Modal con información detallada
   - Links a IMDb

3. **⭐ Favoritos**
   - Guardados en localStorage
   - Sincronización entre pestañas
   - Acceso rápido desde cualquier dispositivo

4. **📜 Historial**
   - Últimas 50 películas abiertas
   - Acceso desde "Ver de nuevo"
   - Persistente en navegador

#### Interfaz
- Responsive (móvil, tablet, desktop)
- Modo oscuro por defecto
- Gradientes y animaciones suaves
- Fondos rotativos icónicos
- Carga lazy de imágenes

### 🔐 Seguridad

- Token de Plex guardado en servidor (no expuesto al cliente)
- Variables de entorno protegidas con `.env` + `.gitignore`
- CORS configurado correctamente
- Sin autenticación de usuarios (acceso local/red privada)

### 📊 Estructura Técnica

**Backend**:
- Express.js
- Integración XML/Plex
- Proxy y conversión a JSON
- Filtrado y randomización

**Frontend**:
- React 18 + Hooks
- Vite (dev server + bundler)
- CSS3 moderno (variables)
- localStorage para persistencia

### 📦 Dependencias Nuevas

```
dotenv: ^17.2.3
```

### 🚀 Deployment

- ✅ Ready para producción local (NAS/Raspberry Pi)
- ✅ Instrucciones Docker incluidas
- ✅ PM2 para auto-reinicio
- ✅ Port forwarding documentado

### 📝 Documentación

- README.md - Guía de usuario
- DEPLOYMENT.md - Guía de instalación y deployment
- CHANGELOG.md - Este archivo

### 🔍 Verificación

```bash
# Todos los endpoints funcionan:
✅ GET /api/libraries - Retorna 3 librerías
✅ GET /api/library/:key/all - Retorna 1666 películas ordenadas
✅ GET /api/library/:key/genres - Retorna géneros disponibles
✅ POST /api/random - Retorna películas aleatorias con filtros
✅ GET /api/config - Retorna configuración del servidor
```

### 🎯 Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Sincronización de favoritos en la nube
- [ ] PWA (instalar como app)
- [ ] Buscar por nombre
- [ ] Estadísticas de visualización
- [ ] Filtros adicionales (director, actor)
- [ ] Integración con Trakt

---

**Estado**: ✅ Ready para usar con familia
**Última actualización**: 2025-11-11
