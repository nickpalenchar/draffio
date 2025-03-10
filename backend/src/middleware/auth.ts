import { RequestHandler } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import { User } from '../db/entities/User';
import { createId } from '@paralleldrive/cuid2';

// Auth0 JWT validation middleware
const jwtCheck = auth({
  audience: 'draffio',
  issuerBaseURL: 'https://dev-d362gmlx6erjtmjb.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        auth0Id: string;
        username: string;
        name?: string;
      }
    }
  }
}

const ADJECTIVES = ["long", "short", "wide"];
const NOUNS = ["Neck", "Car", "Iguana"];

function generateRandomName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return adjective + noun;
}

async function generateUniqueUsername(baseName: string): Promise<string> {
  // Clean the name to be URL-friendly
  let username = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30);  // Reasonable max length

  // Try the base name first
  const exists = await User.query
    .byUsername({ username })
    .go();
  
  if (exists.data.length === 0) {
    return username;
  }

  // Try with random numbers
  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = Math.floor(Math.random() * 10000);
    const candidateUsername = `${username}_${suffix}`;

    const exists = await User.query
      .byUsername({ username: candidateUsername })
      .go();

    if (exists.data.length === 0) {
      return candidateUsername;
    }
  }

  // If all attempts fail, use a cuid suffix
  return `${username}_${createId().slice(0, 8)}`;
}

// Combined auth and user hydration middleware
export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      jwtCheck(req, res, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    });

    const auth0Id = req.auth?.payload.sub;
    if (!auth0Id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token claims'
      });
    }

    // Use provided name or generate one
    const name = req.auth?.payload.name as string || generateRandomName();

    // Try to find existing user
    const existingUser = await User.query
      .byAuth0({ auth0Id })
      .go();

    if (existingUser.data.length > 0) {
      req.user = existingUser.data[0];
      return next();
    }

    // Generate unique username
    const username = await generateUniqueUsername(name);

    // Create new user
    const newUser = await User.create({
      userId: createId(),
      auth0Id,
      name,
      username,
    }).go();

    req.user = newUser.data;
    next();
  } catch (error) {
    next(error);
  }
};