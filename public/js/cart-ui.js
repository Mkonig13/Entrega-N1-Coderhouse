(() => {
  const addButtons = document.querySelectorAll('[data-add-to-cart]');
  const removeButtons = document.querySelectorAll('[data-remove-from-cart]');
  const clearCartButton = document.querySelector('[data-clear-cart]');
  const viewCartLink = document.getElementById('view-cart-link');
  let cartId = localStorage.getItem('cartId') || null;

  const updateViewCartLink = () => {
    if (!viewCartLink) return;
    if (cartId) {
      viewCartLink.href = `/carts/${cartId}`;
      viewCartLink.style.display = 'inline';
    } else {
      viewCartLink.style.display = 'none';
    }
  };

  const ensureCart = async () => {
    if (cartId) return cartId;
    const res = await fetch('/api/carts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      alert('No se pudo crear el carrito');
      throw new Error('Error creando carrito');
    }
    const data = await res.json();
    cartId = data._id || data.id;
    localStorage.setItem('cartId', cartId);
    updateViewCartLink();
    return cartId;
  };

  addButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const productId = btn.getAttribute('data-product-id');
      if (!productId) return;
      try {
        const currentCartId = await ensureCart();
        const res = await fetch(`/api/carts/${currentCartId}/products/${productId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          alert('No se pudo agregar el producto al carrito');
          return;
        }
        alert('Producto agregado al carrito');
      } catch (err) {
        console.error(err);
      }
    });
  });

  removeButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const cartIdAttr = btn.getAttribute('data-cart-id');
      const productId = btn.getAttribute('data-product-id');
      if (!cartIdAttr || !productId) return;
      try {
        const res = await fetch(`/api/carts/${cartIdAttr}/products/${productId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          alert('No se pudo quitar el producto del carrito');
          return;
        }
        const data = await res.json();
        if (data.deleted) {
          localStorage.removeItem('cartId');
          cartId = null;
          updateViewCartLink();
          window.location.href = '/';
        } else {
          window.location.reload();
        }
      } catch (err) {
        console.error(err);
      }
    });
  });

  if (clearCartButton) {
    clearCartButton.addEventListener('click', async () => {
      const cartIdAttr = clearCartButton.getAttribute('data-cart-id');
      if (!cartIdAttr) return;
      try {
        const res = await fetch(`/api/carts/${cartIdAttr}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          alert('No se pudo vaciar el carrito');
          return;
        }
        const data = await res.json();
        if (data.deleted) {
          localStorage.removeItem('cartId');
          cartId = null;
          updateViewCartLink();
          window.location.href = '/';
        } else {
          window.location.reload();
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  updateViewCartLink();
})();

