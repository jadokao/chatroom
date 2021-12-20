const { User, Message } = require('../models')

const messageController = {
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
  }
}

module.exports = messageController
