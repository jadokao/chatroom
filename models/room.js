'use strict'
module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define(
    'Room',
    {
      userOneId: DataTypes.INTEGER,
      userTwoId: DataTypes.INTEGER
    },
    {}
  )
  Room.associate = function (models) {
    // associations can be defined here
    Room.hasMany(models.Message)
  }
  return Room
}
