const pool = require('../config/db');

async function listCategories(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, name FROM categories ORDER BY name ASC');
    res.json({ success: true, categories: rows });
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name } = req.body;
    await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ success: true, message: 'Category created' });
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
    res.json({ success: true, message: 'Category updated' });
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
