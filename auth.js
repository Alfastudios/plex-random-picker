import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { getAsync, runAsync } from './database.js';

// Secret para JWT (cambiar en producción)
const JWT_SECRET = process.env.JWT_SECRET || 'tu-super-secreto-cambiar-en-produccion';

// Registrar nuevo usuario
export async function registerUser(username, email, password, displayName) {
  try {
    // Validar que el usuario no existe
    const existing = await getAsync('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing) {
      throw new Error('Usuario o email ya existe');
    }

    // Hash de la contraseña
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Insertar usuario
    const result = await runAsync(
      'INSERT INTO users (username, email, password, displayName) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, displayName]
    );

    return {
      id: result.lastID,
      username,
      email,
      displayName
    };
  } catch (error) {
    throw error;
  }
}

// Login de usuario
export async function loginUser(username, password) {
  try {
    // Buscar usuario
    const user = await getAsync('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña
    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) {
      throw new Error('Contraseña incorrecta');
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id, username: user.username, displayName: user.displayName },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName
      }
    };
  } catch (error) {
    throw error;
  }
}

// Middleware para verificar token
export function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Obtener usuario por ID
export async function getUserById(id) {
  const user = await getAsync(
    'SELECT id, username, email, displayName FROM users WHERE id = ?',
    [id]
  );
  return user;
}
