import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initializeDatabase, allAsync, getAsync, runAsync } from './database.js';
import { registerUser, loginUser, verifyToken, getUserById } from './auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Plex configuration from environment variables
const PLEX_URL = process.env.VITE_PLEX_URL || 'http://192.168.1.88:32400';
const PLEX_TOKEN = process.env.VITE_PLEX_TOKEN || 'o-CQNS6jTNt-3uihuSey';

// Cache para machineIdentifier
let machineIdentifier = null;

app.use(cors());
app.use(express.json());

// Obtener machineIdentifier al iniciar
async function getMachineIdentifier() {
  try {
    const response = await axios.get(`${PLEX_URL}/?X-Plex-Token=${PLEX_TOKEN}`, {
      headers: { 'Accept': 'text/xml' }
    });
    const result = await parseStringPromise(response.data);
    machineIdentifier = result.MediaContainer.$.machineIdentifier;
    return machineIdentifier;
  } catch (error) {
    console.error('Error fetching machine identifier:', error.message);
    return null;
  }
}

// Serve static files from client/dist in production
app.use(express.static(path.join(__dirname, 'client/dist')));

// Get server configuration (without sensitive data)
app.get('/api/config', (req, res) => {
  res.json({
    plexUrl: PLEX_URL,
    machineIdentifier: machineIdentifier
  });
});

