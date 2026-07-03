import { Model } from 'sequelize'

const loadModel = (sequelize, DataTypes) => {
  class Commission extends Model {
    static associate(models) {
    }
  }
  Commission.init({

  }, {
    sequelize,
    modelName: 'Commission'
  })
  return Commission
}
export default loadModel
