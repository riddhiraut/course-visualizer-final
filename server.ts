import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

interface StoredUser {
  id: string;
  email: string;
  name: string;
  salt: string;
  passwordHash: string;
  token: string;
  createdAt: string;
  plannerState: {
    programs: string[];
    completed: string[];
    electives: string[];
    updatedAt: string;
  };
}

interface DatabaseSchema {
  users: Record<string, StoredUser>; // keyed by email
}

// Helper to read database
function readDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial: DatabaseSchema = { users: {} };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file:', err);
    return { users: {} };
  }
}

// Helper to write database atomically
function writeDatabase(db: DatabaseSchema) {
  const jsonStr = JSON.stringify(db, null, 2);
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, jsonStr, 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// Password hashing helper
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

app.use(express.json());

// ============================================================
// AUTHENTICATION & PLANNER PERSISTENCE API ROUTES
// ============================================================

// 1. User Registration
app.post('/api/auth/register', (req: Request, res: Response): any => {
  const { email, password, name } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = readDatabase();

  if (db.users[normalizedEmail]) {
    return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const token = crypto.randomBytes(32).toString('hex');
  const userId = `usr_${crypto.randomUUID()}`;

  const newUser: StoredUser = {
    id: userId,
    email: normalizedEmail,
    name: name?.trim() || normalizedEmail.split('@')[0],
    salt,
    passwordHash,
    token,
    createdAt: new Date().toISOString(),
    plannerState: {
      programs: ['B.S. in Computer Science'],
      completed: [],
      electives: [],
      updatedAt: new Date().toISOString(),
    },
  };

  db.users[normalizedEmail] = newUser;
  writeDatabase(db);

  return res.status(201).json({
    message: 'Account successfully registered.',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    },
    planner: newUser.plannerState,
  });
});

// 2. User Login
app.post('/api/auth/login', (req: Request, res: Response): any => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const db = readDatabase();
  const user = db.users[normalizedEmail];

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const incomingHash = hashPassword(password, user.salt);
  if (incomingHash !== user.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Refresh token
  const token = crypto.randomBytes(32).toString('hex');
  user.token = token;
  writeDatabase(db);

  return res.json({
    message: 'Signed in successfully.',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    planner: user.plannerState,
  });
});

// Middleware to authenticate via Bearer token
function authenticate(req: Request, res: Response, next: NextFunction): any {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing token' });
  }

  const token = authHeader.substring(7);
  const db = readDatabase();
  const user = Object.values(db.users).find((u) => u.token === token);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: invalid or expired session' });
  }

  (req as any).user = user;
  next();
}

// 3. Get Current User / Verify Session
app.get('/api/auth/me', authenticate, (req: Request, res: Response): any => {
  const user: StoredUser = (req as any).user;
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    planner: user.plannerState,
  });
});

// 4. Save Degree Progress to Database
app.post('/api/planner/save', authenticate, (req: Request, res: Response): any => {
  const user: StoredUser = (req as any).user;
  const { programs, completed, electives } = req.body;

  const db = readDatabase();
  const userInDb = db.users[user.email];

  if (!userInDb) {
    return res.status(404).json({ error: 'User not found in database.' });
  }

  userInDb.plannerState = {
    programs: Array.isArray(programs) ? programs : userInDb.plannerState.programs,
    completed: Array.isArray(completed) ? completed : userInDb.plannerState.completed,
    electives: Array.isArray(electives) ? electives : userInDb.plannerState.electives,
    updatedAt: new Date().toISOString(),
  };

  writeDatabase(db);

  return res.json({
    message: 'Degree progress saved to database successfully.',
    planner: userInDb.plannerState,
  });
});

// 5. Load Degree Progress from Database
app.get('/api/planner/load', authenticate, (req: Request, res: Response): any => {
  const user: StoredUser = (req as any).user;
  return res.json({
    planner: user.plannerState,
  });
});

// ============================================================
// VITE DEV MIDDLEWARE / STATIC ASSETS
// ============================================================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production build
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Mount Vite middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
