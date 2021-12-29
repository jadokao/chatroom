const passport = require('../config/passport')
const formatController = require('../controllers/formatController')
const userController = require('../controllers/userController')

// 驗證user
function authenticated (req, res, next) {
	passport.authenticate('jwt', { session: false }, (err, user, info) => {
		if (err) next(err)
		if (!user) {
			return res.json({
				status: 'error',
				message: '帳號不存在！',
			})
		}
		req.user = user
		return next()
	})(req, res, next)
}

module.exports = app => {
	app.get('/chatroom', (req, res) => {
		res.send('This is chatroom')
	})
	app.post('/signin', userController.signIn)
	app.post('/signup', userController.signUp)

	app.get('/users', formatController.getUsers)
	app.get('/messages', formatController.getAllMessages)
	app.get('/room', formatController.getRoom)
}
