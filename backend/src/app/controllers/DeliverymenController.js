import * as Yup from 'yup'
import Deliverymen from '../models/Deliverymen'
import File from '../models/File'

class DeliverymenController {
  async store(req, res) {
    const { name, email } = req.body

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const deliverymanExists = await Deliverymen.findOne({ where: { email } })

    if (deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman already exists' })
    }

    const deliveryman = await Deliverymen.create({ name, email })
    return res.json(deliveryman)
  }

  async index(req, res) {
    const deliverymen = await Deliverymen.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        { model: File, as: 'avatar', attributes: ['name', 'path', 'url'] },
      ],
    })
    return res.json(deliverymen)
  }

  async update(req, res) {
    const { deliverymanId } = req.params
    const { email } = req.body

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid email' })
    }

    const deliveryman = await Deliverymen.findByPk(deliverymanId)

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' })
    }

    if (email !== deliveryman.email) {
      const deliverymanExists = await Deliverymen.findOne({
        where: { email },
      })
      if (deliverymanExists) {
        return res.status(400).json({ error: 'Deliveryman already exists' })
      }
    }

    const updatedDeliveryman = await deliveryman.update(req.body)

    return res.json({
      deliveryman: updatedDeliveryman,
    })
  }

  async delete(req, res) {
    const { deliverymanId } = req.params

    const deliveryman = await Deliverymen.findByPk(deliverymanId)

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' })
    }

    const deletedDeliveryman = deliveryman.destroy()

    return res.json(deletedDeliveryman)
  }
}

export default new DeliverymenController()
