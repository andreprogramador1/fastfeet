import * as Yup from 'yup';
import Order from '../models/Order';
import DeliveryMan from '../models/DeliveryMan';
import Recipient from '../models/Recipient';

import DeliveryManMail from '../jobs/DeliveryManMail';
import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll();

    return res.json({ orders });
  }

  async store(req, res) {
    const { recipientId, deliverymanId, product } = req.body;

    const schema = Yup.object().shape({
      recipientId: Yup.number().integer().required(),
      product: Yup.string().required(),
      deliverymanId: Yup.number().integer().required(),
    });

    try {
      await schema.validate(req.body);

      const deliExists = await DeliveryMan.findByPk(deliverymanId);

      if (!deliExists) {
        return res.status(400).json({ error: 'Deliveryman does not exist' });
      }

      const reciExists = await Recipient.findByPk(recipientId);

      if (!reciExists) {
        return res.status(400).json({ error: 'Recipient does not exist' });
      }

      const order = await Order.create({
        recipient_id: recipientId,
        deliveryman_id: deliverymanId,
        product,
      });

      await Queue.add(DeliveryManMail.key, {
        deliveryman: deliExists,
        order,
        recipient: reciExists,
      });

      return res.json(order);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().integer().required(),
      product: Yup.string().required(),
    });

    try {
      await schema.validate({ ...req.body, ...req.params });

      const orders = await Order.findByPk(req.params.id);

      if (!orders) {
        return res.status(400).json({ error: 'Order does not exist' });
      }

      const orderFinished = await orders.update(req.body);

      return res.json(orderFinished);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().integer().required(),
    });

    try {
      await schema.validate(req.params);

      await Order.destroy({
        where: {
          id: req.params.id,
        },
      });

      return res.json();
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}
export default new OrderController();