// ============ AUTENTICACIÓN ============

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    if (!username || !email || !password || !displayName) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const user = await registerUser(username, email, password, displayName);
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login de usuario
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const result = await loginUser(username, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Obtener usuario actual
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await getUserById(req.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ FIN AUTENTICACIÓN ============

// Get all libraries
app.get('/api/libraries', async (req, res) => {
  try {
    const response = await axios.get(`${PLEX_URL}/library/sections?X-Plex-Token=${PLEX_TOKEN}`, {
      headers: { 'Accept': 'text/xml' }
    });

    const result = await parseStringPromise(response.data);
    const libraries = result.MediaContainer.Directory || [];

    res.json(libraries.map(lib => ({
      key: lib.$.key,
      title: lib.$.title,
      type: lib.$.type // movie, show
    })));
  } catch (error) {
    console.error('Error fetching libraries:', error.message);
    res.status(500).json({ error: 'Failed to fetch libraries' });
  }
});

// Get all items from a library
app.get('/api/library/:key/all', async (req, res) => {
  try {
    const { key } = req.params;

    // Fetch all items with large container size
    const response = await axios.get(`${PLEX_URL}/library/sections/${key}/all?X-Plex-Token=${PLEX_TOKEN}&X-Plex-Container-Size=500`, {
      headers: { 'Accept': 'text/xml' }
    });

    const result = await parseStringPromise(response.data);
    const videos = result.MediaContainer.Video || result.MediaContainer.Directory || [];

    const items = videos.map(video => {
      const attributes = video.$;
      return {
        ratingKey: attributes.ratingKey,
        key: attributes.key,
        title: attributes.title,
        year: parseInt(attributes.year) || 0,
        summary: attributes.summary,
        rating: parseFloat(attributes.rating) || 0,
        contentRating: attributes.contentRating,
        duration: parseInt(attributes.duration) || 0,
        thumb: attributes.thumb ? `${PLEX_URL}${attributes.thumb}?X-Plex-Token=${PLEX_TOKEN}` : null,
        art: attributes.art ? `${PLEX_URL}${attributes.art}?X-Plex-Token=${PLEX_TOKEN}` : null,
        type: attributes.type, // movie or show
        genres: video.Genre?.map(g => g.$.tag) || [],
        addedAt: attributes.addedAt,
        viewCount: parseInt(attributes.viewCount) || 0,
        plexUrl: `${PLEX_URL}/web/index.html#!/server/${machineIdentifier}/details?key=${encodeURIComponent(attributes.key)}`
      };
    });

    console.log(`Fetched ${items.length} items from library ${key}`);
    res.json(items);
  } catch (error) {
    console.error('Error fetching library items:', error.message);
    res.status(500).json({ error: 'Failed to fetch library items' });
  }
});

// Get random items with filters
app.post('/api/random', async (req, res) => {
  try {
    const { libraryKey, filters, count = 3 } = req.body;

    // Get all items from library
    const response = await axios.get(`${PLEX_URL}/library/sections/${libraryKey}/all?X-Plex-Token=${PLEX_TOKEN}`, {
      headers: { 'Accept': 'text/xml' }
    });

    const result = await parseStringPromise(response.data);
    let videos = result.MediaContainer.Video || result.MediaContainer.Directory || [];

    // Parse and filter items
    let items = videos.map(video => {
      const attributes = video.$;
      return {
        ratingKey: attributes.ratingKey,
        key: attributes.key,
        title: attributes.title,
        year: parseInt(attributes.year) || 0,
        summary: attributes.summary,
        rating: parseFloat(attributes.rating) || 0,
        contentRating: attributes.contentRating,
        duration: parseInt(attributes.duration) || 0,
        thumb: attributes.thumb ? `${PLEX_URL}${attributes.thumb}?X-Plex-Token=${PLEX_TOKEN}` : null,
        art: attributes.art ? `${PLEX_URL}${attributes.art}?X-Plex-Token=${PLEX_TOKEN}` : null,
        type: attributes.type,
        genres: video.Genre?.map(g => g.$.tag) || [],
        addedAt: attributes.addedAt,
        viewCount: parseInt(attributes.viewCount) || 0,
        plexUrl: `${PLEX_URL}/web/index.html#!/server/${machineIdentifier}/details?key=${encodeURIComponent(attributes.key)}`
      };
    });

    // Apply filters
    if (filters) {
      if (filters.genre && filters.genre !== 'all') {
        items = items.filter(item =>
          item.genres.some(g => g.toLowerCase().includes(filters.genre.toLowerCase()))
        );
      }

      if (filters.minYear) {
        items = items.filter(item => item.year >= parseInt(filters.minYear));
      }

      if (filters.maxYear) {
        items = items.filter(item => item.year <= parseInt(filters.maxYear));
      }

      if (filters.minRating) {
        items = items.filter(item => item.rating >= parseFloat(filters.minRating));
      }

      if (filters.excludeWatched) {
        items = items.filter(item => item.viewCount === 0);
      }
    }

    // Shuffle and pick random items
    const shuffled = items.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    res.json({
      total: items.length,
      items: selected
    });
  } catch (error) {
    console.error('Error fetching random items:', error.message);
    res.status(500).json({ error: 'Failed to fetch random items' });
  }
});

// Get all genres from a library
app.get('/api/library/:key/genres', async (req, res) => {
  try {
    const { key } = req.params;
    const response = await axios.get(`${PLEX_URL}/library/sections/${key}/all?X-Plex-Token=${PLEX_TOKEN}`, {
      headers: { 'Accept': 'text/xml' }
    });

    const result = await parseStringPromise(response.data);
    const videos = result.MediaContainer.Video || result.MediaContainer.Directory || [];

    const genresSet = new Set();
    videos.forEach(video => {
      const genres = video.Genre || [];
      genres.forEach(g => genresSet.add(g.$.tag));
    });

    res.json(Array.from(genresSet).sort());
  } catch (error) {
    console.error('Error fetching genres:', error.message);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

// ============ FAVORITOS POR USUARIO ============

// Obtener favoritos del usuario
app.get('/api/user/favorites', verifyToken, async (req, res) => {
  try {
    const favorites = await allAsync(
      'SELECT * FROM favorites WHERE userId = ? ORDER BY addedAt DESC',
      [req.userId]
    );
    const items = favorites.map(fav => JSON.parse(fav.data));
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Añadir a favoritos
app.post('/api/user/favorites', verifyToken, async (req, res) => {
  try {
    const { ratingKey, data } = req.body;

    await runAsync(
      'INSERT OR REPLACE INTO favorites (userId, ratingKey, data) VALUES (?, ?, ?)',
      [req.userId, ratingKey, JSON.stringify(data)]
    );

    res.json({ message: 'Añadido a favoritos' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar de favoritos
app.delete('/api/user/favorites/:ratingKey', verifyToken, async (req, res) => {
  try {
    const { ratingKey } = req.params;

    await runAsync(
      'DELETE FROM favorites WHERE userId = ? AND ratingKey = ?',
      [req.userId, ratingKey]
    );

    res.json({ message: 'Eliminado de favoritos' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ HISTORIAL POR USUARIO ============

// Obtener historial del usuario
app.get('/api/user/history', verifyToken, async (req, res) => {
  try {
    const history = await allAsync(
      'SELECT * FROM history WHERE userId = ? ORDER BY viewedAt DESC LIMIT 50',
      [req.userId]
    );
    const items = history.map(h => JSON.parse(h.data));
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Añadir al historial
app.post('/api/user/history', verifyToken, async (req, res) => {
  try {
    const { ratingKey, data } = req.body;

    await runAsync(
      'INSERT INTO history (userId, ratingKey, data) VALUES (?, ?, ?)',
      [req.userId, ratingKey, JSON.stringify(data)]
    );

    res.json({ message: 'Añadido al historial' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ FIN FAVORITOS E HISTORIAL ============

// Catch all for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Plex Random Picker server running on http://0.0.0.0:${PORT}`);
  console.log(`Connected to Plex at ${PLEX_URL}`);

  // Inicializar base de datos
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }

  // Obtener machineIdentifier al iniciar
  const identifier = await getMachineIdentifier();
  if (identifier) {
    console.log(`Machine Identifier: ${identifier}`);
  } else {
    console.warn('Warning: Could not fetch machine identifier');
  }
});
