import { parseISO, isBefore, isSameDay, isAfter } from 'date-fns'
import * as Yup from 'yup'
import { Op } from 'sequelize'
import Delivery from '../models/Delivery'
import Recipients from '../models/Recipients'
import Deliverymen from '../models/Deliverymen'
import File from '../models/File'
import Queue from '../../lib/queue'
import InformationMail from '../jobs/InformationMail'

class DeliveryController {
  async store(req, res) {
    const { recipientId, deliverymanId, productName } = req.body

    const schema = Yup.object().shape({
      recipientId: Yup.number().required(),
      deliverymanId: Yup.number().required(),
      productName: Yup.string().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    try {
      const delivery = await Delivery.create({
        recipient_id: recipientId,
        deliveryman_id: deliverymanId,
        product: productName,
      })

      const deliveryman = await Deliverymen.findByPk(deliverymanId)

      await Queue.add(InformationMail.key, {
        deliveryman,
        productName,
        date: new Date(),
      })

      return res.json(delivery)
    } catch (error) {
      return res.status(500).json({ messagem: 'INTERNAL ERROR', error })
    }
  }

  async index(req, res) {
    const deliveries = await Delivery.findAll({
      attributes: ['id', 'product', 'canceled_at', 'start_date'],
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
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    })
    return res.json(deliveries)
  }

  async update(req, res) {
    const { deliveryId } = req.params
    const delivery = await Delivery.findByPk(deliveryId)
    const { productName, signatureId, startDate, endDate } = req.body

    const schema = Yup.object().shape({
      productName: Yup.string(),
      signatureId: Yup.string(),
      startDate: Yup.date(),
      endDate: Yup.date(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' })
    }

    if (delivery.canceled_at) {
      return res.status(500).json({
        error: 'You can not update a canceled delivery',
      })
    }

    if (startDate && endDate) {
      return res.status(500).json({
        error: 'You can not update start_date and end_date at the same time',
      })
    }

    if (startDate) {
      const day = new Date(startDate)
      const hour = day.getHours()

      if (isBefore(day, new Date()) && !isSameDay(day, new Date())) {
        return res.status(500).json({
          error: 'Invalid date PAST',
        })
      }
      if (hour <= 6 || hour > 18) {
        return res.status(500).json({
          error:
            'You can only withdraw a delivery between 06:00 and 18:00 hours',
        })
      }
      const parsedDate = parseISO(startDate)
      const count = await Delivery.count({
        where: {
          start_date: {
            [Op.eq]: parsedDate,
          },
        },
      })
      if (count >= 5) {
        return res.status(500).json({
          error: 'You can only withdraw 5 deliveries per day',
        })
      }
    }

    if (endDate) {
      const day = new Date(endDate)

      if (!signatureId) {
        return res.status(500).json({
          error: 'You need provide a signature_id',
        })
      }

      if (isAfter(day, new Date()) && !isSameDay(day, new Date()))
        return res.status(500).json({
          error: 'Invalid date FUTURE',
        })
    }

    try {
      const updatedDelivery = await delivery.update({
        product: productName,
        start_date: startDate,
        signature_id: signatureId,
        end_date: endDate,
      })
      return res.json(updatedDelivery)
    } catch (error) {
      return res.status(500).json({
        message: 'INTERNAL ERROR',
        error,
      })
    }
  }

  async delete(req, res) {
    const { deliveryId } = req.params

    const delivery = await Delivery.findByPk(deliveryId)

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' })
    }

    if (delivery.start_date && !delivery.end_date) {
      return res.status(500).json({
        error:
          'You can not delete a delivery after withdrawn and yet not delivered',
      })
    }

    try {
      delivery.destroy()
      return res.json({ message: `Delivery deleted ${deliveryId}` })
    } catch (error) {
      return res.status(500).json({
        message: 'INTERNAL ERROR',
        error,
      })
    }
  }

  async get(req, res) {
    const { deliverymanId } = req.body

    const deliveries = await Delivery.findAll({
      where: {
        deliveryman_id: deliverymanId,
      },
    })

    return res.json(deliveries)
  }
}

export default new DeliveryController()
