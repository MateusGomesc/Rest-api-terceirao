const { v4: uuidv4 } = require('uuid')

module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("Users", {
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        validation: {
            type: DataTypes.UUID,
            defaultValue: uuidv4,
            allowNull: true
        },
        checked: {
            type: DataTypes.DATEONLY,
            allowNull: true
        }
    })

    return Users
}