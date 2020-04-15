import Sequelize from 'sequelize'
import databaseConfig from '../config/database'
import User from '../app/models/User'
import Recipients from '../app/models/Recipients'
import Deliverymen from '../app/models/Deliverymen'
import File from '../app/models/File'
import Delivery from '../app/models/Delivery'
import DeliveryProblems from '../app/models/DeliveryProblems'

const models = [User, Recipients, File, Deliverymen, Delivery, DeliveryProblems]

class Database {
  constructor() {
    this.init()
  }

  async init() {
    this.connection = new Sequelize(databaseConfig)
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models))
  }
}

export default new Database()
