import { Restaurant, Order, Commission } from '../models/models.js'
import { Op } from 'sequelize'

const checkRestaurantOwnership = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.restaurantId)
    if (req.user.id === restaurant.userId) {
      return next()
    }
    return res.status(403).send('Not enough privileges. This entity does not belong to you')
  } catch (err) {
    return res.status(500).send(err)
  }
}
const restaurantHasNoOrders = async (req, res, next) => {
  try {
    const numberOfRestaurantOrders = await Order.count({
      where: { restaurantId: req.params.restaurantId }
    })
    if (numberOfRestaurantOrders === 0) {
      return next()
    }
    return res.status(409).send('Some orders belong to this restaurant.')
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const isFreeCommission = async (commissionId) => {
  const commission = await Commission.findByPk(commissionId)
  return commission && commission.percentage === 0
}

const checkFreeCommissionLimitDuringCreation = async (req, res, next) => {
  return res.status(500).send("To be implemented")
}

const checkFreeCommissionLimitDuringUpdate = async (req, res, next) => {
  return res.status(500).send("To be implemented")
}

const checkNoOrdersWhenSwitchingToFree = async (req, res, next) => {
  return res.status(500).send("To be implemented")
}

export { checkRestaurantOwnership, restaurantHasNoOrders, checkFreeCommissionLimitDuringCreation, checkFreeCommissionLimitDuringUpdate, checkNoOrdersWhenSwitchingToFree }
