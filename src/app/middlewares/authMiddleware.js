import jwt from 'jsonwebtoken';
import auth from '../../config/auth';

function authMiddleware(req, res, next) {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const [, token] = authorization.split(' ');

    const decoded = jwt.verify(token, auth.secret);

    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.sendStatus(400);
  }
}
export default authMiddleware;
