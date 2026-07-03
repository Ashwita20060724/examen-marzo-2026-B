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
  try{
    const restProp = await Restaurant.count({
      where:{
        userId: req.user.id,
        commissionId: req.body.commissionId
      }
    })
    if(restProp > 1){
      res.status(409).send('Un propietario solo puede tener 1 restaurante con comisión gratuita')
    }
  } catch(error){
    res.status(500).send(error)
  }
}

const checkFreeCommissionLimitDuringUpdate = async (req, res, next) => {
try{
  const restProp = await Restaurant.count({
    where: {
      userId: req.user.id,
      commissionId: req.body.commissionId,
      id: { [Op.ne]: req.params.restaurantId} //Besides that restaurant, the rest
    }
  })
} catch(error){
  res.status(500).send(error)
}
}

const checkNoOrdersWhenSwitchingToFree = async (req, res, next) => {
  try{
    //1. está intentando cambiar de opción?
    if(await isFreeCommission(req.body.commissionId)){
      //2. buscamos el restaurante
      const restaurante = await Restaurant.findByPk(req.params.restauratId)
      //3. el restaurante NO es gratis?
      if(await isFreeCommission(restaurante.commissionId)){
        //4. miramos cuantos pedidos lleva
        const pedidos = await Order.count({
          where:{
            restauranteId: req.params.restaurantId
          }
        })
        //5. si tiene 1 o más pedidos devuelve 409
        if(pedidos > 0){
          res.status(409).send('No se puede cambiar de plan una vez realizado un pedido')
        }
      }
    }
    next()
  } catch(error){
    res.status(500).send(error)
  }
}

export { checkRestaurantOwnership, restaurantHasNoOrders, checkFreeCommissionLimitDuringCreation, checkFreeCommissionLimitDuringUpdate, checkNoOrdersWhenSwitchingToFree }
