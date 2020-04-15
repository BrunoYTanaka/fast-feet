import multer from 'multer'
import { Router } from 'express'
import multerConfig from './config/multer'
import authMiddleware from './app/middlewares/auth'
import SessionController from './app/controllers/SessionController'
import RecipientsController from './app/controllers/RecipientsController'
import FileController from './app/controllers/FileController'
import DeliverymenController from './app/controllers/DeliverymenController'
import DeliveryController from './app/controllers/DeliveryController'
import DeliverymanController from './app/controllers/DeliverymanController'
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController'

const upload = multer(multerConfig)

const routes = new Router()

routes.post('/session', SessionController.store)
routes.get('/deliveryman/:deliverymanId/deliveries', DeliverymanController.get)

routes.use(authMiddleware)

routes.post('/recipients', RecipientsController.store)
routes.post('/files', upload.single('file'), FileController.store)
routes.post('/deliverymen', DeliverymenController.store)
routes.get('/deliverymen', DeliverymenController.index)
routes.put('/deliverymen/:deliverymanId', DeliverymenController.update)
routes.delete('/deliverymen/:deliverymanId', DeliverymenController.delete)

routes.post('/delivery', DeliveryController.store)
routes.get('/delivery', DeliveryController.index)
routes.put('/delivery/:deliveryId', DeliveryController.update)
routes.delete('/delivery/:deliveryId', DeliveryController.delete)

routes.post(
  '/delivery/:deliverymanId/problems',
  DeliveryProblemsController.store
)
routes.get('/delivery/problems', DeliveryProblemsController.index)
routes.get('/delivery/problems/:deliveryId', DeliveryProblemsController.get)
routes.delete(
  '/problem/:deliveryProblemsId/cancel-delivery',
  DeliveryProblemsController.delete
)

module.exports = routes
