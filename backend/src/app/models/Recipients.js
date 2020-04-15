import Sequelize, { Model } from 'sequelize'

class Recipients extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        street: Sequelize.STRING,
        num: Sequelize.INTEGER,
        compl: Sequelize.STRING,
        state: Sequelize.STRING,
        cep: Sequelize.STRING,
      },
      {
        sequelize,
      }
    )
    return this
  }
}

export default Recipients
