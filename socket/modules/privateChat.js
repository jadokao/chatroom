const { Message, User, Room } = require('../../models')
const messageController = require('../../controllers/messageController')

module.exports = (io, socket) => {
	// 維持進入私人聊天是的狀態
	socket.adapter.on('join-room', (room, id) => {
		console.log(`socket ${id} has joined room ${room}`)
	})

	// 監聽並提示有人進入私人聊天室
	socket.on('enterRoom', async user => {
		// 開啟對話訊息之對象
		const profile = await User.findOne({
			raw: true,
			nest: true,
			where: { id: user.user2.id },
			attributes: ['id', 'account', 'name', 'avatar']
		})

		const roomInfo = await Room.findOrCreate({
			raw: true,
			nest: true,
			where: { userOneId: user.user1.id, userTwoId: user.user2.id }
		})
		const room = roomInfo[0].id

		const messages = await messageController.getPrivateMessages(room)
		socket.to(room).emit('getChatHistory', messages)
		socket.to(room).emit('enterRoom', profile)
	})

	// 監聽訊息
	socket.on('privateMessage', async message => {
		console.log('服務端 接收 訊息: ', message)
		const roomInfo = await Room.findOrCreate({
			raw: true,
			nest: true,
			where: { userOneId: message.user1.id, userTwoId: message.user2.id }
		})
		const room = roomInfo[0].id

		Message.create({
			content: message.content,
			UserId: message.user1.id,
			RoomId: room,
			isRead: false
		}).then(message => {
			Message.findByPk(message.id, {
				raw: true,
				nest: true,
				include: [{ model: User, attributes: ['id', 'account', 'name', 'avatar'] }]
			}).then(message => {
				//回傳 message 給所有客戶端(包含自己)
				message['socketId'] = socket.id
				io.to(room).emit('privateMessage', message)
			})
		})
	})

	// 監聽並提示有人離開私人聊天室
	socket.on('leaveRoom', async user => {
		const profile = await User.findOne({
			raw: true,
			nest: true,
			where: { id: user.user2.id },
			attributes: ['id', 'account', 'name', 'avatar']
		})
		const roomInfo = await Room.findOrCreate({
			raw: true,
			nest: true,
			where: { userOneId: user.user1.id, userTwoId: user.user2.id }
		})
		const room = roomInfo[0].id
		io.to(room).emit('leaveRoom', profile)
	})
}
