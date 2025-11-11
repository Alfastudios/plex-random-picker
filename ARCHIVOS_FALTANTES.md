# Archivos Faltantes para Completar el Proyecto

He creado la estructura base del proyecto. Estos son los archivos que faltan y su contenido:

## Estado Actual

✅ **Ya creados:**
- `/package.json` - Configuración backend
- `/server.js` - Servidor Express + API Plex
- `/README.md` - Documentación
- `/client/package.json` - Configuración frontend
- `/client/vite.config.js` - Configuración Vite

❌ **Faltantes (crear manualmente):**

---

## 1. `/client/index.html`

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Plex Random Picker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## 2. `/client/src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

---

## 3. `/client/src/App.jsx`

Este es el archivo más grande. Contiene toda la lógica:

```jsx
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [libraries, setLibraries] = useState([])
  const [selectedLibrary, setSelectedLibrary] = useState(null)
  const [genres, setGenres] = useState([])
  const [filters, setFilters] = useState({
    genre: 'all',
    minYear: '',
    maxYear: '',
    minRating: '',
    excludeWatched: false
  })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [history, setHistory] = useState([])
  const [view, setView] = useState('picker') // picker, favorites, history

  // Load favorites and history from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('plexFavorites')
    const savedHistory = localStorage.getItem('plexHistory')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
    if (savedHistory) setHistory(JSON.parse(savedHistory))
  }, [])

  // Load libraries on mount
  useEffect(() => {
    fetch('/api/libraries')
      .then(res => res.json())
      .then(data => setLibraries(data))
      .catch(err => console.error('Error loading libraries:', err))
  }, [])

  // Load genres when library changes
  useEffect(() => {
    if (selectedLibrary) {
      fetch(`/api/library/${selectedLibrary.key}/genres`)
        .then(res => res.json())
        .then(data => setGenres(data))
        .catch(err => console.error('Error loading genres:', err))
    }
  }, [selectedLibrary])

  const fetchRandom = async (count = 5) => {
    if (!selectedLibrary) return

    setLoading(true)
    try {
      const response = await fetch('/api/random', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libraryKey: selectedLibrary.key,
          filters: filters.genre === 'all' ? {} : filters,
          count
        })
      })
      const data = await response.json()
      setResults(data.items || [])
    } catch (err) {
      console.error('Error fetching random:', err)
    }
    setLoading(false)
  }

  const addToFavorites = (item) => {
    const newFavorites = [...favorites, item]
    setFavorites(newFavorites)
    localStorage.setItem('plexFavorites', JSON.stringify(newFavorites))
  }

  const removeFromFavorites = (item) => {
    const newFavorites = favorites.filter(f => f.ratingKey !== item.ratingKey)
    setFavorites(newFavorites)
    localStorage.setItem('plexFavorites', JSON.stringify(newFavorites))
  }

  const addToHistory = (item) => {
    const newHistory = [item, ...history.slice(0, 49)] // Keep last 50
    setHistory(newHistory)
    localStorage.setItem('plexHistory', JSON.stringify(newHistory))
  }

  const openInPlex = (item) => {
    addToHistory(item)
    window.open(item.plexUrl, '_blank')
  }

  return (
    <div className="app">
      <header>
        <h1>🎲 Plex Random Picker</h1>
        <p>Rompe el algoritmo - Elige contenido aleatorio</p>
      </header>

      <nav className="tabs">
        <button
          className={view === 'picker' ? 'active' : ''}
          onClick={() => setView('picker')}
        >
          🎯 Picker
        </button>
        <button
          className={view === 'favorites' ? 'active' : ''}
          onClick={() => setView('favorites')}
        >
          ⭐ Favoritos ({favorites.length})
        </button>
        <button
          className={view === 'history' ? 'active' : ''}
          onClick={() => setView('history')}
        >
          📜 Historial ({history.length})
        </button>
      </nav>

      {view === 'picker' && (
        <>
          <div className="filters">
            <div className="filter-group">
              <label>Biblioteca:</label>
              <select
                value={selectedLibrary?.key || ''}
                onChange={(e) => {
                  const lib = libraries.find(l => l.key === e.target.value)
                  setSelectedLibrary(lib)
                  setResults([])
                }}
              >
                <option value="">Selecciona...</option>
                {libraries.map(lib => (
                  <option key={lib.key} value={lib.key}>{lib.title}</option>
                ))}
              </select>
            </div>

            {selectedLibrary && (
              <>
                <div className="filter-group">
                  <label>Género:</label>
                  <select
                    value={filters.genre}
                    onChange={(e) => setFilters({...filters, genre: e.target.value})}
                  >
                    <option value="all">Todos</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Año (min-max):</label>
                  <input
                    type="number"
                    placeholder="1980"
                    value={filters.minYear}
                    onChange={(e) => setFilters({...filters, minYear: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="2024"
                    value={filters.maxYear}
                    onChange={(e) => setFilters({...filters, maxYear: e.target.value})}
                  />
                </div>

                <div className="filter-group">
                  <label>Rating mínimo (IMDB):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="7.0"
                    value={filters.minRating}
                    onChange={(e) => setFilters({...filters, minRating: e.target.value})}
                  />
                </div>

                <div className="filter-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={filters.excludeWatched}
                      onChange={(e) => setFilters({...filters, excludeWatched: e.target.checked})}
                    />
                    Solo no vistas
                  </label>
                </div>
              </>
            )}
          </div>

          {selectedLibrary && (
            <div className="actions">
              <button
                className="btn-primary"
                onClick={() => fetchRandom(5)}
                disabled={loading}
              >
                🎲 SORPRÉNDEME
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setFilters({ genre: 'all', minYear: '', maxYear: '', minRating: '', excludeWatched: false })
                  fetchRandom(1)
                }}
                disabled={loading}
              >
                🎰 RULETA TOTAL
              </button>
            </div>
          )}

          {loading && <div className="loading">Cargando...</div>}

          <div className="results">
            {results.map(item => (
              <div key={item.ratingKey} className="card">
                {item.thumb && <img src={item.thumb} alt={item.title} />}
                <div className="card-content">
                  <h3>{item.title}</h3>
                  <p className="year">{item.year}</p>
                  {item.rating > 0 && <p className="rating">⭐ {item.rating.toFixed(1)}</p>}
                  {item.genres.length > 0 && (
                    <p className="genres">{item.genres.join(', ')}</p>
                  )}
                  <p className="summary">{item.summary}</p>
                  <div className="card-actions">
                    <button onClick={() => openInPlex(item)}>▶️ Abrir en Plex</button>
                    <button onClick={() => addToFavorites(item)}>⭐ Favorito</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'favorites' && (
        <div className="results">
          {favorites.map(item => (
            <div key={item.ratingKey} className="card">
              {item.thumb && <img src={item.thumb} alt={item.title} />}
              <div className="card-content">
                <h3>{item.title}</h3>
                <p className="year">{item.year}</p>
                <div className="card-actions">
                  <button onClick={() => openInPlex(item)}>▶️ Abrir en Plex</button>
                  <button onClick={() => removeFromFavorites(item)}>🗑️ Quitar</button>
                </div>
              </div>
            </div>
          ))}
          {favorites.length === 0 && <p>No tienes favoritos aún</p>}
        </div>
      )}

      {view === 'history' && (
        <div className="results">
          {history.map((item, index) => (
            <div key={`${item.ratingKey}-${index}`} className="card">
              {item.thumb && <img src={item.thumb} alt={item.title} />}
              <div className="card-content">
                <h3>{item.title}</h3>
                <p className="year">{item.year}</p>
                <div className="card-actions">
                  <button onClick={() => openInPlex(item)}>▶️ Ver de nuevo</button>
                </div>
              </div>
            </div>
          ))}
          {history.length === 0 && <p>No has visto nada aún</p>}
        </div>
      )}
    </div>
  )
}

export default App
```

