const passport = require('passport')
const jwt = require('jsonwebtoken')
const publicChat = require('./modules/publicChat')
const privateChat = require('./modules/privateChat')

module.exports = server => {
  const io = require('socket.io')(server, {
    cors: {
      origin: true,
      credentials: true,
      transports: ['websocket', 'polling'],
      allowedHeaders: [
        'Access-Control-Allow-Headers',
        'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json'
      ]
    },
    allowEIO3: true
  })

  io.use((socket, next) => {
    if (socket.handshake.headers.authorization) {
      jwt.verify(
        //jsonwebtoken用看是否有被串改的method
        socket.handshake.headers.authorization, // 包在query 禮也可以在這看到socket.handshake.query
        process.env.JWT_SECRET, //這是妳簽章的secret
        async (err, decoded) => {
          //認證失敗
          if (err) {
            return next(new Error('Authentication error'))
          }
          //認證成功
          socket.decoded = decoded // 把解出來資訊做利用, {id: n, iat: m}
          return next()
        }
      )
    }
  })

  // 連線瀏覽器即產生 socket id
  io.on('connection', socket => {
    console.log(`user connected, id: ${socket.id}`)
    console.log('connecting users: ', io.of('/').sockets.size)

    socket.onAny((event, ...args) => {
      console.log(event, args)
    })

    publicChat(io, socket)
    privateChat(io, socket)

    // 關閉瀏覽器後才算離開 socket
    socket.on('disconnect', () => {
      console.log(`user disconnected, id: ${socket.id}`)
    })
  })
}
