import * as Yup from 'yup';
import DeliveryMan from '../models/DeliveryMan';
import File from '../models/File';

class DeliveryManController {
  async index(req, res) {
    const deliverymen = await DeliveryMan.findAll();

    return res.json({ deliverymen });
  }

  async store(req, res) {
    const { name, email } = req.body;

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
    });

    try {
      await schema.validate(req.body);

      const deliExists = await DeliveryMan.findOne({ where: { email } });

      if (deliExists) {
        res.status(400).json({ error: 'E-mail already in use' });
      }

      let avatar = null;

      if (req.file) {
        avatar = await File.create({
          path: req.file.filename,
        });
      }

      const deliveryman = await DeliveryMan.create({
        name,
        email,
        avatar_id: avatar ? avatar.id : null,
      });

      return res.json(deliveryman);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    const { id } = req.params;

    const schema = Yup.object().shape({
      id: Yup.number().integer().required(),
      name: Yup.string(),
      email: Yup.string().email(),
    });

    try {
      await schema.validate({ ...req.body, id });

      const deliIdExists = await DeliveryMan.findByPk(id);

      if (!deliIdExists) {
        return res.status(400).json({ error: 'Deliveryman ID does not exist' });
      }
      if (req.body.email && req.body.email !== deliIdExists.email) {
        const deliExists = await DeliveryMan.findOne({
          where: { email: req.body.email },
        });

        if (deliExists) {
          res.status(400).json({ error: 'E-mail already in use' });
        }
      }

      let avatarId = deliIdExists.avatar_id;

      if (req.file) {
        if (avatarId) {
          const { id: fileId } = await File.update(
            {
              path: req.file.filename,
            },
            {
              where: {
                id: avatarId,
              },
            }
          );
          avatarId = fileId;
        } else {
          const { id: fileId } = await File.create({
            path: req.file.filename,
          });
          avatarId = fileId;
        }
      }

      const deliveryman = await deliIdExists.update({
        ...req.body,
        avatar_id: avatarId,
      });

      return res.json(deliveryman);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    const schema = Yup.object().shape({
      id: Yup.number().integer().required(),
    });

    try {
      await schema.validate(req.params);

      await DeliveryMan.destroy({ where: { id } });

      return res.json();
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new DeliveryManController();
