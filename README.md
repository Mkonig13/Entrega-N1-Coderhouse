## Primera Entrega - API de Productos, Carritos y WebSockets

Proyecto de práctica con **Node.js**, **Express**, **Handlebars** y **Socket.io** que expone:

- Una **API REST** para gestionar productos y carritos de compra utilizando archivos JSON como “base de datos” (`products.json` y `carts.json`).
- Vistas renderizadas con **Handlebars**.
- Una vista en **tiempo real** que se actualiza automáticamente mediante **WebSockets** cuando se crean o eliminan productos.

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

---

### Vistas con Handlebars

El proyecto usa **express-handlebars** como motor de plantillas.  
Las vistas principales son:

- **Home (HTTP)**  
  - URL: `http://localhost:8080/`  
  - Vista: `views/home.handlebars`  
  - Muestra la lista de productos obtenidos por HTTP (sin tiempo real).

- **Productos en tiempo real (WebSockets)**  
  - URL: `http://localhost:8080/realtimeproducts`  
  - Vista: `views/realTimeProducts.handlebars`  
  - Contiene:
    - La misma lista de productos.
    - Un formulario para **crear** productos.
    - Un formulario para **eliminar** productos por ID.
  - Esta vista se actualiza automáticamente mediante **Socket.io** cada vez que:
    - Se crea un producto (`POST /api/products`).
    - Se actualiza un producto (`PUT /api/products/:pid`).
    - Se elimina un producto (`DELETE /api/products/:pid`).

Internamente, las rutas HTTP usan `req.app.get('io')` para obtener la instancia de Socket.io y emitir el evento:

- **Evento emitido**: `productsUpdated`
- **Payload**: lista completa de productos actualizada.

El cliente (`public/js/realtime.js`) escucha este evento y vuelve a renderizar la lista en la vista de tiempo real.

---

### API REST

Las rutas de API están agrupadas en:

- `routes/api/products.router.js`
- `routes/api/carts.router.js`

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

---

### Uso con Postman

1. Iniciar el servidor (`npm start`).
2. Abrir Postman.
3. Crear una nueva request:
   - Seleccionar el método (GET, POST, PUT, DELETE).
   - Poner la URL correspondiente (por ejemplo `http://localhost:8080/api/products`).
   - Para métodos con body (POST/PUT), elegir **Body → raw → JSON** y pegar el JSON.
4. Presionar **Send** y revisar la respuesta.

Además, puedes probar las vistas en el navegador:

- `http://localhost:8080/`
- `http://localhost:8080/realtimeproducts`

