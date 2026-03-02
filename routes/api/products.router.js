const express = require('express');
const ProductManager = require('../../managers/ProductManager');
const Product = require('../../models/product.model');

const router = express.Router();
const productManager = new ProductManager();

// GET /api/products/ - listar productos con paginación, filtros y ordenamiento
router.get('/', async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sort,
      query,
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
        // Modo simplificado: si es true/false => disponibilidad, si no => categoría
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

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const buildLink = (targetPage) => {
      if (!targetPage) return null;
      const params = new URLSearchParams();
      params.set('page', targetPage);
      if (parsedLimit) params.set('limit', parsedLimit);
      if (sort) params.set('sort', sort);
      if (query) params.set('query', query);
      return `${baseUrl}/?${params.toString()}`;
    };

    res.json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page: parsedPage,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? buildLink(prevPage) : null,
      nextLink: hasNextPage ? buildLink(nextPage) : null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'error', error: 'Error al obtener los productos', details: error.message });
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

    // Notificar a todos los clientes conectados que la lista de productos cambió
    const io = req.app.get('io');
    if (io) {
      const updatedProducts = await productManager.getProducts();
      io.emit('productsUpdated', updatedProducts);
    }

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

    const io = req.app.get('io');
    if (io) {
      const updatedProducts = await productManager.getProducts();
      io.emit('productsUpdated', updatedProducts);
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
    const io = req.app.get('io');
    if (io) {
      const updatedProducts = await productManager.getProducts();
      io.emit('productsUpdated', updatedProducts);
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto', details: error.message });
  }
});

module.exports = router;

