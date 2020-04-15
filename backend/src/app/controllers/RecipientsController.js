import * as Yup from 'yup'

import Recipients from '../models/Recipients'

class RecipientsController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      num: Yup.number().required(),
      compl: Yup.string(),
      state: Yup.string().required(),
      cep: Yup.string().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    try {
      const recipient = await Recipients.create(req.body)
      return res.status(400).json(recipient)
    } catch (error) {
      return res.status(500).json(error)
    }
  }
}

export default new RecipientsController()
