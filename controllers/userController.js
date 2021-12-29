const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')

const { User } = require('../models')

const userController = {
	signUp: (req, res) => {
		// 確認輸入的密碼
		if (req.body.checkPassword !== req.body.password) {
			return res.json({ status: 'error', message: '兩次密碼輸入不同！' })
		}

		return User.findOne({ where: { account: req.body.account } }).then(user => {
			if (!user) {
				return User.create({
					account: req.body.account,
					name: req.body.name,
					password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
				})
					.then(user => {
						return res.json({ status: 'success', message: '成功註冊帳號！' })
					})
					.catch(err => console.log(err))
			}
			return res.json({ status: 'error', message: 'account 已重覆註冊！' })
		})
	},

	signIn: (req, res) => {
		// 檢查必要資料
		if (!req.body.account || !req.body.password) {
			return res.json({ status: 'error', message: '所有欄位皆為必填！' })
		}

		// 檢查 user 是否存在與密碼是否正確
		const account = req.body.account
		const password = req.body.password

		User.findOne({ where: { account: account } }).then(async user => {
			if (!user) return res.json({ status: 'error', message: '帳號不存在或密碼錯誤！' })
			if (user.role === 'admin') return res.json({ status: 'error', message: '此帳號無法登入' })
			if (!bcrypt.compareSync(password, user.password)) {
				return res.json({ status: 'error', message: '帳號不存在或密碼錯誤！' })
			}
			// 簽發 token
			const payload = { id: user.id }
			const token = await jwt.sign(payload, process.env.JWT_SECRET)
			return res.json({
				status: 'success',
				message: '登入成功！',
				token: token,
				user: {
					id: user.id,
					account: user.account,
					name: user.name
				}
			})
		})
	},

	putUser: async (req, res) => {
		try {
			console.log(req.user)
			if (Number(req.params.id) !== Number(helpers.getUser(req).id)) {
				return res.json({ status: 'error', message: '沒有編輯權限！' })
			}

			// 提取request.body
			const { account, name, avatar, password, checkPassword } = req.body
			const { files } = req

			// input驗證
			if (account !== helpers.getUser(req).account) {
				const existUser = await User.findOne({
					where: { account },
					raw: true
				})
				if (existUser) return res.json({ status: 'error', message: 'account 已重覆註冊！' })
			}
			if (password !== checkPassword) {
				return res.json({ status: 'error', message: '兩次密碼輸入不同！' })
			}

			const user = await User.findByPk(req.params.id)

			// whether files and whether password
			if (!files && !password) {
				await user.update({
					name,
					account,
					avatar,
					password
				})
				return res.json({ status: 'success', message: '使用者資料編輯成功！(沒傳圖 + 沒改密碼）' })
			} else if (!files && password) {
				await user.update({
					name,
					account,
					avatar,
					password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
				})
				return res.json({ status: 'success', message: '使用者資料編輯成功！(沒傳圖 + 有改密碼）' })
			} else if (!password) {
				imgur.setClientID(IMGUR_CLIENT_ID)
				const uploadImg = file => {
					return new Promise((resolve, reject) => {
						imgur.upload(file, (err, res) => {
							resolve(res.data.link)
						})
					})
				}

				const newAvatar = files.avatar ? await uploadImg(files.avatar[0].path) : user.avatar

				await user.update({
					name,
					account,
					avatar: newAvatar,
					password
				})
				return res.json({ status: 'success', message: '使用者資料編輯成功！(有傳圖 + 沒改密碼）' })
			} else {
				imgur.setClientID(IMGUR_CLIENT_ID)
				const uploadImg = file => {
					return new Promise((resolve, reject) => {
						imgur.upload(file, (err, res) => {
							resolve(res.data.link)
						})
					})
				}

				const newAvatar = files.avatar ? await uploadImg(files.avatar[0].path) : user.avatar

				await user.update({
					name,
					account,
					avatar: newAvatar,
					password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
				})
				return res.json({ status: 'success', message: '使用者資料編輯成功！(有傳圖 + 有改密碼）' })
			}
		} catch (err) {
			console.log(err)
			return res.json({ status: 'error', message: '編輯未成功！' })
		}
	}
}

module.exports = userController
