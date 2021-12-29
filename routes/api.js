const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

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
				message: '帳號不存在！'
			})
		}
		req.user = user
		return next()
	})(req, res, next)
}

const uploadImage = upload.fields([{ name: 'avatar', maxCount: 1 }])

router.get('/chatroom', (req, res) => {
	res.send('This is chatroom')
})
router.post('/signin', userController.signIn)
router.post('/signup', userController.signUp)

router.post('/users/:id/edit', userController.putUser)

router.get('/users', formatController.getUsers)
router.get('/messages', formatController.getAllMessages)
router.get('/room', formatController.getRoom)

module.exports = router
