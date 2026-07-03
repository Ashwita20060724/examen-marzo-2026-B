'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Commissions', {

    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Commissions')
  }
}
