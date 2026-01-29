const express = require('express');
const CartManager = require('../CartManager');

const router = express.Router();
const cartManager = new CartManager();

// POST /api/carts/ - crear nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el carrito', details: error.message });
  }
});

// GET /api/carts/:cid - obtener productos de un carrito
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getCartById(cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(cart.products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito', details: error.message });
  }
});

// POST /api/carts/:cid/product/:pid - agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.addProductToCart(cid, pid);
    if (!updatedCart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto al carrito', details: error.message });
  }
});

module.exports = router;


