import { useState, useEffect, useContext } from 'react'
import { AuthContext } from './AuthContext'
import { AuthScreen } from './AuthScreen'
import { ContentTypeSelector } from './ContentTypeSelector'
import { RouletteSpinner } from './RouletteSpinner'
import './App.css'

// Array de imágenes de cine icónicas
const CINEMA_BACKGROUNDS = [
  'https://i0.wp.com/culturacolectiva.com/wp-content/uploads/images/7OJZTKOC4JEJ3EDMVE75IBGR6Q.jpg', // Blade Runner
  'https://i0.wp.com/culturacolectiva.com/wp-content/uploads/images/KPVVFPUAM5EG7HSW552DTSVGAY.jpg', // The Dark Knight
  'https://i0.wp.com/culturacolectiva.com/wp-content/uploads/images/U7ZOES3GXVAWBMUNSTMJUKBRYY.jpg', // A Clockwork Orange
  'https://i0.wp.com/culturacolectiva.com/wp-content/uploads/images/JNHCDV6S75H5VIQ33NYVEWCE6E.jpg', // Kill Bill
  'https://i0.wp.com/culturacolectiva.com/wp-content/uploads/images/65HGRFWE3JA2TIU24XZ3O7UPGM.jpg', // Star Wars V
  'https://i0.wp.com/culturacolectiva.com/wp-content/uploads/images/A6YQEPB3EFAB5MRDCNV7UGB54E.jpg', // Moulin Rouge
  'https://i0.wp.com/culturacolectiva.com/wp-content/uploads/images/IJ6XKYOFFJEHNAFUSRP3WZFR3A.jpg', // The Shawshank Redemption
  'https://i0.wp.com/culturacolectiva.com/wp-content/uploads/images/CIPIWFRZRVDAFCDOKNA6Z6CDBA.jpg'  // Stand By Me
]

