import * as Yup from 'yup';
import Order from '../models/Order';
import DeliveryMan from '../models/DeliveryMan';
import DeliveryProblem from '../models/DeliveryProblem';

import DeliveryManCanceledMail from '../jobs/DeliveryManCanceledMail';
import Queue from '../../lib/Queue';

class ProblemController {
  async index(req, res) {
    const orders = await Order.findAll({
      include: [
        {
          model: DeliveryProblem,
          as: 'problems',
          required: true,
        },
      ],
    });
    return res.json(orders);
  }

  async show(req, res) {
    const { id } = req.params;

    const schema = Yup.object().shape({
      id: Yup.number().integer().required(),
    });

    try {
      await schema.validate(req.params);

      const deliProb = await DeliveryProblem.findAll({
        where: { delivery_id: id },
      });
      return res.json(deliProb);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async store(req, res) {
    const { id } = req.params;

    const schema = Yup.object().shape({
      id: Yup.number().integer().required(),
      description: Yup.string().required(),
    });

    try {
      await schema.validate({ ...req.params, ...req.body });

      const orderExists = await Order.findByPk(id);
      if (!orderExists) {
        return res.status(400).json({ error: 'Order does not exist' });
      }
      const cadProb = await DeliveryProblem.create({
        description: req.body.description,
        delivery_id: id,
      });
      return res.json(cadProb);
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

      const probExist = await DeliveryProblem.findOne({
        where: { id },
        include: [
          {
            model: Order,
            as: 'order',
            include: [
              {
                model: DeliveryMan,
                as: 'deliveryman',
              },
            ],
          },
        ],
      });

      if (!probExist) {
        return res.status(400).json({ error: 'Problem does not exist' });
      }

      if (probExist.order.canceled_at) {
        return res.status(400).json({ error: 'Order already canceled' });
      }
      const order = await probExist.order.update({
        canceled_at: new Date(),
      });

      await Queue.add(DeliveryManCanceledMail.key, {
        deliveryman: probExist.order.deliveryman,
        order,
      });
      return res.json();
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new ProblemController();
