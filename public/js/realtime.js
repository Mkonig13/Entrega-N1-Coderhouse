(() => {
  const realtimeSection = document.getElementById('realtime-products');
  if (!realtimeSection) return;

  const socket = io();

  const productsContainer = document.getElementById('products-container');
  const productsListEl = document.getElementById('products-list');
  const noProductsEl = document.getElementById('no-products');

  const createForm = document.getElementById('create-product-form');
  const deleteForm = document.getElementById('delete-product-form');

  function renderProducts(products) {
    if (!products || products.length === 0) {
      productsContainer.innerHTML = '<p id="no-products">No hay productos cargados todavía.</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.id = 'products-list';

    for (const p of products) {
      const li = document.createElement('li');
      li.dataset.id = p.id;
      li.innerHTML = `<strong>${p.title}</strong> - $${p.price} (ID: ${p.id})`;
      ul.appendChild(li);
    }

    productsContainer.innerHTML = '';
    productsContainer.appendChild(ul);
  }

  // Escucha los cambios desde el servidor
  socket.on('productsUpdated', (products) => {
    renderProducts(products);
  });

  // Formulario de creación (envía HTTP, luego WebSocket actualiza)
  if (createForm) {
    createForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(createForm);
      const payload = {
        title: formData.get('title'),
        description: formData.get('description'),
        code: formData.get('code'),
        price: Number(formData.get('price')),
        stock: Number(formData.get('stock')),
        category: formData.get('category'),
        status: true,
        thumbnails: [],
      };

      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.error('Error al crear producto');
          return;
        }

        createForm.reset();
        // No actualizamos manualmente la lista aquí;
        // el servidor emitirá "productsUpdated" y el socket la actualizará.
      } catch (err) {
        console.error('Error de red al crear producto', err);
      }
    });
  }

  // Formulario de eliminación (HTTP + actualización vía WebSocket)
  if (deleteForm) {
    deleteForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('deleteId').value;
      if (!id) return;

      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          console.error('Error al eliminar producto');
          return;
        }

        deleteForm.reset();
        // Igual que arriba: esperamos a "productsUpdated"
      } catch (err) {
        console.error('Error de red al eliminar producto', err);
      }
    });
  }

  // Cargar lista inicial vía HTTP (por si el socket tarda)
  fetch('/api/products')
    .then((res) => res.json())
    .then((products) => renderProducts(products))
    .catch((err) => console.error('Error al cargar productos iniciales', err));
})();

