import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    // const { name, street, number, complement, uf, city, zip_code } = req.body;
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string().required(),
      complement: Yup.string(),
      uf: Yup.string().required().min(2).max(2),
      city: Yup.string().required(),
      zip_code: Yup.string().required().min(8).max(8),
    });

    try {
      await schema.validate(req.body);
      const recipient = await Recipient.create(req.body);

      return res.json({ recipient });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.string(),
      complement: Yup.string(),
      uf: Yup.string().min(2).max(2),
      city: Yup.string(),
      zip_code: Yup.string().min(8).max(8),
    });

    const { id } = req.params;
    try {
      await schema.validate(req.body);
      const recipientExists = await Recipient.findByPk(id);
      if (!recipientExists) {
        return res.status(400).json({ error: 'Recipient does not exist' });
      }
      const recipient = await recipientExists.update(req.body);

      return res.json({ recipient });
    } catch (err) {
      return res.sendStatus(400);
    }
  }
}

export default new RecipientController();
