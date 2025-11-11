# 🎲 Plex Random Picker

Una aplicación web moderna para seleccionar películas y contenido de Plex de forma completamente aleatoria. **¡Rompe el algoritmo y descubre contenido nuevo!**

## ✨ Características

- **🎯 Picker Inteligente**: Selecciona películas aleatorias con filtros (género, año, rating)
- **🎲 Ruleta Total**: Una película completamente al azar
- **📚 Catálogo Completo**: Explora todo tu contenido ordenado alfabéticamente
- **⭐ Favoritos**: Guarda tus películas favoritas localmente
- **📜 Historial**: Mantén un registro de las películas que has abierto (últimas 50)
- **📱 Responsive**: Funciona perfectamente en móvil, tablet y desktop
- **🌙 Modo Oscuro**: Interfaz elegante y cómoda para la vista
- **👥 Multi-usuario**: Comparte la URL con tu familia

## 🚀 Requisitos

- **Node.js 16+** (con npm)
- **Servidor Plex** accesible en tu red local
- **Token de autenticación de Plex**

## 📦 Instalación Rápida

```bash
cd plex-random-picker

# Instalar todas las dependencias
npm run install-all

# Crear archivo .env
cp .env.example .env
# Edita .env con tu URL y token de Plex

# Iniciar en desarrollo
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3001

## Instalación Paso a Paso

### 1. Instalar dependencias del backend

```bash
npm install
```

### 2. Configurar Vite para el cliente

Necesitas crear estos archivos en `/client/`:

**vite.config.js**:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

**index.html**:
```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Plex Random Picker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 3. Archivos React necesarios

En `/client/src/`:

- `main.jsx` - Entry point
- `App.jsx` - Componente principal
- `App.css` - Estilos

Te voy a mostrar el contenido básico de cada uno...

## Configuración

Edita `server.js` si necesitas cambiar:

```js
const PLEX_URL = 'http://192.168.1.88:32400';  // Tu servidor Plex
const PLEX_TOKEN = 'o-CQNS6jTNt-3uihuSey';     // Tu token
```

## Uso

1. Inicia el servidor:
```bash
npm start
```

2. Abre http://localhost:3000 en tu navegador

3. Selecciona:
   - Tipo de contenido (Películas/Series/Documentales)
   - Género (opcional)
   - Año (opcional)
   - Rating mínimo (opcional)

4. Click en "🎲 SORPRÉNDEME" o "🎰 RULETA TOTAL"

5. Elige una de las 3-5 opciones o regenera

## API Endpoints

- `GET /api/libraries` - Lista de bibliotecas Plex
- `GET /api/library/:key/all` - Todo el contenido de una biblioteca
- `GET /api/library/:key/genres` - Géneros disponibles
- `POST /api/random` - Obtener contenido aleatorio con filtros

## Estructura del Proyecto

```
plex-random-picker/
├── server.js           # Servidor Express + proxy Plex
├── package.json        # Dependencias backend
├── client/
│   ├── src/
│   │   ├── main.jsx    # Entry point React
│   │   ├── App.jsx     # Componente principal
│   │   └── App.css     # Estilos
│   ├── index.html
│   ├── vite.config.js
│   └── package.json    # Dependencias frontend
└── README.md
```

## Deployment en tu servidor Plex

Para correr en producción en tu servidor (192.168.1.88):

```bash
# Build del cliente
cd client && npm run build && cd ..

# Iniciar servidor (sirve el build estático)
npm start
```

Accede desde cualquier dispositivo en tu red: `http://192.168.1.88:3000`

## Troubleshooting

**Error de CORS**: El servidor proxy ya maneja esto automáticamente

**No se conecta a Plex**: Verifica que el token y URL sean correctos

**Puerto en uso**: Cambia `PORT` en server.js

## Roadmap

- [ ] PWA para instalar en móvil
- [ ] Dark mode
- [ ] Más filtros (director, actor)
- [ ] Integración con watchlists de Plex
- [ ] Estadísticas de uso

## License

MIT
