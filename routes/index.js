module.exports = app => {
  app.get('/chatroom', (req, res) => {
    res.send('This is chatroom')
  })
}
