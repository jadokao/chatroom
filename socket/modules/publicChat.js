const { Room, Message, User } = require('../../models')
const messageController = require('../../controllers/messageController')

module.exports = (io, socket) => {
	// 監聽並提示有人進入公開聊天室
	socket.on('onlineHint', async user => {
		const profile = await User.findOne({
			where: { id: user.user.id },
			attributes: ['id', 'account', 'name', 'avatar', 'online']
		})
		const messages = await messageController.getPublicMessages()
		socket.emit('getChatHistory', messages)
		socket.broadcast.emit('onlineHint', profile.toJSON())

		// 將 user 登入狀態寫進 DB
		await profile.update({ online: true })
		// 再回傳正在聊天室裡的 member array
		const members = await User.findAll({
			raw: true,
			nest: true,
			where: { online: true },
			order: [['updatedAt', 'ASC']]
		})
		io.emit('onlineMember', members)
	})

	// 監聽訊息
	socket.on('getMessage', async message => {
		console.log('服務端 接收 訊息: ', message)
		Message.create({
			content: message.content,
			UserId: message.user.id,
			RoomId: 1,
			isRead: false
		}).then(message => {
			Message.findByPk(message.id, {
				include: [{ model: User, attributes: ['id', 'account', 'name', 'avatar'] }]
			}).then(message => {
				//回傳 message 給所有客戶端(包含自己)
				message['socketId'] = socket.id
				io.emit('getMessage', message)
			})
		})
	})

	//監聽並提示有人離開公開聊天室
	socket.on('offlineHint', async user => {
		const profile = await User.findOne({
			where: { id: user.user.id },
			attributes: ['id', 'account', 'name', 'avatar']
		})
		io.emit('offlineHint', profile.toJSON())
		// 將 user 登入狀態從 DB 移除
		await profile.update({ online: false })
		// 再回傳正在聊天室裡的 member array
		const members = await User.findAll({
			raw: true,
			nest: true,
			where: { online: true },
			order: [['updatedAt', 'ASC']]
		})
		io.emit('onlineMember', members)
	})
}
