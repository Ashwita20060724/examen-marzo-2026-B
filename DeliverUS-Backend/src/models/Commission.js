import { Model } from 'sequelize'

const loadModel = (sequelize, DataTypes) => {
  class Commission extends Model {
    static associate(models) {
      Commission.hasMany(models.Restaurant, {foreignKey: 'commissionId', as: 'restaurants'})
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