function App() {
  const { user, token, logout, isAuthenticated, loading: authLoading } = useContext(AuthContext)

  // Si no está autenticado, mostrar pantalla de login
  if (!isAuthenticated && !authLoading) {
    return <AuthScreen />
  }

  // Mientras carga la autenticación
  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0e1a' }}>
        <div style={{ color: '#fff', textAlign: 'center' }}>
          <h2>Cargando...</h2>
        </div>
      </div>
    )
  }

  const [contentType, setContentType] = useState(null) // null = selector, 'all' = todo, 'movie' = películas, 'show' = series, 'documentary' = documentales
  const [showTypeSelector, setShowTypeSelector] = useState(!localStorage.getItem('selectedContentType'))

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
  const [isRouletteSpinning, setIsRouletteSpinning] = useState(false)
  const [rouletteMovies, setRouletteMovies] = useState([])
  const [favorites, setFavorites] = useState([])
  const [history, setHistory] = useState([])
  const [watched, setWatched] = useState([])
  const [view, setView] = useState('picker')
  const [allItems, setAllItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  // Cargar tipo de contenido guardado
  useEffect(() => {
    const savedType = localStorage.getItem('selectedContentType')
    if (savedType) {
      setContentType(savedType)
      setShowTypeSelector(false)
    }
  }, [])

  // Cambiar imagen de fondo cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % CINEMA_BACKGROUNDS.length)
    }, 10000) // Cambia cada 10 segundos

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const savedFavorites = localStorage.getItem('plexFavorites')
    const savedHistory = localStorage.getItem('plexHistory')
    const savedWatched = localStorage.getItem('plexWatched')
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites))
    if (savedHistory) setHistory(JSON.parse(savedHistory))
    if (savedWatched) setWatched(JSON.parse(savedWatched))
  }, [])

  useEffect(() => {
    fetch('/api/libraries')
      .then(res => res.json())
      .then(data => setLibraries(data))
      .catch(err => console.error('Error loading libraries:', err))
  }, [])

  useEffect(() => {
    if (selectedLibrary) {
      fetch(`/api/library/${selectedLibrary.key}/genres`)
        .then(res => res.json())
        .then(data => setGenres(data))
        .catch(err => console.error('Error loading genres:', err))
    }
  }, [selectedLibrary])

  const fetchRandom = async (count = 8) => {
    if (!selectedLibrary) return
    setLoading(true)
    try {
      const response = await fetch('/api/random', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libraryKey: selectedLibrary.key,
          filters: {
            ...filters,
            genre: filters.genre === 'all' ? undefined : filters.genre
          },
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

  const fetchAllItems = async () => {
    // Si no hay biblioteca seleccionada, seleccionar la primera automáticamente
    let libraryToUse = selectedLibrary
    if (!libraryToUse && libraries.length > 0) {
      libraryToUse = libraries[0]
      setSelectedLibrary(libraryToUse)
    }

    if (!libraryToUse) {
      console.log('No library selected')
      return
    }

    console.log('Fetching all items from library:', libraryToUse.title)
    setLoading(true)
    setAllItems([]) // Limpiar items anteriores
    setView('all')

    try {
      const response = await fetch(`/api/library/${libraryToUse.key}/all`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Fetched items:', data.length, 'items')
      console.log('First item:', data[0])
      // Ordenar alfabéticamente por título
      const sortedData = data.sort((a, b) => a.title.localeCompare(b.title, 'es'))
      setAllItems(sortedData)
    } catch (err) {
      console.error('Error fetching all items:', err)
      setAllItems([])
    } finally {
      setLoading(false)
    }
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
    const newHistory = [item, ...history.slice(0, 49)]
    setHistory(newHistory)
    localStorage.setItem('plexHistory', JSON.stringify(newHistory))
  }

  const openInPlex = (item) => {
    addToHistory(item)
    window.open(item.plexUrl, '_blank')
  }

  const toggleWatched = (item) => {
    const isWatched = watched.includes(item.ratingKey)
    let newWatched
    if (isWatched) {
      newWatched = watched.filter(key => key !== item.ratingKey)
    } else {
      newWatched = [...watched, item.ratingKey]
    }
    setWatched(newWatched)
    localStorage.setItem('plexWatched', JSON.stringify(newWatched))
  }

  const isItemWatched = (item) => {
    // Solo usa el array "watched" que TÚ controlas manualmente
    // Ignora viewCount de Plex para que puedas desmarcar cualquier película
    return watched.includes(item.ratingKey)
  }

  const isFavorite = (item) => {
    return favorites.some(f => f.ratingKey === item.ratingKey)
  }

  const handleSelectContentType = (type) => {
    setContentType(type)
    setShowTypeSelector(false)
    localStorage.setItem('selectedContentType', type)
  }

  const handleChangeContentType = () => {
    setShowTypeSelector(true)
  }

  const startRoulette = async () => {
    // Obtener muchas películas para simular la ruleta
    setIsRouletteSpinning(true)
    try {
      const response = await fetch('/api/random', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          libraryKey: selectedLibrary.key,
          filters: {
            genre: undefined,
            minYear: '',
            maxYear: '',
            minRating: '',
            excludeWatched: false
          },
          count: 20 // Obtener 20 para la simulación
        })
      })
      const data = await response.json()
      setRouletteMovies(data.items || [])
      // Mantener spinning false aquí, el componente RouletteSpinner lo hará true automáticamente
    } catch (err) {
      console.error('Error fetching roulette movies:', err)
      setIsRouletteSpinning(false)
    }
  }

  const handleRouletteComplete = (movie) => {
    // Cuando termina la ruleta
    setIsRouletteSpinning(false)
    // Aquí puedes hacer lo que quieras con la película ganadora
    addToHistory(movie)
    // Abrir el modal con la película ganadora
    setSelectedItem(movie)
    // Reset roulette state after a delay to allow viewing the result
    setTimeout(() => {
      setRouletteMovies([])
    }, 3000)
  }

  // Mostrar selector de tipo de contenido si no hay tipo seleccionado
  if (showTypeSelector) {
    return <ContentTypeSelector onSelect={handleSelectContentType} selectedType={contentType} />
  }

  return (
    <div className="app">
      <header style={{
        backgroundImage: `linear-gradient(135deg, rgba(14, 9, 24, 0.65) 0%, rgba(14, 9, 24, 0.75) 100%), url('${CINEMA_BACKGROUNDS[currentBgIndex]}')`
      }}>
        <div className="header-content">
          <div>
            <h1>🎲 Plex Random Picker</h1>
            <p>Rompe el algoritmo - Elige contenido aleatorio</p>
          </div>
          <div className="user-menu">
            <span className="user-name">{user?.displayName}</span>
            <button className="change-type-btn" onClick={handleChangeContentType} title="Cambiar tipo de contenido">
              {contentType === 'movie' && '🎥'}
              {contentType === 'show' && '📺'}
              {contentType === 'documentary' && '📚'}
              {contentType === 'all' && '🎬'}
            </button>
            <button className="logout-btn" onClick={logout}>Salir</button>
          </div>
        </div>
      </header>

      <nav className="tabs">
        <button className={view === 'picker' ? 'active' : ''} onClick={() => setView('picker')}>
          🎯 Picker
        </button>
        <button className={view === 'all' ? 'active' : ''} onClick={() => fetchAllItems()}>
          📚 Ver Todo
        </button>
        <button className={view === 'favorites' ? 'active' : ''} onClick={() => setView('favorites')}>
          ⭐ Favoritos ({favorites.length})
        </button>
        <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>
          📜 Historial ({history.length})
        </button>
      </nav>

      {view === 'picker' && (
        <>
          <div className="filters">
            <div className="filter-group">
              <label>Biblioteca:</label>
              <select value={selectedLibrary?.key || ''} onChange={(e) => {
                const lib = libraries.find(l => l.key === e.target.value)
                setSelectedLibrary(lib)
                setResults([])
              }}>
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
                  <select value={filters.genre} onChange={(e) => setFilters({...filters, genre: e.target.value})}>
                    <option value="all">Todos</option>
                    {genres.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Año (min-max):</label>
                  <input type="number" placeholder="1980" value={filters.minYear} onChange={(e) => setFilters({...filters, minYear: e.target.value})} />
                  <input type="number" placeholder="2024" value={filters.maxYear} onChange={(e) => setFilters({...filters, maxYear: e.target.value})} />
                </div>

                <div className="filter-group">
                  <label>Rating mínimo (IMDB):</label>
                  <input type="number" step="0.1" min="0" max="10" placeholder="7.0" value={filters.minRating} onChange={(e) => setFilters({...filters, minRating: e.target.value})} />
                </div>

                <div className="filter-group">
                  <label>
                    <input type="checkbox" checked={filters.excludeWatched} onChange={(e) => setFilters({...filters, excludeWatched: e.target.checked})} />
                    Solo no vistas
                  </label>
                </div>
              </>
            )}
          </div>

          {selectedLibrary && (
            <div className="actions">
              <button className="btn-primary" onClick={() => fetchRandom(8)} disabled={loading}>
                🎲 SORPRÉNDEME
              </button>
              <button className="btn-secondary" onClick={() => {
                setFilters({ genre: 'all', minYear: '', maxYear: '', minRating: '', excludeWatched: false })
                startRoulette()
              }} disabled={loading || isRouletteSpinning}>
                🎰 RULETA TOTAL
              </button>
            </div>
          )}

          {loading && <div className="loading">Cargando...</div>}

          <div className="results">
            {results.map(item => (
              <div key={item.ratingKey} className="card">
                <div className="card-image-container">
                  {item.thumb && <img src={item.thumb} alt={item.title} loading="lazy" />}
                  {isFavorite(item) && <div className="favorite-star">⭐</div>}
                </div>
                <div className="card-content">
                  <h3>{item.title}</h3>
                  <p className="year">{item.year}</p>
                  {item.rating > 0 && <p className="rating">⭐ {item.rating.toFixed(1)}</p>}
                  {item.genres.length > 0 && <p className="genres">{item.genres.join(', ')}</p>}
                  <p className="summary">{item.summary}</p>
                  <div className="watched-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={isItemWatched(item)}
                        onChange={() => toggleWatched(item)}
                      />
                      <span>Marcar como vista</span>
                    </label>
                  </div>
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
              <div className="card-image-container">
                {item.thumb && <img src={item.thumb} alt={item.title} loading="lazy" />}
                <div className="favorite-star">⭐</div>
              </div>
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

      {view === 'all' && (
        <>
          {loading && <div className="loading">Cargando biblioteca completa...</div>}
          <div className="results">
            {allItems.map(item => (
              <div key={item.ratingKey} className="card" onClick={() => setSelectedItem(item)}>
                <div className="card-image-container">
                  {item.thumb && <img src={item.thumb} alt={item.title} loading="lazy" />}
                  {isFavorite(item) && <div className="favorite-star">⭐</div>}
                </div>
                <div className="card-content">
                  <h3>{item.title}</h3>
                  <p className="year">{item.year}</p>
                  {item.rating > 0 && <p className="rating">⭐ {item.rating.toFixed(1)}</p>}
                  {item.genres && item.genres.length > 0 && <p className="genres">{item.genres.join(', ')}</p>}
                  <p className="summary">{item.summary}</p>
                  <div className="watched-checkbox">
                    <label>
                      <input
                        type="checkbox"
                        checked={isItemWatched(item)}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggleWatched(item)
                        }}
                      />
                      <span>Marcar como vista</span>
                    </label>
                  </div>
                  <div className="card-actions">
                    <button onClick={(e) => { e.stopPropagation(); openInPlex(item) }}>▶️ Abrir en Plex</button>
                    <button onClick={(e) => { e.stopPropagation(); addToFavorites(item) }}>⭐ Favorito</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!loading && allItems.length === 0 && <p>No hay items en esta biblioteca</p>}
        </>
      )}

      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedItem(null)}>✕</button>
            <div className="modal-body">
              <div className="modal-poster">
                {selectedItem.art && <img src={selectedItem.art} alt={selectedItem.title} />}
              </div>
              <div className="modal-info">
                <h2>{selectedItem.title}</h2>
                <p className="modal-year">{selectedItem.year}</p>
                {selectedItem.rating > 0 && (
                  <div className="modal-rating">
                    <span className="rating-badge">⭐ {selectedItem.rating.toFixed(1)}</span>
                    <span className="rating-source">Plex Rating</span>
                  </div>
                )}
                {selectedItem.contentRating && (
                  <span className="content-rating-badge">{selectedItem.contentRating}</span>
                )}
                {selectedItem.genres && selectedItem.genres.length > 0 && (
                  <div className="modal-genres">
                    {selectedItem.genres.map((genre, index) => (
                      <span key={index} className="genre-tag">{genre}</span>
                    ))}
                  </div>
                )}
                {selectedItem.duration > 0 && (
                  <p className="modal-duration">
                    Duración: {Math.floor(selectedItem.duration / 60000)} min
                  </p>
                )}
                <p className="modal-summary">{selectedItem.summary}</p>
                <div className="modal-actions">
                  <button className="btn-primary" onClick={() => openInPlex(selectedItem)}>
                    ▶️ Ver en Plex
                  </button>
                  <button className="btn-secondary" onClick={() => {
                    addToFavorites(selectedItem)
                    setSelectedItem(null)
                  }}>
                    ⭐ Añadir a Favoritos
                  </button>
                  <a
                    href={`https://www.imdb.com/find?q=${encodeURIComponent(selectedItem.title)}&s=tt`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-imdb"
                  >
                    🎬 Buscar en IMDb
                  </a>
                </div>
                <div className="watched-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={isItemWatched(selectedItem)}
                      onChange={() => toggleWatched(selectedItem)}
                    />
                    <span>Marcar como vista</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {rouletteMovies.length > 0 && (
        <RouletteSpinner
          isSpinning={isRouletteSpinning}
          movies={rouletteMovies}
          onSpinComplete={handleRouletteComplete}
          onAddFavorite={addToFavorites}
          onClickCard={setSelectedItem}
        />
      )}
    </div>
  )
}

export default App
