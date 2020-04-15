import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt'
import Mail from '../../lib/mail'

class InformationMail {
  get key() {
    return 'InformationMail'
  }

  async handle({ data }) {
    const { deliveryman, productName, date } = data

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Agendamento pronto',
      template: 'information',
      context: {
        name: deliveryman.name,
        productName,
        date: format(parseISO(date), "'dia' dd 'de' MMMM', às ' H:mm'h'", {
          locale: pt,
        }),
      },
    })
  }
}

export default new InformationMail()
