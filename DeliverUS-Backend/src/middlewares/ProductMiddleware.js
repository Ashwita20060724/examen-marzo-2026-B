import { Order, Product, Restaurant } from '../models/models.js'
const checkProductOwnership = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId, { include: { model: Restaurant, as: 'restaurant' } })
    if (req.user.id === product.restaurant.userId) {
      return next()
    } else {
      return res.status(403).send('Not enough privileges. This entity does not belong to you')
    }
  } catch (err) {
    return res.status(500).send(err)
  }
}
const checkProductRestaurantOwnership = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByPk(req.body.restaurantId)
    if (req.user.id === restaurant.userId) {
      return next()
    } else {
      return res.status(403).send('Not enough privileges. This entity does not belong to you')
    }
  } catch (err) {
    return res.status(500).send(err)
  }
}

const checkProductHasNotBeenOrdered = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId, { include: { model: Order, as: 'orders' } })
    if (product.orders.length === 0) {
      return next()
    } else {
      return res.status(409).send('This product has already been ordered')
    }
  } catch (err) {
    return res.status(500).send(err.message)
  }
}

const checkStartProductLimit = async(req, res, next) => {
  try{
    const restaurante = await Restaurant.findByPk(req.body.restaurantId)
    if(await isFreeCommission(restaurante.commissionId)){
      res.status(409).send('No puede haber más de un producto estrella')
    }
    if(req.body.isStarProduct) {
      const condiciones = {
        restauranteId: req.body.restaurantId,
        isStarProduct: true
      }
      if(req.params.productId){
        condiciones.id = {[Op.ne]: req.params.productId}
      }
      const platosEstrella = await Product.count({where: condiciones})
      if(platosEstrella > 1) {
        res.status(409).send('No puede haber más de un producto estrella')
      }
    }
    next()
  } catch(error){
    res.status(500).send(error)
  }
}

export { checkProductOwnership, checkProductRestaurantOwnership, checkProductHasNotBeenOrdered,
  checkStartProductLimit
 }
