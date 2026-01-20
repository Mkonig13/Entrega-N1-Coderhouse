const fs = require('fs');
const path = require('path');

class ProductManager {
  constructor(filePath = 'products.json') {
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

  async _writeFile(products) {
    await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
  }

  async getProducts() {
    return await this._readFile();
  }

  async getProductById(id) {
    const products = await this._readFile();
    return products.find((p) => String(p.id) === String(id)) || null;
  }

  async addProduct(productData) {
    const products = await this._readFile();

    const newId =
      products.length === 0
        ? 1
        : Math.max(...products.map((p) => Number(p.id) || 0)) + 1;

    const newProduct = {
      id: newId,
      title: '',
      description: '',
      code: '',
      price: 0,
      status: true,
      stock: 0,
      category: '',
      thumbnails: [],
      ...productData,
    };

    products.push(newProduct);
    await this._writeFile(products);
    return newProduct;
  }

  async updateProduct(id, updates) {
    const products = await this._readFile();
    const index = products.findIndex((p) => String(p.id) === String(id));
    if (index === -1) return null;

    const { id: _ignoreId, ...restUpdates } = updates;
    products[index] = {
      ...products[index],
      ...restUpdates,
    };

    await this._writeFile(products);
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this._readFile();
    const index = products.findIndex((p) => String(p.id) === String(id));
    if (index === -1) return false;
    products.splice(index, 1);
    await this._writeFile(products);
    return true;
  }
}

module.exports = ProductManager;


