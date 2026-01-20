## Primera Entrega - API de Productos y Carritos

Proyecto de práctica con **Node.js** y **Express** que expone una API REST para gestionar productos y carritos de compra utilizando archivos JSON como “base de datos” (`products.json` y `carts.json`).

### Requisitos

- Node.js instalado (versión 16+ recomendada).

### Instalación

1. Clonar o descargar este repositorio.
2. En la carpeta del proyecto, instalar dependencias:

```bash
npm install
```

### Ejecución del servidor

En la carpeta del proyecto:

```bash
npm start
```

o:

```bash
node server.js
```

El servidor se levanta por defecto en:

- `http://localhost:8080`

### Endpoints principales

#### Productos (`/api/products`)

- **GET** `http://localhost:8080/api/products`  
  Lista todos los productos.

- **GET** `http://localhost:8080/api/products/:pid`  
  Obtiene un producto por su `id`.

- **POST** `http://localhost:8080/api/products`  
  Crea un producto nuevo.  
  **Body (JSON):**

  ```json
  {
    "title": "Producto ejemplo",
    "description": "Descripción del producto",
    "code": "ABC123",
    "price": 99.99,
    "status": true,
    "stock": 50,
    "category": "Electrónica",
    "thumbnails": []
  }
  ```

- **PUT** `http://localhost:8080/api/products/:pid`  
  Actualiza un producto existente.  
  **Body (JSON de campos a actualizar)**.

- **DELETE** `http://localhost:8080/api/products/:pid`  
  Elimina un producto por `id`.

#### Carritos (`/api/carts`)

- **POST** `http://localhost:8080/api/carts`  
  Crea un nuevo carrito.

- **GET** `http://localhost:8080/api/carts/:cid`  
  Obtiene los productos de un carrito por su `id`.

- **POST** `http://localhost:8080/api/carts/:cid/product/:pid`  
  Agrega un producto (por `pid`) a un carrito (por `cid`).

### Uso con Postman

1. Iniciar el servidor (`npm start`).
2. Abrir Postman.
3. Crear una nueva request:
   - Seleccionar el método (GET, POST, PUT, DELETE).
   - Poner la URL correspondiente (por ejemplo `http://localhost:8080/api/products`).
   - Para métodos con body (POST/PUT), elegir **Body → raw → JSON** y pegar el JSON.
4. Presionar **Send** y revisar la respuesta.


