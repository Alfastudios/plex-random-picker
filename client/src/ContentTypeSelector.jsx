import './ContentTypeSelector.css'

export function ContentTypeSelector({ onSelect, selectedType }) {
  const contentTypes = [
    {
      id: 'all',
      title: '🎬 Todo Contenido',
      description: 'Películas, Series y Documentales',
      color: '#ff9b26'
    },
    {
      id: 'movie',
      title: '🎥 Películas',
      description: 'Solo películas',
      color: '#ee4f27'
    },
    {
      id: 'show',
      title: '📺 Series',
      description: 'Solo series de TV',
      color: '#6b21ef'
    },
    {
      id: 'documentary',
      title: '📚 Documentales',
      description: 'Solo documentales',
      color: '#b83dff'
    }
  ]

  return (
    <div className="content-type-selector">
      <div className="selector-container">
        <div className="selector-header">
          <h1>🎲 Plex Random Picker</h1>
          <p>¿Qué quieres ver?</p>
        </div>

        <div className="selector-grid">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              className={`content-type-card ${selectedType === type.id ? 'selected' : ''}`}
              onClick={() => onSelect(type.id)}
              style={{
                '--card-color': type.color
              }}
            >
              <div className="card-title">{type.title}</div>
              <div className="card-description">{type.description}</div>
              {selectedType === type.id && <div className="selected-badge">✓ Seleccionado</div>}
            </button>
          ))}
        </div>

        <div className="selector-footer">
          <p className="hint">Puedes cambiar esto más tarde desde la app</p>
        </div>
      </div>
    </div>
  )
}
