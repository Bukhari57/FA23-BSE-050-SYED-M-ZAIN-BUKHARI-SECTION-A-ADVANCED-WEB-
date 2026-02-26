module.exports = (sequelize, DataTypes) => {
    const MenuItem = sequelize.define('MenuItem', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.STRING,
        category: DataTypes.STRING,
        iconClass: DataTypes.STRING,
        imageUrl: DataTypes.STRING,
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        }
    });
    return MenuItem;
};