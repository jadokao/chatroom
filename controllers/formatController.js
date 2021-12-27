const { User, Message, Room } = require('../models')

const formatController = {
  getMessages: (req, res) => {
    return Message.findAll({
      raw: true,
      nest: true,
      where: { roomId: 1 },
      limit: 20,
      order: [['createdAt']],
      include: [{ model: User, attributes: ['id', 'account', 'name', 'avatar'] }]
    }).then(messages => {
      return messages
    })
  },

  getUsers: (req, res) => {
    return User.findAll().then(users => {
      users = users.map(user => ({
        ...user.toJSON()
      }))
      return res.json(users)
    })
  },

  getRoom: (req, res) => {
    return Room.findAll({ raw: true, nest: true }).then(rooms => {
      return res.json(rooms)
    })
  }
}

module.exports = formatController
