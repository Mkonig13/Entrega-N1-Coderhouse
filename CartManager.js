const fs = require('fs');
const path = require('path');

class CartManager {
  constructor(filePath = 'carts.json') {
    this.path = path.resolve(filePath);
  }

  async _readFile() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Asegurar que el directorio existe antes de crear el archivo
        const dir = path.dirname(this.path);
        await fs.promises.mkdir(dir, { recursive: true });
        await fs.promises.writeFile(this.path, JSON.stringify([], null, 2));
        return [];
      }
      throw error;
    }
  }

  async _writeFile(carts) {
    await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
  }

  async createCart() {
    const carts = await this._readFile();
    const newId =
      carts.length === 0
        ? 1
        : Math.max(...carts.map((c) => Number(c.id) || 0)) + 1;

    const newCart = {
      id: newId,
      products: [],
    };

    carts.push(newCart);
    await this._writeFile(carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this._readFile();
    return carts.find((c) => String(c.id) === String(id)) || null;
  }

  async addProductToCart(cartId, productId) {
    const carts = await this._readFile();
    const index = carts.findIndex((c) => String(c.id) === String(cartId));
    if (index === -1) return null;

    const cart = carts[index];
    const existingProduct = cart.products.find(
      (p) => String(p.product) === String(productId)
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({
        product: productId,
        quantity: 1,
      });
    }

    carts[index] = cart;
    await this._writeFile(carts);
    return cart;
  }
}

module.exports = CartManager;


