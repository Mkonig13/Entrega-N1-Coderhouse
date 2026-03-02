const Product = require('../models/product.model');

class ProductManager {
  async getProducts() {
    const products = await Product.find().lean();
    return products;
  }

  async getProductById(id) {
    const product = await Product.findById(id).lean();
    return product || null;
  }

  async addProduct(productData) {
    const newProduct = await Product.create({
      title: '',
      description: '',
      code: '',
      price: 0,
      status: true,
      stock: 0,
      category: '',
      thumbnails: [],
      ...productData,
    });
    return newProduct.toObject();
  }

  async updateProduct(id, updates) {
    const { id: _ignoreId, ...restUpdates } = updates;
    const updated = await Product.findByIdAndUpdate(id, restUpdates, {
      new: true,
      runValidators: true,
    }).lean();
    return updated || null;
  }

  async deleteProduct(id) {
    const deleted = await Product.findByIdAndDelete(id);
    return !!deleted;
  }
}

module.exports = ProductManager;

