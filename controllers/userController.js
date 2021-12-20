const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const sequelize = require('sequelize')

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

  putUser: async (req, res, callback) => {
    try {
      if (Number(req.params.id) !== Number(helpers.getUser(req).id)) {
        return callback({ status: 'error', message: '沒有編輯權限！' })
      }

      const { name, introduction, avatar, cover } = req.body
      const { files } = req

      const user = await User.findByPk(req.params.id)
      // 如果user要把cover給刪掉，前端會回傳cover: delete
      if (cover === 'delete') {
        user.cover = 'https://i.imgur.com/Qqb0a7S.png'
      }

      if (!files) {
        await user.update({
          name,
          introduction,
          avatar,
          cover: user.cover
        })
        return callback({ status: 'success', message: '使用者資料編輯成功！(沒傳圖）' })
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
        const newCover = files.cover ? await uploadImg(files.cover[0].path) : user.cover

        await user.update({
          name,
          introduction,
          avatar: newAvatar,
          cover: newCover
        })
        return callback({ status: 'success', message: '使用者資料編輯成功！(有傳圖）' })
      }
    } catch (err) {
      return callback({ status: 'error', message: '編輯未成功！' })
    }
  },

  putUserSetting: async (req, res, callback) => {
    try {
      const { name, account, email, password, checkPassword } = req.body
      if (Number(req.params.id) !== Number(helpers.getUser(req).id)) {
        return callback({ status: 'error', message: '沒有編輯權限！' })
      }

      if (account !== helpers.getUser(req).account) {
        const existUser = await User.findOne({
          where: { account },
          raw: true
        })
        if (existUser) return callback({ status: 'error', message: 'account 已重覆註冊！' })
      }

      if (email !== helpers.getUser(req).email) {
        const existUser = await User.findOne({
          where: { email },
          raw: true
        })
        if (existUser) return callback({ status: 'error', message: 'email 已重覆註冊！' })
      }

      if (password !== checkPassword) {
        return callback({ status: 'error', message: '兩次密碼輸入不同！' })
      }

      const user = await User.findByPk(req.params.id)
      await user.update({
        name,
        account,
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
      })

      return callback({ status: 'success', message: '使用者資料編輯成功！' })
    } catch (err) {
      console.log(err)
      return callback({ status: 'error', message: '編輯未成功！' })
    }
  }
}

module.exports = userController
