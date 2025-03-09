import { Router } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';

const jwtCheck = auth({
  audience: 'draffio',
  issuerBaseURL: 'https://dev-d362gmlx6erjtmjb.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});

// Import other route modules as needed
// import userRoutes from './users';
// import codeRoutes from './code';

const v1Router = Router();

// PUBLIC ROUTES

v1Router.get('/healthz', (req, res) => {
  res.json({ 
    status: 'ok',
    version: 'v1'
  });
});

// PRIVATE ROUTES

v1Router.use(jwtCheck);

v1Router.get('/authorized', (req, res) => {
  res.json({
    message: 'Hello from a private endpoint! You need to be authenticated to see this.'
  });
});

// Mount other routes
// v1Router.use('/users', userRoutes);
// v1Router.use('/code', codeRoutes);

// Error handling middleware should be last
v1Router.use((err: any, req: any, res: any, next: any) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'token_invalid'
    });
  }
  next(err);
});

export default v1Router;