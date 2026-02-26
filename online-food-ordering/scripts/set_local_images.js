const db = require('../models');

(async function(){
  try {
    const map = {
      'BIRYANI': '/images/placeholder_biryani.svg',
      'pulao': '/images/placeholder_pulao.svg',
      'karhai': '/images/placeholder_karhai.svg',
      'Margherita Pizza': '/images/pizza.svg',
      'Veggie Burger': '/images/burger.svg',
      'Caesar Salad': '/images/salad.svg',
      'Chicken Tikka': '/images/chicken_tikka.jpg',
      'Paneer Butter Masala': '/images/pizza.svg',
      'Spicy Ramen': '/images/ramen.jpg',
      'Fish & Chips': '/images/fish_chips.jpg',
      'Chocolate Brownie': '/images/brownie.jpg'
    };

    for (const [name, path] of Object.entries(map)) {
      const item = await db.MenuItem.findOne({ where: { name } });
      if (item) {
        await item.update({ imageUrl: path });
        console.log('Updated', name, '->', path);
      }
    }

    console.log('Local image mapping complete.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
