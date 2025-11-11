import { useState, useContext } from 'react'
import { AuthContext } from './AuthContext'
import './AuthScreen.css'

export function AuthScreen() {
  const { login, register, error } = useContext(AuthContext)
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    setLoading(true)

    try {
      if (isLogin) {
        await login(formData.username, formData.password)
      } else {
        await register(formData.username, formData.email, formData.password, formData.displayName)
        // Después de registrarse, hacer login automático
        await login(formData.username, formData.password)
      }
    } catch (err) {
      setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎲 Plex Random Picker</h1>
          <p>{isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}</p>
        </div>

        {(error || formError) && (
          <div className="auth-error">{error || formError}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="alfastudios"
              required
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Nombre completo</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <>
              ¿No tienes cuenta?{' '}
              <button
                className="toggle-link"
                onClick={() => {
                  setIsLogin(false)
                  setFormError(null)
                  setFormData({ username: '', email: '', password: '', displayName: '' })
                }}
              >
                Regístrate aquí
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button
                className="toggle-link"
                onClick={() => {
                  setIsLogin(true)
                  setFormError(null)
                  setFormData({ username: '', email: '', password: '', displayName: '' })
                }}
              >
                Inicia sesión
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
