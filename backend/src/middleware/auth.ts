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
        email?: string;
        name?: string;
      }
    }
  }
}

// Combined auth and user hydration middleware
export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    // First verify JWT
    await new Promise((resolve, reject) => {
      jwtCheck(req, res, (err) => {
        if (err) reject(err);
        resolve(true);
      });
    });

    // Get user info from Auth0 token
    const auth0Id = req.auth?.payload.sub;
    console.log('auth0 info', req.auth?.payload);
    
    if (!auth0Id) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token claims'
      });
    }

    // Try to find existing user
    const existingUser = await User.query
      .byAuth0({ auth0Id })
      .go();

    if (existingUser.data.length > 0) {
      req.user = existingUser.data[0];
      return next();
    }

    // Create new user if not found
    const newUser = await User.create({
      userId: createId(),
      auth0Id,
      name: req.auth?.payload.name,
    }).go();

    req.user = newUser.data;
    next();
  } catch (error) {
    next(error);
  }
}; 