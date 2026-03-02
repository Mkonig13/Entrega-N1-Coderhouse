const express = require('express');
const CartManager = require('../../managers/CartManager');

const router = express.Router();
const cartManager = new CartManager();

// POST /api/carts/ - crear nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error al crear el carrito', details: error.message });
  }
});

// GET /api/carts/:cid - obtener carrito con productos populados
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getCartById(cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error al obtener el carrito', details: error.message });
  }
});

// POST /api/carts/:cid/products/:pid - agregar producto al carrito
router.post('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.addProductToCart(cid, pid);
    if (!updatedCart) {
      return res
        .status(404)
        .json({ error: 'Carrito o producto no encontrado' });
    }
    res.json(updatedCart);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error al agregar producto al carrito', details: error.message });
  }
});

// DELETE /api/carts/:cid/products/:pid - eliminar producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.removeProductFromCart(cid, pid);
    if (!updatedCart) {
      return res
        .status(404)
        .json({ error: 'Carrito no encontrado' });
    }
    res.json(updatedCart);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error al eliminar producto del carrito', details: error.message });
  }
});

// PUT /api/carts/:cid - reemplazar todos los productos del carrito
router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const products = Array.isArray(req.body) ? req.body : req.body.products;

    if (!products || !Array.isArray(products)) {
      return res.status(400).json({
        error:
          'Se debe enviar un arreglo de productos en el cuerpo de la petición',
      });
    }

    const updatedCart = await cartManager.updateCartProducts(cid, products);
    if (!updatedCart) {
      return res
        .status(404)
        .json({ error: 'Carrito no encontrado' });
    }
    res.json(updatedCart);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error al actualizar el carrito', details: error.message });
  }
});

// PUT /api/carts/:cid/products/:pid - actualizar cantidad de un producto
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const parsedQuantity = Number(quantity);
    if (!parsedQuantity || parsedQuantity <= 0) {
      return res
        .status(400)
        .json({ error: 'La cantidad debe ser un número mayor a 0' });
    }

    const updatedCart = await cartManager.updateProductQuantity(
      cid,
      pid,
      parsedQuantity
    );
    if (!updatedCart) {
      return res
        .status(404)
        .json({ error: 'Carrito o producto no encontrado en el carrito' });
    }
    res.json(updatedCart);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error al actualizar la cantidad', details: error.message });
  }
});

// DELETE /api/carts/:cid - eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const updatedCart = await cartManager.clearCart(cid);
    if (!updatedCart) {
      return res
        .status(404)
        .json({ error: 'Carrito no encontrado' });
    }
    res.json(updatedCart);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Error al vaciar el carrito', details: error.message });
  }
});

module.exports = router;

