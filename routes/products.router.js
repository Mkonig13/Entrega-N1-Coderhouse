const express = require('express');
const ProductManager = require('../ProductManager');

const router = express.Router();
const productManager = new ProductManager();

// GET /api/products/ - listar todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los productos', details: error.message });
  }
});

// GET /api/products/:pid - obtener producto por id
router.get('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productManager.getProductById(pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto', details: error.message });
  }
});

// POST /api/products/ - crear producto
router.post('/', async (req, res) => {
  try {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;

    // Validación básica
    if (!title || !description || !code || price == null || stock == null || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const newProduct = await productManager.addProduct({
      title,
      description,
      code,
      price,
      status: status !== undefined ? status : true,
      stock,
      category,
      thumbnails: Array.isArray(thumbnails) ? thumbnails : [],
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el producto', details: error.message });
  }
});

// PUT /api/products/:pid - actualizar producto
router.put('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const updates = { ...req.body };

    const updatedProduct = await productManager.updateProduct(pid, updates);
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto', details: error.message });
  }
});

// DELETE /api/products/:pid - eliminar producto
router.delete('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const deleted = await productManager.deleteProduct(pid);
    if (!deleted) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto', details: error.message });
  }
});

module.exports = router;


