'use strict'

const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Messages',
      Array.from({ length: 50 }).map((d, i) => ({
        id: i + 1,
        content: faker.lorem.text(),
        UserId: Math.floor(Math.random() * 9) + 1,
        RoomId: Math.floor(Math.random() * 3) + 1,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      {}
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Messages', null, {})
  }
}
