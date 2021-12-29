const { User, Message, Room } = require('../models')

const formatController = {
	getUsers: (req, res) => {
		return User.findAll().then(users => {
			users = users.map(user => ({
				...user.toJSON(),
			}))
			return res.json(users)
		})
	},

	getRoom: (req, res) => {
		return Room.findAll({ raw: true, nest: true }).then(rooms => {
			return res.json(rooms)
		})
	},

	getAllMessages: (req, res) => {
		return Message.findAll({
			raw: true,
			nest: true,
			include: [{ model: User, attributes: ['id', 'account', 'name', 'avatar'] }],
		}).then(messages => {
			return res.json(messages)
		})
	},
}

module.exports = formatController