---

## 4. `/client/src/App.css`

```css
:root {
  --bg: #0f0f0f;
  --card-bg: #1a1a1a;
  --accent: #e5a00d;
  --text: #ffffff;
  --text-dim: #999;
  --border: #333;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

.app {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #cc7722 0%, #e5a00d 100%);
  border-radius: 12px;
}

header h1 {
  font-size: 3rem;
  margin-bottom: 10px;
}

header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: center;
}

.tabs button {
  padding: 12px 24px;
  background: var(--card-bg);
  color: var(--text);
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.tabs button.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  background: var(--card-bg);
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 0.9rem;
  color: var(--text-dim);
}

.filter-group input,
.filter-group select {
  padding: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 1rem;
}

.actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 40px;
}

.btn-primary,
.btn-secondary {
  padding: 16px 40px;
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary {
  background: var(--accent);
  color: var(--bg);
}

.btn-secondary {
  background: #cc7722;
  color: var(--text);
}

.btn-primary:hover,
.btn-secondary:hover {
  transform: scale(1.05);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  font-size: 1.5rem;
  padding: 40px;
}

.results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.card {
  background: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s;
}

.card:hover {
  transform: translateY(-5px);
}

.card img {
  width: 100%;
  height: 450px;
  object-fit: cover;
}

.card-content {
  padding: 20px;
}

.card-content h3 {
  font-size: 1.3rem;
  margin-bottom: 10px;
}

.year {
  color: var(--text-dim);
  font-size: 0.9rem;
}

.rating {
  color: var(--accent);
  margin: 5px 0;
}

.genres {
  color: var(--text-dim);
  font-size: 0.85rem;
  margin: 10px 0;
}

.summary {
  font-size: 0.9rem;
  color: var(--text-dim);
  margin: 15px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.card-actions button {
  flex: 1;
  padding: 10px;
  background: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: opacity 0.2s;
}

.card-actions button:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  header h1 {
    font-size: 2rem;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .actions {
    flex-direction: column;
  }

  .results {
    grid-template-columns: 1fr;
  }
}
```

---

## Instalación Final

Una vez que hayas creado estos archivos:

```bash
cd ~/plex-random-picker

# 1. Instalar dependencias del backend
npm install

# 2. Instalar dependencias del frontend
cd client && npm install && cd ..

# 3. Iniciar en desarrollo
npm run dev
```

La app estará en: **http://localhost:5173**
El servidor API en: **http://localhost:3000**

---

## Para Producción (en tu servidor Plex)

```bash
# Build del frontend
cd client && npm run build && cd ..

# Iniciar solo el backend (servirá el build)
npm start
```

Accede desde: **http://192.168.1.88:3000**

---

## Próximos Pasos

1. Crea los 4 archivos faltantes copiando el contenido de arriba
2. Ejecuta `npm install` en ambos directorios
3. Ejecuta `npm run dev` para probar
4. Ajusta colores/estilos en `App.css` si quieres
5. Cuando funcione, haz el build y súbelo a tu servidor Plex

¡Listo! Tendrás tu Plex Random Picker funcionando.
