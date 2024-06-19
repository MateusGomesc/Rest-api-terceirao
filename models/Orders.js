module.exports = (sequelize, DataTypes) => {
    const Orders = sequelize.define("Orders", {
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        proof: {
            type: DataTypes.STRING,
            allowNull: true
        },
        payMethod: {
            type: DataTypes.STRING,
            allowNull: false
        },
        terms: {
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