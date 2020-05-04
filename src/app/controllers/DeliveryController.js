import { isBefore, isAfter, setHours, setMinutes, setSeconds } from 'date-fns';
import { Op } from 'sequelize';
import * as Yup from 'yup';
import DeliveryMan from '../models/DeliveryMan';
import Order from '../models/Order';
import File from '../models/File';

class DeliveryController {
  async index(req, res) {
    const { id } = req.params;
    const { deliveryEnded } = req.query;

    const schema = Yup.object().shape({
      id: Yup.number().integer().required(),
      deliveryEnded: Yup.boolean(),
    });

    try {
      await schema.validate({ id, deliveryEnded });

      const deliExists = await DeliveryMan.findByPk(id);
      if (!deliExists) {
        res.status(400).json({ error: 'Deliveryman does not exist' });
      }
      const where = {
        deliveryman_id: deliExists.id,
        canceled_at: {
          [Op.is]: null,
        },
        end_date: {
          [Op.is]: null,
        },
      };

      if (deliveryEnded) {
        where.end_date = {
          [Op.not]: null,
        };
      }

      const orders = await Order.findAll({
        where,
      });
      return res.json(orders);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    const { id, orderId } = req.params;

    const schema = Yup.object().shape({
      id: Yup.number().integer().required(),
      orderId: Yup.number().integer().required(),
    });

    try {
      await schema.validate(req.params);

      const orders = await Order.findOne({
        where: {
          id: orderId,
          deliveryman_id: id,
        },
      });

      if (!orders) {
        return res.status(400).json({ error: 'Order does not exist' });
      }

      if (!orders.start_date) {
        const currentyTime = new Date();
        const initHour = setSeconds(
          setMinutes(setHours(currentyTime, 8), 0),
          0
        );
        const endingHour = setSeconds(
          setMinutes(setHours(currentyTime, 18), 0),
          0
        );
        const ordersToday = await Order.findAll({
          where: {
            deliveryman_id: id,
            start_date: {
              [Op.between]: [initHour, endingHour],
            },
          },
        });

        if (ordersToday.length >= 5) {
          return res.status(400).json({ error: 'Limit of 5 per day exceded' });
        }

        if (
          isBefore(currentyTime, endingHour) &&
          isAfter(currentyTime, initHour)
        ) {
          const orderStarted = await orders.update({
            start_date: currentyTime,
          });
          return res.json(orderStarted);
        }
        return res
          .status(400)
          .json({ error: 'The only available times are between 8:00/18:00' });
      }

      if (orders.end_date) {
        return res.status(400).json({ error: 'Order already ended' });
      }

      let signatureId = null;

      if (req.file) {
        const { id: fileId } = await File.create({
          path: req.file.filename,
        });
        signatureId = fileId;
      }

      const orderFinished = await orders.update({
        end_date: new Date(),
        signature_id: signatureId,
      });

      return res.json(orderFinished);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default new DeliveryController();
