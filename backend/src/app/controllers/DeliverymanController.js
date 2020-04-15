import * as Yup from 'yup'
import Delivery from '../models/Delivery'
import Deliverymen from '../models/Deliverymen'

const { Op } = require('sequelize')

class DeliverymanController {
  async get(req, res) {
    const { deliverymanId } = req.params
    const { delivered } = req.body

    const schema = Yup.object().shape({
      delivered: Yup.boolean(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid delivered value' })
    }

    const deliveryman = await Deliverymen.findByPk(deliverymanId)

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' })
    }
    try {
      if (delivered) {
        const deliveries = await Delivery.findAll({
          where: {
            deliveryman_id: deliverymanId,
            end_date: {
              [Op.not]: null,
            },
          },
        })
        return res.json(deliveries)
      }
      const deliveries = await Delivery.findAll({
        where: {
          deliveryman_id: deliverymanId,
          canceled_at: null,
          end_date: null,
        },
      })
      return res.json(deliveries)
    } catch (error) {
      return res.status(500).json({
        message: 'INTERNAL ERROR',
        error,
      })
    }
  }
}

export default new DeliverymanController()
