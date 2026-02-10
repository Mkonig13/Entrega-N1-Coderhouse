const express = require('express');
const ProductManager = require('../managers/ProductManager');

const router = express.Router();
const productManager = new ProductManager();

// Vista principal: lista de productos vía HTTP (sin tiempo real)
router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('home', { products });
  } catch (error) {
    res.status(500).send('Error al cargar la vista de productos');
  }
});

// Vista en tiempo real: lista que se actualiza con websockets
router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('realTimeProducts', { products });
  } catch (error) {
    res.status(500).send('Error al cargar la vista en tiempo real');
  }
});

module.exports = router;

