'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      name: DataTypes.STRING,
      account: DataTypes.STRING,
      password: DataTypes.STRING,
      avatar: DataTypes.STRING,
      online: DataTypes.BOOLEAN
    },
    {}
  )
  User.associate = function (models) {
    // associations can be defined here
    User.hasMany(models.Message)
  }
  return User
}
