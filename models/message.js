'use strict'
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    'Message',
    {
      content: DataTypes.TEXT,
      UserId: DataTypes.INTEGER,
      RoomId: DataTypes.INTEGER,
      isRead: DataTypes.BOOLEAN
    },
    {}
  )
  Message.associate = function (models) {
    // associations can be defined here
    Message.belongsTo(models.User)
    Message.belongsTo(models.Room)
  }
  return Message
}
