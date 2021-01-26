'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserRoute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UserRoute.init({
    user: DataTypes.STRING,
    routeid: DataTypes.INTEGER,
    prevoz: DataTypes.STRING,
    startlon: DataTypes.DOUBLE,
    startlat: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'UserRoute',
  });
  return UserRoute;
};