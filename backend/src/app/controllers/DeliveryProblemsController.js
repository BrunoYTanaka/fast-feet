import * as Yup from 'yup'
import Deliverymen from '../models/Deliverymen'
import Delivery from '../models/Delivery'
import Recipients from '../models/Recipients'
import DeliveryProblems from '../models/DeliveryProblems'
import Queue from '../../lib/queue'
import InformationMail from '../jobs/CancellationMail'

class DeliveryProblemsController {
  async store(req, res) {
    const { deliverymanId } = req.params
    const { deliveryId, description } = req.body

    const schema = Yup.object().shape({
      deliveryId: Yup.number().required(),
      description: Yup.string().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const deliveryman = await Deliverymen.findByPk(deliverymanId)

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' })
    }

    const delivery = await Delivery.findAll({
      where: {
        id: deliveryId,
        deliveryman_id: deliverymanId,
        canceled_at: null,
        end_date: null,
      },
    })
    if (!delivery.length) {
      return res
        .status(404)
        .json({ error: 'Deliveryman does not have this delivery associated' })
    }

    try {
      await DeliveryProblems.create({
        delivery_id: deliveryId,
        description,
      })
    } catch (error) {
      return res.status(500).json({
        message: 'INTERNAL ERROR',
        error,
      })
    }

    return res.json(delivery)
  }

  async index(req, res) {
    const deliveriesProblems = await DeliveryProblems.findAll({
      include: [{ model: Delivery, as: 'delivery' }],
    })
    return res.json(deliveriesProblems)
  }

  async get(req, res) {
    const { deliveryId } = req.params

    try {
      const deliveryProblems = await DeliveryProblems.findAll({
        where: {
          delivery_id: deliveryId,
        },
      })
      return res.json(deliveryProblems)
    } catch (error) {
      return res.status(500).json({
        message: 'INTERNAL ERROR',
        error,
      })
    }
  }

  async delete(req, res) {
    const { deliveryProblemsId } = req.params

    const deliveryProblems = await DeliveryProblems.findByPk(deliveryProblemsId)

    if (!deliveryProblemsId) {
      return res.status(404).json({ error: 'Delivery Problem not found' })
    }

    const { delivery_id } = deliveryProblems
    try {
      const delivery = await Delivery.findOne({
        where: {
          id: delivery_id,
          canceled_at: null,
        },
        include: [
          {
            model: Deliverymen,
            as: 'deliveryman',
            attributes: ['name', 'email', 'avatar_id'],
          },
          {
            model: Recipients,
            as: 'recipient',
            attributes: ['name', 'street', 'cep'],
          },
        ],
      })

      if (!delivery) {
        return res
          .status(500)
          .json({ error: 'Delivery not found or already canceled' })
      }

      const updatedDelivery = await delivery.update({
        id: delivery_id,
        canceled_at: new Date(),
      })

      const { deliveryman, recipient, product, canceled_at } = delivery

      await Queue.add(InformationMail.key, {
        deliveryman,
        recipient,
        product,
        date: canceled_at,
      })

      return res.json(updatedDelivery)
    } catch (error) {
      return res.status(500).json({
        message: 'INTERNAL ERROR',
        error,
      })
    }
  }
}

export default new DeliveryProblemsController()
