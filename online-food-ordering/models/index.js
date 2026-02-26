const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.MenuItem = require('./menuitem')(sequelize, Sequelize);
db.Order = require('./order')(sequelize, Sequelize);

// Orders store item arrays in JSON; no direct FK associations required

module.exports = db;