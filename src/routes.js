import { Router } from 'express';
import multer from 'multer';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import OrderController from './app/controllers/OrderController';
import DeliveryController from './app/controllers/DeliveryController';
import ProblemController from './app/controllers/ProblemController';
import authMiddleware from './app/middlewares/authMiddleware';

import multerConfig from './config/multer';

import DeliverymanController from './app/controllers/DeliverymanController';

const upload = multer(multerConfig);

const routes = Router();

routes.post('/session', SessionController.store);

routes.get('/deliveryman/:id/deliveries', DeliveryController.index);
routes.put(
  '/deliveryman/:id/deliveries/:orderId',
  upload.single('signature'),
  DeliveryController.update
);

routes.post('/delivery/:id/problems', ProblemController.store);

routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.get('/deliverymen', DeliverymanController.index);
routes.post(
  '/deliverymen',
  upload.single('avatar'),
  DeliverymanController.store
);
routes.put(
  '/deliverymen/:id',
  upload.single('avatar'),
  DeliverymanController.update
);
routes.delete('/deliverymen/:id', DeliverymanController.delete);

// Rotas order
routes.get('/orders', OrderController.index);
routes.post('/orders', OrderController.store);
routes.put('/orders/:id', upload.single('signature'), OrderController.update);
routes.delete('/orders/:id', OrderController.delete);

routes.get('/delivery/problems', ProblemController.index);
routes.get('/delivery/:id/problems', ProblemController.show);
routes.delete('/problem/:id/cancel-delivery', ProblemController.delete);

export default routes;
