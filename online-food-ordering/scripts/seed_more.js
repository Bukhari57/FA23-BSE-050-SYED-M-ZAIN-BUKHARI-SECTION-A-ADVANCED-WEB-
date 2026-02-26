const db = require('../models');

(async function(){
  try {
    const itemsToAdd = [
      { name: 'Chicken Tikka', description: 'Spiced grilled chicken', price: 9.99, imageUrl: 'https://images.unsplash.com/photo-1604908177522-93aa7d5b5b97?q=80&w=800&auto=format&fit=crop&crop=faces', category: 'Chicken', iconClass: 'fas fa-drumstick-bite' },
      { name: 'Paneer Butter Masala', description: 'Creamy tomato curry', price: 8.49, imageUrl: 'https://images.unsplash.com/photo-1604908177522-93aa7d5b5b97?q=80&w=800&auto=format&fit=crop&crop=faces', category: 'Vegetarian', iconClass: 'fas fa-cheese' },
      { name: 'Spicy Ramen', description: 'Noodles in spicy broth', price: 7.5, imageUrl: 'https://images.unsplash.com/photo-1547592166-14da0ec0d7d5?q=80&w=800&auto=format&fit=crop&crop=faces', category: 'Noodles', iconClass: 'fas fa-bowl-rice' },
      { name: 'Fish & Chips', description: 'Crispy fried fish', price: 10.0, imageUrl: 'https://images.unsplash.com/photo-1606756793230-6e7a3b6e1c8f?q=80&w=800&auto=format&fit=crop&crop=faces', category: 'Seafood', iconClass: 'fas fa-fish' },
      { name: 'Chocolate Brownie', description: 'Rich fudgy brownie', price: 4.25, imageUrl: 'https://images.unsplash.com/photo-1599785209707-9b0c1f7d7f5b?q=80&w=800&auto=format&fit=crop&crop=faces', category: 'Dessert', iconClass: 'fas fa-birthday-cake' }
    ];

    for (const it of itemsToAdd) {
      const [item, created] = await db.MenuItem.findOrCreate({ where: { name: it.name }, defaults: it });
      if (created) console.log('Inserted', it.name);
      else console.log('Exists:', it.name);
    }

    // update items with missing images/icons using a default placeholder
    const all = await db.MenuItem.findAll();
    for (const i of all) {
      let changed = false;
      const updates = {};
      if (!i.imageUrl) { updates.imageUrl = `https://via.placeholder.com/600x400?text=${encodeURIComponent(i.name)}`; changed = true; }
      if (!i.iconClass) { updates.iconClass = 'fas fa-utensils'; changed = true; }
      if (!i.category) { updates.category = 'General'; changed = true; }
      if (changed) {
        await i.update(updates);
        console.log('Updated visuals for', i.name);
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
