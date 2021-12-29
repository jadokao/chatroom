const { User, Message } = require('../models')

const messageController = {
	getPublicMessages: (req, res) => {
		return Message.findAll({
			raw: true,
			nest: true,
			where: { RoomId: 1 },
			limit: 20,
			order: [['createdAt']],
			include: [{ model: User, attributes: ['id', 'account', 'name', 'avatar'] }]
		}).then(messages => {
			return messages
		})
	},

	getPrivateMessages: (req, res) => {
		return Message.findAll({
			raw: true,
			nest: true,
			where: { RoomId: room },
			limit: 20,
			order: [['createdAt']],
			include: [{ model: User, attributes: ['id', 'account', 'name', 'avatar'] }]
		}).then(messages => {
			return messages
		})
	}
}

module.exports = messageController
