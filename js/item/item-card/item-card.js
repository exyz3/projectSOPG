async function fetchProducts() {
  try {
    const response = await fetch('/data/products.json');
    if (!response.ok) throw new Error('Failed to load products.json');
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

function createProductCard(product) {
  const price = parseFloat(product.price) || 0;
  let stock = parseInt(product.stock, 10) || 0;
  let komad = 0;
  let totalItemsBought = 0;
  let totalSpent = 0;

  const container = document.createElement('div');
  container.classList.add('container');

  container.innerHTML = `
    <div class="first">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="second">
      <p>${product.name}</p>
      <p>Cijena po komadu: ${price.toFixed(2)}€</p>
      <p>Trenutno stanje u skladištu: <span class="stock">${stock}</span> komada</p>
    </div>
    <form class="cart-item" data-id="${product.id}">
      <div class="third">
        <button type="button" class="btn-add">+</button>
        <button type="button" class="btn-remove">-</button>
        <button type="submit" class="btn-buy">
          <img src="/images/shopping-cart-icon-shopping-basket-on-transparent-background-free-png.png" alt="kupi proizvod"/>
        </button>
        <br>
        <p>
          <label for="nth-broj-komada-${product.id}">Broj komada:</label>
          <input type="number" id="nth-broj-komada-${product.id}" min="0" max="${stock}" value="0">
        </p>
        <p>
          <label for="cijena-${product.id}">Ukupna cijena:</label>
          <input type="number" readonly="readonly" id="cijena-${product.id}" value="0">
        </p>
        <p class="purchase-summary"></p>
        <p class="submission-log"></p>
        <button type="button" class="btn-reset">Reset</button>
      </div>
    </form>
  `;

  // Query elements inside this container
  const form = container.querySelector('.cart-item');
  const btnAdd = form.querySelector('.btn-add');
  const btnRemove = form.querySelector('.btn-remove');
  const cijenaInput = form.querySelector(`#cijena-${product.id}`);
  const brojInput = form.querySelector(`#nth-broj-komada-${product.id}`);
  const btnReset = form.querySelector('.btn-reset');
  const btnBuy = form.querySelector('.btn-buy');
  const stockSpan = container.querySelector('.stock');
  const purchaseSummary = form.querySelector('.purchase-summary');
  const submissionLog = form.querySelector('.submission-log');

  function updateUI() {
    cijenaInput.value = (komad * price).toFixed(2);
    brojInput.value = komad;
    brojInput.max = stock;
    stockSpan.textContent = stock;
  }

  btnAdd.addEventListener('click', () => {
    if (komad < stock) {
      komad++;
      updateUI();
    }
  });

  btnRemove.addEventListener('click', () => {
    if (komad > 0) {
      komad--;
      updateUI();
    }
  });

  btnReset.addEventListener('click', () => {
    komad = 0;
    updateUI();
  });

  brojInput.addEventListener('input', () => {
    const inputValue = parseInt(brojInput.value);
    if (inputValue >= 0 && inputValue <= stock) {
      komad = inputValue;
      updateUI();
    } else {
      brojInput.value = komad;
    }
  });

  btnBuy.addEventListener('click', (e) => {
    e.preventDefault();

    if (komad > 0 && komad <= stock) {
      stock -= komad;
      const purchaseCost = komad * price;
      totalItemsBought += komad;
      totalSpent += purchaseCost;

      submissionLog.innerHTML = `Added ${komad} items<br>Price: <span>${purchaseCost.toFixed(2)}€</span>`;
      submissionLog.style.opacity = '1';

      setTimeout(() => {
        submissionLog.style.opacity = '0';
      }, 2500);

      komad = 0;
      updateUI();

      purchaseSummary.innerHTML = `<strong>In Cart: ${totalItemsBought}</strong><br><strong>Total Price: ${totalSpent.toFixed(2)}€</strong>`;
    }
  });

  updateUI();

  return container;
}

async function initItemCard() {
  const products = await fetchProducts();
  const mainContainer = document.querySelector('#product-list') || document.body;

  products.forEach(product => {
    // Validate required fields
    if (!product.id || !product.price || !product.stock || !product.image || !product.name) {
      console.warn('Skipping invalid product:', product);
      return;
    }

    const productCard = createProductCard(product);
    mainContainer.appendChild(productCard);
  });
}

export { initItemCard };
