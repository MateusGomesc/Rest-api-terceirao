const Orders = require('./Orders')
const Products = require('./Products')

module.exports = (sequelize, DataTypes) => {
    const OrdersItems = sequelize.define("OrdersItems", {
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    })

    OrdersItems.associate = (models) => {
        models.Orders.belongsToMany(models.Products, { through: OrdersItems })
        models.Products.belongsToMany(models.Orders, { through: OrdersItems })
    }

    return OrdersItems
}