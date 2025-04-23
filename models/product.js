"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Category, { foreignKey: "categoryId" });
      this.belongsTo(models.User, { foreignKey: "created_by" });
      this.belongsTo(models.User, { foreignKey: "updated_by" });
      this.belongsTo(models.User, { foreignKey: "deleted_by" });
    }
  }
  Product.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      image: DataTypes.STRING,
      price: DataTypes.FLOAT,
      uniqueId: DataTypes.STRING,
      categoryId: DataTypes.UUID,
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_by: DataTypes.INTEGER,
      updated_by: DataTypes.INTEGER,
      deleted_by: DataTypes.INTEGER,
    },
    {
      sequelize,
      timestamps: false,
      modelName: "Product",
    }
  );
  return Product;
};
