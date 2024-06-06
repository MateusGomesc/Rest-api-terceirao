module.exports = (sequelize, DataTypes) => {
    const Products = sequelize.define("Products", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    })

    Products.associate = (models) => {
        Products.belongsTo(models.Events, {
            constraint: true,
            foreignKey: 'EventId',
            onDelete: 'CASCADE'
        })
    }

    return Products
}