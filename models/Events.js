module.exports = (sequelize, DataTypes) => {
    const Events = sequelize.define("Events", {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('open', 'closed'),
            allowNull: false
        },
    })

    return Events
}