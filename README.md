## Entrega Final - Productos, Carritos, MongoDB y WebSockets

Proyecto de práctica con **Node.js**, **Express**, **Handlebars**, **Socket.io** y **MongoDB (Mongoose)** que expone:

- Una **API REST** para gestionar productos y carritos de compra utilizando **MongoDB** como sistema de persistencia principal.
- Vistas renderizadas con **Handlebars**, incluyendo listado paginado, filtros, ordenamientos y vista de carrito.
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

- **Home con paginación, filtros y carrito automático**  
  - URL: `http://localhost:8080/`  
  - Vista: `views/home.handlebars`  
  - Características:
    - Lista de productos obtenidos desde MongoDB.
    - Soporte de **paginación, filtros y ordenamiento**:
      - `limit`: cantidad de elementos por página (por defecto 10).
      - `page`: número de página (por defecto 1).
      - `sort`: `asc` / `desc` para ordenar por precio.
      - `query`: permite filtrar por categoría o disponibilidad:
        - `query=category:Electrónica`
        - `query=status:true` (productos disponibles)
    - Cada producto tiene un botón **"Agregar al carrito"**:
      - Si no existe carrito, se crea automáticamente con `POST /api/carts`.
      - El `cartId` se guarda en `localStorage` del navegador.
    - Link **"Ver carrito actual"** que lleva a `/carts/:cid` si existe carrito.

- **Listado de productos (alias)**  
  - URL: `http://localhost:8080/products`  
  - Vista: `views/products.handlebars`  
  - Usa la misma UX de paginación, filtros y carrito que el home.

- **Detalle de producto**  
  - URL sugerida: `http://localhost:8080/products/:pid`  
  - Vista: `views/productDetail.handlebars`  
  - Muestra:
    - Título, descripción completa, categoría, precio, stock, disponibilidad e imágenes.
    - Botón **"Agregar al carrito"** que reutiliza el carrito actual (o lo crea si no existe).

- **Vista de carrito específico**  
  - URL: `http://localhost:8080/carts/:cid`  
  - Vista: `views/cart.handlebars`  
  - Muestra:
    - Solo los productos que pertenecen a ese carrito, con `populate` para traer la información completa del producto.
    - Botón **"Quitar"** junto a cada producto (realiza `DELETE /api/carts/:cid/products/:pid`).
    - Botón **"Vaciar carrito"** (`DELETE /api/carts/:cid`), que además elimina el carrito y limpia el `cartId` del navegador si queda vacío.

- **Productos en tiempo real (WebSockets)**  
  - URL: `http://localhost:8080/realtimeproducts`  
  - Vista: `views/realTimeProducts.handlebars`  
  - Contiene:
    - Lista de productos.
    - Formulario para **crear** productos.
    - Formulario para **eliminar** productos por ID.
  - Se actualiza automáticamente mediante **Socket.io** cada vez que:
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
  Lista productos con **paginación, filtros y ordenamiento**.

  **Query params admitidos:**

  - `limit` (opcional): cantidad de productos por página (por defecto `10`).
  - `page` (opcional): número de página (por defecto `1`).
  - `sort` (opcional): `asc` / `desc` para ordenar por `price`.
  - `query` (opcional): filtro por categoría o disponibilidad:
    - Por categoría: `?query=category:Electrónica`
    - Por disponibilidad: `?query=status:true` / `?query=status:false`

  **Respuesta:**

  ```json
  {
    "status": "success",
    "payload": [/* productos */],
    "totalPages": 3,
    "prevPage": 1,
    "nextPage": 3,
    "page": 2,
    "hasPrevPage": true,
    "hasNextPage": true,
    "prevLink": "http://localhost:8080/api/products?limit=10&page=1",
    "nextLink": "http://localhost:8080/api/products?limit=10&page=3"
  }
  ```

- **GET** `http://localhost:8080/api/products/:pid`  
  Obtiene un producto por su `id` (ObjectId de MongoDB).

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
  **Body**: JSON con los campos a actualizar.

- **DELETE** `http://localhost:8080/api/products/:pid`  
  Elimina un producto por `id`.

#### Carritos (`/api/carts`)

- **POST** `http://localhost:8080/api/carts`  
  Crea un nuevo carrito (usado internamente por la UX cuando no existe carrito).

- **GET** `http://localhost:8080/api/carts/:cid`  
  Obtiene un carrito completo por su `id`, con los productos **populados** (`product` referencia a `Product`).

- **POST** `http://localhost:8080/api/carts/:cid/products/:pid`  
  Agrega un producto (por `pid`) a un carrito (por `cid`).  
  Si el producto ya existe en el carrito, incrementa `quantity`.

- **DELETE** `http://localhost:8080/api/carts/:cid/products/:pid`  
  Elimina del carrito el producto seleccionado.  
  Si era el último producto, el carrito se elimina.

- **PUT** `http://localhost:8080/api/carts/:cid`  
  Reemplaza todos los productos del carrito por un arreglo nuevo.  
  **Body admitido:**

  ```json
  [
    { "product": "<productId1>", "quantity": 2 },
    { "product": "<productId2>", "quantity": 1 }
  ]
  ```

  o bien:

  ```json
  {
    "products": [
      { "product": "<productId1>", "quantity": 2 },
      { "product": "<productId2>", "quantity": 1 }
    ]
  }
  ```

- **PUT** `http://localhost:8080/api/carts/:cid/products/:pid`  
  Actualiza **solo la cantidad** de un producto en el carrito.  
  **Body (JSON):**

  ```json
  {
    "quantity": 5
  }
  ```

- **DELETE** `http://localhost:8080/api/carts/:cid`  
  Elimina todos los productos del carrito y elimina el documento de carrito.

---

### Uso con Postman

1. Iniciar el servidor (`npm start` o `node server.js`).
2. Abrir Postman.
3. Crear una nueva request:
   - Seleccionar el método (GET, POST, PUT, DELETE).
   - Poner la URL correspondiente (por ejemplo `http://localhost:8080/api/products`).
   - Para métodos con body (POST/PUT), elegir **Body → raw → JSON** y pegar el JSON.
4. Presionar **Send** y revisar la respuesta.

Además, puedes probar las vistas en el navegador:

- `http://localhost:8080/` → Home con paginación y carrito.
- `http://localhost:8080/products` → Alias del listado con paginación.
- `http://localhost:8080/products/:pid` → Detalle de producto.
- `http://localhost:8080/carts/:cid` → Vista de carrito específico.
- `http://localhost:8080/realtimeproducts` → Vista en tiempo real con WebSockets.

