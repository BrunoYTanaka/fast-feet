import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt'
import Mail from '../../lib/mail'

class CancellationMail {
  get key() {
    return 'CancellationMail'
  }

  async handle({ data }) {
    const { deliveryman, recipient, product, date } = data

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Entrega cancelada',
      template: 'cancellation',
      context: {
        deliveryman: deliveryman.name,
        product,
        user: recipient.name,
        date: format(parseISO(date), "'dia' dd 'de' MMMM', às ' H:mm'h'", {
          locale: pt,
        }),
      },
    })
  }
}

export default new CancellationMail()
