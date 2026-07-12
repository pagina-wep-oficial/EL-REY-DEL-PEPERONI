(() => {
  'use strict';

  const PHONE = '529961120401';
  const STORAGE_KEY = 'rey_del_peperoni_cart_v1';

  const cartPanel = document.getElementById('cartPanel');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  const cartBody = document.getElementById('cartBody');
  const cartTotal = document.getElementById('cartTotal');
  const sendOrder = document.getElementById('sendOrder');
  const clearCart = document.getElementById('clearCart');
  const cartCountNodes = document.querySelectorAll('[data-cart-count]');
  const cartTotalNodes = document.querySelectorAll('[data-cart-total]');

  const modal = document.getElementById('itemModal');
  const modalClose = document.getElementById('modalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalPrice = document.getElementById('modalPrice');
  const qtyInput = document.getElementById('qtyInput');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const itemNote = document.getElementById('itemNote');
  const modalSubtotal = document.getElementById('modalSubtotal');
  const modalConfirm = document.getElementById('modalConfirm');
  const toast = document.getElementById('toast');
  const menuSearch = document.getElementById('menuSearch');
  const noResults = document.getElementById('noResults');

  let selectedProduct = null;
  let cart = loadCart();

  function loadCart() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (error) {
      console.warn('No se pudo leer el pedido guardado.', error);
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.warn('No se pudo guardar el pedido en este navegador.', error);
    }
  }

  function money(value) {
    return `$${Number(value || 0).toLocaleString('es-MX')}`;
  }

  function totals() {
    return cart.reduce((acc, item) => {
      acc.quantity += item.quantity;
      acc.amount += item.price * item.quantity;
      return acc;
    }, { quantity: 0, amount: 0 });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function renderCart() {
    const totalData = totals();
    cartCountNodes.forEach((node) => { node.textContent = totalData.quantity; });
    cartTotalNodes.forEach((node) => { node.textContent = money(totalData.amount); });
    cartTotal.textContent = money(totalData.amount);
    sendOrder.disabled = cart.length === 0;
    clearCart.hidden = cart.length === 0;

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <div class="cart-empty">
          <div>
            <span>🍕</span>
            <h3>Tu pedido está vacío</h3>
            <p>Agrega una pizza o bebida para comenzar.</p>
          </div>
        </div>`;
      return;
    }

    cartBody.innerHTML = cart.map((item, index) => `
      <article class="cart-item">
        <div class="cart-item-head">
          <div>
            <h3>${escapeHtml(item.name)}</h3>
            <small>${money(item.price)} × ${item.quantity}</small>
          </div>
          <button type="button" data-remove-index="${index}" aria-label="Eliminar ${escapeHtml(item.name)}">×</button>
        </div>
        ${item.note ? `<div class="cart-item-note">📝 ${escapeHtml(item.note)}</div>` : ''}
        <div class="cart-item-price"><span>Subtotal</span><strong>${money(item.price * item.quantity)}</strong></div>
      </article>`).join('');
  }

  function openCart() {
    renderCart();
    cartPanel.classList.add('open');
    cartOverlay.classList.add('open');
    cartPanel.setAttribute('aria-hidden', 'false');
    cartOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCartPanel() {
    cartPanel.classList.remove('open');
    cartOverlay.classList.remove('open');
    cartPanel.setAttribute('aria-hidden', 'true');
    cartOverlay.setAttribute('aria-hidden', 'true');
    if (!modal.classList.contains('open')) document.body.style.overflow = '';
  }

  function clampQuantity(value) {
    const number = Number.parseInt(value, 10) || 1;
    return Math.min(20, Math.max(1, number));
  }

  function updateModalSubtotal() {
    if (!selectedProduct) return;
    qtyInput.value = clampQuantity(qtyInput.value);
    modalSubtotal.textContent = money(selectedProduct.price * Number(qtyInput.value));
  }

  function openProductModal(card) {
    selectedProduct = {
      name: card.dataset.name,
      price: Number(card.dataset.price)
    };
    modalTitle.textContent = selectedProduct.name;
    modalPrice.textContent = `${money(selectedProduct.price)} c/u`;
    qtyInput.value = 1;
    itemNote.value = '';
    updateModalSubtotal();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => qtyInput.focus(), 50);
  }

  function closeProductModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    selectedProduct = null;
    if (!cartPanel.classList.contains('open')) document.body.style.overflow = '';
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function addSelectedProduct() {
    if (!selectedProduct) return;
    const item = {
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: clampQuantity(qtyInput.value),
      note: itemNote.value.trim()
    };
    cart.push(item);
    saveCart();
    renderCart();
    closeProductModal();
    showToast(`${item.name} agregado al pedido`);
  }

  function removeItem(index) {
    if (!Number.isInteger(index) || index < 0 || index >= cart.length) return;
    cart.splice(index, 1);
    saveCart();
    renderCart();
  }

  function clearAll() {
    if (!cart.length) return;
    if (!window.confirm('¿Quieres vaciar todo el pedido?')) return;
    cart = [];
    saveCart();
    renderCart();
  }

  function generateWhatsAppMessage() {
    if (!cart.length) return '';

    const lines = ['Hola, El Rey del Peperoni 👑🍕', ''];
    cart.forEach((item, index) => {
      lines.push(`Producto: ${item.name}`);
      lines.push(`Cantidad: ${item.quantity}`);
      lines.push(`Precio: ${money(item.price * item.quantity)}`);
      lines.push(`Nota: ${item.note || 'Sin nota'}`);
      if (index < cart.length - 1) lines.push('');
    });
    return lines.join('\n');
  }

  function sendToWhatsApp() {
    const message = generateWhatsAppMessage();
    if (!message) {
      window.alert('Agrega al menos un producto antes de enviar el pedido.');
      return;
    }
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  }

  document.querySelectorAll('[data-open-cart]').forEach((button) => button.addEventListener('click', openCart));
  cartClose.addEventListener('click', closeCartPanel);
  cartOverlay.addEventListener('click', closeCartPanel);
  sendOrder.addEventListener('click', sendToWhatsApp);
  clearCart.addEventListener('click', clearAll);

  document.addEventListener('click', (event) => {
    const addButton = event.target.closest('.item-add');
    if (addButton) {
      const card = addButton.closest('.menu-item-card');
      openProductModal(card);
      addButton.classList.add('added');
      addButton.firstChild.textContent = 'Seleccionado ';
      window.setTimeout(() => {
        addButton.classList.remove('added');
        addButton.firstChild.textContent = 'Agregar al pedido ';
      }, 850);
      return;
    }

    const removeButton = event.target.closest('[data-remove-index]');
    if (removeButton) removeItem(Number.parseInt(removeButton.dataset.removeIndex, 10));
  });

  modalClose.addEventListener('click', closeProductModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeProductModal();
  });
  qtyMinus.addEventListener('click', () => {
    qtyInput.value = clampQuantity(Number(qtyInput.value) - 1);
    updateModalSubtotal();
  });
  qtyPlus.addEventListener('click', () => {
    qtyInput.value = clampQuantity(Number(qtyInput.value) + 1);
    updateModalSubtotal();
  });
  qtyInput.addEventListener('input', updateModalSubtotal);
  modalConfirm.addEventListener('click', addSelectedProduct);

  menuSearch.addEventListener('input', () => {
    const query = menuSearch.value.trim().toLocaleLowerCase('es');
    const cards = [...document.querySelectorAll('.menu-item-card')];
    let visibleCount = 0;

    cards.forEach((card) => {
      const haystack = `${card.dataset.search || ''} ${card.dataset.name || ''}`.toLocaleLowerCase('es');
      const visible = !query || haystack.includes(query);
      card.classList.toggle('filtered-out', !visible);
      if (visible) visibleCount += 1;
    });

    document.querySelectorAll('.menu-category').forEach((category) => {
      const hasVisibleCard = [...category.querySelectorAll('.menu-item-card')]
        .some((card) => !card.classList.contains('filtered-out'));
      category.style.display = hasVisibleCard ? '' : 'none';
    });
    noResults.hidden = visibleCount !== 0;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (modal.classList.contains('open')) closeProductModal();
    else if (cartPanel.classList.contains('open')) closeCartPanel();
  });

  renderCart();
})();
