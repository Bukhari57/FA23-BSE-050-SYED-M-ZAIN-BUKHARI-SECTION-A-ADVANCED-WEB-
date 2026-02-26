const db = require('../models');
(async function(){
  try {
    const MenuItem = db.MenuItem;
    const Order = db.Order;

    const items = await MenuItem.findAll({ order: [['id','ASC']] });
    console.log('\n=== MenuItems ===');
    if (items.length === 0) console.log('No menu items found.');
    items.forEach(i => console.log(i.toJSON()));

    const orders = await Order.findAll({ order: [['id','ASC']] });
    console.log('\n=== Orders ===');
    if (orders.length === 0) console.log('No orders found.');
    orders.forEach(o => console.log(o.toJSON()));

    process.exit(0);
  } catch (err) {
    console.error('Error querying DB:', err);
    process.exit(1);
  }
})();
