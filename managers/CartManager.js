const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

class CartManager {
  async createCart() {
    const newCart = await Cart.create({ products: [] });
    return newCart.toObject();
  }

  async getCartById(id) {
    const cart = await Cart.findById(id).populate('products.product').lean();
    return cart || null;
  }

  async addProductToCart(cartId, productId) {
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return null;
    }

    const cart = await Cart.findById(cartId);
    if (!cart) return null;

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

    await cart.save();
    await cart.populate('products.product');
    return cart.toObject();
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    cart.products = cart.products.filter(
      (p) => String(p.product) !== String(productId)
    );

    if (cart.products.length === 0) {
      await Cart.findByIdAndDelete(cartId);
      return { deleted: true, products: [] };
    }

    await cart.save();
    await cart.populate('products.product');
    return cart.toObject();
  }

  async updateCartProducts(cartId, products) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    cart.products = products.map((p) => ({
      product: p.product,
      quantity: p.quantity || 1,
    }));

    await cart.save();
    await cart.populate('products.product');
    return cart.toObject();
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const item = cart.products.find(
      (p) => String(p.product) === String(productId)
    );
    if (!item) return null;

    item.quantity = quantity;

    await cart.save();
    await cart.populate('products.product');
    return cart.toObject();
  }

  async clearCart(cartId) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;
    await Cart.findByIdAndDelete(cartId);
    return { deleted: true, products: [] };
  }
}

module.exports = CartManager;

