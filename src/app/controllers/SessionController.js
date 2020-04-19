import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import auth from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().min(6).required(),
    });

    if (!schema.isValidSync(req.body)) {
      return res.status(400).json({ error: 'Validation fail' });
    }

    const { email, password } = req.body;
    const userExists = await User.findOne({ where: { email } });
    if (!userExists) {
      return res.status(400).json({ error: 'User does not exist' });
    }
    if (!(await userExists.checkPassword(password))) {
      return res.status(400).json({ error: 'User does not exist' });
    }
    try {
      const token = jwt.sign({ id: userExists.id }, auth.secret, {
        expiresIn: auth.expire,
      });
      return res.json(token);
    } catch (err) {
      return res.sendStatus(400);
    }
  }
}

export default new SessionController();
