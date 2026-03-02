const express = require('express');
const ProductManager = require('../managers/ProductManager');
const Product = require('../models/product.model');
const CartManager = require('../managers/CartManager');

const router = express.Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

// Vista principal con paginación (misma UX que /products)
router.get('/', async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sort,
      query,
      cid,
    } = req.query;

    const parsedLimit = Number(limit) > 0 ? Number(limit) : 10;
    const parsedPage = Number(page) > 0 ? Number(page) : 1;

    const filter = {};
    if (query) {
      const [field, rawValue] = String(query).split(':');
      if (field && rawValue) {
        if (field === 'category') {
          filter.category = rawValue;
        } else if (field === 'status') {
          if (rawValue === 'true' || rawValue === 'false') {
            filter.status = rawValue === 'true';
          }
        }
      } else {
        if (query === 'true' || query === 'false') {
          filter.status = query === 'true';
        } else {
          filter.category = query;
        }
      }
    }

    const sortOption = {};
    if (sort === 'asc') {
      sortOption.price = 1;
    } else if (sort === 'desc') {
      sortOption.price = -1;
    }

    const skip = (parsedPage - 1) * parsedLimit;

    const [products, totalDocs] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(totalDocs / parsedLimit), 1);
    const hasPrevPage = parsedPage > 1;
    const hasNextPage = parsedPage < totalPages;
    const prevPage = hasPrevPage ? parsedPage - 1 : null;
    const nextPage = hasNextPage ? parsedPage + 1 : null;

    const basePath = '/';
    const buildLink = (targetPage) => {
      if (!targetPage) return null;
      const params = new URLSearchParams();
      params.set('page', targetPage);
      if (parsedLimit) params.set('limit', parsedLimit);
      if (sort) params.set('sort', sort);
      if (query) params.set('query', query);
      if (cid) params.set('cid', cid);
      return `${basePath}?${params.toString()}`;
    };

    res.render('home', {
      products,
      page: parsedPage,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
      prevLink: hasPrevPage ? buildLink(prevPage) : null,
      nextLink: hasNextPage ? buildLink(nextPage) : null,
      query,
      sort,
      limit: parsedLimit,
      cartId: cid || null,
    });
  } catch (error) {
    res.status(500).send('Error al cargar la vista de productos con paginación');
  }
});

// Vista de productos con paginación en /products (alias opcional)
router.get('/products', async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sort,
      query,
      cid,
    } = req.query;

    const parsedLimit = Number(limit) > 0 ? Number(limit) : 10;
    const parsedPage = Number(page) > 0 ? Number(page) : 1;

    const filter = {};
    if (query) {
      const [field, rawValue] = String(query).split(':');
      if (field && rawValue) {
        if (field === 'category') {
          filter.category = rawValue;
        } else if (field === 'status') {
          if (rawValue === 'true' || rawValue === 'false') {
            filter.status = rawValue === 'true';
          }
        }
      } else {
        if (query === 'true' || query === 'false') {
          filter.status = query === 'true';
        } else {
          filter.category = query;
        }
      }
    }

    const sortOption = {};
    if (sort === 'asc') {
      sortOption.price = 1;
    } else if (sort === 'desc') {
      sortOption.price = -1;
    }

    const skip = (parsedPage - 1) * parsedLimit;

    const [products, totalDocs] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(totalDocs / parsedLimit), 1);
    const hasPrevPage = parsedPage > 1;
    const hasNextPage = parsedPage < totalPages;
    const prevPage = hasPrevPage ? parsedPage - 1 : null;
    const nextPage = hasNextPage ? parsedPage + 1 : null;

    const basePath = '/products';
    const buildLink = (targetPage) => {
      if (!targetPage) return null;
      const params = new URLSearchParams();
      params.set('page', targetPage);
      if (parsedLimit) params.set('limit', parsedLimit);
      if (sort) params.set('sort', sort);
      if (query) params.set('query', query);
      if (cid) params.set('cid', cid);
      return `${basePath}?${params.toString()}`;
    };

    res.render('products', {
      products,
      page: parsedPage,
      totalPages,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
      prevLink: hasPrevPage ? buildLink(prevPage) : null,
      nextLink: hasNextPage ? buildLink(nextPage) : null,
      query,
      sort,
      limit: parsedLimit,
      cartId: cid || null,
    });
  } catch (error) {
    res.status(500).send('Error al cargar la vista de productos con paginación');
  }
});

// Vista detalle de producto
router.get('/products/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const { cid } = req.query;
    const product = await productManager.getProductById(pid);
    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }
    res.render('productDetail', { product, cartId: cid || null });
  } catch (error) {
    res.status(500).send('Error al cargar el detalle del producto');
  }
});

// Vista de carrito específico
router.get('/carts/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getCartById(cid);
    if (!cart) {
      return res.status(404).send('Carrito no encontrado');
    }
    res.render('cart', { cart });
  } catch (error) {
    res.status(500).send('Error al cargar la vista del carrito');
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


