import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  console.log('Auth middleware - Token present:', !!token);
  
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }
  
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
  console.log('Using JWT secret:', jwtSecret ? 'Set' : 'Not set');
  
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    console.log('Token verified successfully for user:', user.id || user._id);
    req.user = user;
    next();
  });
};