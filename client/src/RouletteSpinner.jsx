import { useState, useEffect } from 'react'
import './RouletteSpinner.css'

export function RouletteSpinner({ isSpinning, movies, onSpinComplete, onAddFavorite }) {
  const [displayedMovie, setDisplayedMovie] = useState(movies[0] || null)
  const [spinProgress, setSpinProgress] = useState(0)

  useEffect(() => {
    if (!isSpinning) return

    let frameCount = 0
    const totalFrames = 150 // Total de frames para la animación

    const spinInterval = setInterval(() => {
      frameCount++
      const progress = frameCount / totalFrames

      // Velocidad: comienza rápido, se ralentiza exponencialmente
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      // Mostrar películas random más rápido al principio, más lento al final
      const displaySpeed = Math.max(1, Math.floor((1 - easedProgress) * 20))
      if (frameCount % displaySpeed === 0) {
        const randomIndex = Math.floor(Math.random() * movies.length)
        setDisplayedMovie(movies[randomIndex])
      }

      setSpinProgress(progress)

      // Cuando termina la animación
      if (progress >= 1) {
        clearInterval(spinInterval)
        // Mostrar la película ganadora (la última)
        const winningMovie = movies[Math.floor(Math.random() * movies.length)]
        setDisplayedMovie(winningMovie)
        setSpinProgress(0)
        onSpinComplete(winningMovie)
      }
    }, 16) // ~60fps

    return () => clearInterval(spinInterval)
  }, [isSpinning, movies, onSpinComplete])

  return (
    <div className={`roulette-overlay ${isSpinning ? 'spinning' : ''}`}>
      <div className="roulette-container">
        <div className="roulette-frame">
          {displayedMovie ? (
            <>
              <div className="movie-image">
                {displayedMovie.thumb && (
                  <img src={displayedMovie.thumb} alt={displayedMovie.title} />
                )}
              </div>
              <div className="movie-info">
                <h2>{displayedMovie.title}</h2>
                <p className="year">{displayedMovie.year}</p>
                {displayedMovie.rating > 0 && (
                  <p className="rating">⭐ {displayedMovie.rating.toFixed(1)}</p>
                )}
              </div>
            </>
          ) : (
            <div className="loading">Cargando...</div>
          )}
        </div>

        {!isSpinning && displayedMovie && (
          <div className="roulette-actions">
            <button className="action-btn open-btn" onClick={() => window.open(displayedMovie.plexUrl, '_blank')}>
              ▶️ Abrir en Plex
            </button>
            <button className="action-btn favorite-btn" onClick={() => onAddFavorite && onAddFavorite(displayedMovie)}>
              ⭐ Añadir a Favoritos
            </button>
          </div>
        )}

        {isSpinning && (
          <div className="spinning-indicator">
            <div className="spinner"></div>
            <p>¡Girando la ruleta...</p>
          </div>
        )}
      </div>
    </div>
  )
}
