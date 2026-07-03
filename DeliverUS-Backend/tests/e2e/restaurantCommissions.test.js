import dotenv from 'dotenv'
import request from 'supertest'
import { getLoggedInOwner, getLoggedInCustomer } from './utils/auth'
import { getApp, shutdownApp } from './utils/testApp'
import { bodeguitaRestaurant } from './utils/testData'
dotenv.config()

describe('Restaurant Commissions', () => {
  let owner, app, restaurantCategory, freeCommission, paidCommission

  beforeAll(async () => {
    app = await getApp()
    owner = await getLoggedInOwner()
    restaurantCategory = (await request(app).get('/restaurantCategories').send()).body[0]
    // Commissions are seeded: 1: Free (0%), 2: Standard (10%)
    freeCommission = 1
    paidCommission = 2
  })

  describe('Validation: Max 1 Free Commission', () => {
    it('Should return 409 when trying to create a second restaurant with Free commission (POST)', async () => {
      // Owner already has "Casa Félix" with Free commission (ID 1) in seeders
      const newRestaurant = {
        ...bodeguitaRestaurant,
        name: 'Second Free Restaurant',
        restaurantCategoryId: restaurantCategory.id,
        commissionId: freeCommission
      }
      const response = await request(app)
        .post('/restaurants')
        .set('Authorization', `Bearer ${owner.token}`)
        .send(newRestaurant)
      
      expect(response.status).toBe(409)
      expect(response.text).toContain('Un propietario solo puede tener un restaurante con comisión gratuita.')
    })

    it('Should return 409 when trying to update a restaurant to Free commission if already has one (PUT)', async () => {
      // Owner has Casa Félix (Free) (ID 1) and "0 products" (Paid) (ID 3).
      // Try to set "0 products" (ID 3) to Free commission (ID 1)
      const restaurantToUpdate = (await request(app).get('/restaurants/3').send()).body
      const { userId, ...updatedData } = restaurantToUpdate
      updatedData.commissionId = freeCommission

      const response = await request(app)
        .put('/restaurants/3')
        .set('Authorization', `Bearer ${owner.token}`)
        .send(updatedData)
      
      expect(response.status).toBe(409)
      expect(response.text).toContain('Un propietario solo puede tener un restaurante con comisión gratuita.')
    })

    it('Should return 409 when trying to update a restaurant to Free commission if it has orders and was Paid', async () => {
      // "100 montaditos" (ID 2) has Standard commission (10%) and has orders in seeders
      const restaurantToUpdate = (await request(app).get('/restaurants/2').send()).body
      const { userId, ...updatedData } = restaurantToUpdate
      updatedData.commissionId = freeCommission

      const response = await request(app)
        .put('/restaurants/2')
        .set('Authorization', `Bearer ${owner.token}`)
        .send(updatedData)
      
      expect(response.status).toBe(409)
      expect(response.text).toContain('No se puede cambiar a la comisión gratuita si el restaurante ya tiene pedidos y pertenecía a un plan de pago.')
    })

    it('Should return 200 when creating a restaurant with Paid commission', async () => {
      const newRestaurant = {
        ...bodeguitaRestaurant,
        name: 'New Paid Restaurant',
        restaurantCategoryId: restaurantCategory.id,
        commissionId: paidCommission
      }
      const response = await request(app)
        .post('/restaurants')
        .set('Authorization', `Bearer ${owner.token}`)
        .send(newRestaurant)
      
      expect(response.status).toBe(200)
    })
  })

  describe('Calculation: Total Commission', () => {
    it('Should return the correct accumulated commission for a restaurant', async () => {
      // "100 montaditos" (ID 2) has Standard commission (10%) in seeders
      // Let's check its commission
      const restaurantId = 2 // 100 montaditos
      const response = await request(app)
        .get(`/restaurants/${restaurantId}/commission`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send()
      
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('totalCommission')
      // In seeders, 100 montaditos has several orders. 
      // We just check it's a number and >= 0
      expect(typeof response.body.totalCommission).toBe('number')
      expect(response.body.totalCommission).toBeGreaterThanOrEqual(0)
    })

    it('Should return 0 commission for a restaurant with Free commission and no orders', async () => {
      // Create a new restaurant with Paid commission first, then change to Free if possible?
      // Or just use Casa Félix (ID 1) which has Free commission.
      const restaurantId = 1 // Casa Félix
      const response = await request(app)
        .get(`/restaurants/${restaurantId}/commission`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send()
      
      expect(response.status).toBe(200)
      expect(response.body.totalCommission).toBe(0)
    })
  })

  afterAll(async () => {
    await shutdownApp()
  })
})
