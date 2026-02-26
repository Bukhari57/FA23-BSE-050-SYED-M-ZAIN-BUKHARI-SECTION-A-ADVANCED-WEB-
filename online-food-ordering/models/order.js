module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        customerName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        items: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: []
        },
        totalPrice: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        status: {
            type: DataTypes.ENUM('Pending','Preparing','Completed','Cancelled'),
            allowNull: false,
            defaultValue: 'Pending'
        }
    });
    return Order;
};