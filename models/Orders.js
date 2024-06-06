module.exports = (sequelize, DataTypes) => {
    const Orders = sequelize.define("Orders", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        proof: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })

    Orders.associate = (models) => {
        Orders.belongsTo(models.Events, {
            constraint: true,
            foreignKey: 'eventId',
            onDelete: 'CASCADE'
        })

        Orders.belongsTo(models.Users, {
            constraint: true,
            foreignKey: 'userId',
            onDelete: 'CASCADE'
        })
    }

    return Orders
}