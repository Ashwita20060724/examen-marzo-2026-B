'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Commissions', [
      {
        name: 'Free',
        percentage: 0.0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Standard',
        percentage: 10.0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Commissions', null, {})
  }
}
