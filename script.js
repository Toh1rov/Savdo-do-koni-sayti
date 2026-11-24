const categories = [
  { name: "Meva-sabzavot", emoji: "🥑", tint: "#edf4e9" },
  { name: "Sut mahsulotlari", emoji: "🥛", tint: "#edf1f8" },
  { name: "Go‘sht mahsulotlari", emoji: "🥩", tint: "#f8ece8" },
  { name: "Non va pishiriqlar", emoji: "🥐", tint: "#faf1df" },
  { name: "Ichimliklar", emoji: "🧃", tint: "#edf5ec" },
  { name: "Shirinliklar", emoji: "🍫", tint: "#f6edf0" }
];

const products = [
  { id: 1, name: "Yangi avokado", category: "Meva-sabzavot", price: 18000, oldPrice: 22000, unit: "dona", badge: "−18%", image: "photo-1523049673857-eb18f1d7b578" },
  { id: 2, name: "Qizil olma", category: "Meva-sabzavot", price: 14000, unit: "1 kg", badge: "Yangi", image: "photo-1560806887-1e4cd0b6cbd6" },
  { id: 3, name: "Tabiiy sut", category: "Sut mahsulotlari", price: 12000, unit: "1 litr", badge: "Yangi", image: "photo-1563636619-e9143da7973b" },
  { id: 4, name: "Yangi sariyog‘", category: "Sut mahsulotlari", price: 28000, oldPrice: 32000, unit: "200 g", badge: "−12%", image: "photo-1589985270826-4b7bb135bc9d" },
  { id: 5, name: "Qishloq noni", category: "Non va pishiriqlar", price: 6000, unit: "dona", badge: "Issiq", image: "photo-1509440159596-0249088772ff" },
  { id: 6, name: "Apelsin sharbati", category: "Ichimliklar", price: 16000, unit: "1 litr", badge: "Tabiiy", image: "photo-1600271886742-f049cd451bba" },
  { id: 7, name: "Sutli shokolad", category: "Shirinliklar", price: 11000, unit: "90 g", badge: "Ommabop", image: "photo-1548907040-4d42faa0a650" },
  { id: 8, name: "Mol go‘shti", category: "Go‘sht mahsulotlari", price: 89000, unit: "1 kg", badge: "Yangi", image: "photo-1607623814075-e51df1bdc82f" }
];

const productGrid = document.querySelector("#product-grid");
const categoryGrid = document.querySelector("#category-grid");
const categorySelect = document.querySelector("#category-select");
const searchInput = document.querySelector("#search-input");
const emptyState = document.querySelector("#empty-state");
const cartDrawer = document.querySelector("#cart-drawer");
const drawerBackdrop = document.querySelector("#drawer-backdrop");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const drawerFooter = document.querySelector("#drawer-footer");
const cartCount = document.querySelector("#cart-count");
const drawerCount = document.querySelector("#drawer-count");
const toast = document.querySelector("#toast");

let activeCategory = "all";
let searchTerm = "";
let toastTimer;
let cart = loadCart();

function loadCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem("ezoz-market-cart") || "[]");
    if (!Array.isArray(savedCart)) return [];
    return savedCart.filter((item) =>
      Number.isInteger(item.id) && products.some((product) => product.id === item.id) &&
      Number.isInteger(item.quantity) && item.quantity > 0
    );
  } catch (error) {
    console.warn("Savat ma’lumotlarini o‘qib bo‘lmadi:", error);
    return [];
  }
}

function formatPrice(price) {
  return `${new Intl.NumberFormat("uz-UZ").format(price)} so‘m`;
}

function imageUrl(imageId, width = 500) {
  return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=${width}&q=80`;
}

function renderCategories() {
  categoryGrid.innerHTML = categories.map((category) => `
    <button class="category-card" type="button" data-category="${category.name}" style="--category-tint:${category.tint}">
      <span class="category-emoji" aria-hidden="true">${category.emoji}</span>
      <strong>${category.name}</strong>
    </button>
  `).join("");

  categorySelect.innerHTML = '<option value="all">Barcha mahsulotlar</option>' +
    categories.map(({ name }) => `<option value="${name}">${name}</option>`).join("");
}

function renderProducts() {
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.category}`.toLocaleLowerCase("uz").includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-picture">
        <img src="${imageUrl(product.image)}" alt="${product.name}" loading="lazy">
        <span class="product-badge ${product.oldPrice ? "discount" : ""}">${product.badge}</span>
        <button class="favorite-button" type="button" aria-label="${product.name}ni sevimlilarga qo‘shish" aria-pressed="false">♡</button>
      </div>
      <div class="product-info">
        <p class="product-category">${product.category} · ${product.unit}</p>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-bottom">
          <div class="product-price"><strong>${formatPrice(product.price)}</strong>${product.oldPrice ? `<del>${formatPrice(product.oldPrice)}</del>` : ""}</div>
          <button class="add-button" type="button" data-add="${product.id}" aria-label="${product.name}ni savatga qo‘shish">+</button>
        </div>
      </div>
    </article>
  `).join("");
  emptyState.hidden = visibleProducts.length > 0;
  document.querySelector("#show-more").hidden = searchTerm.length > 0 || activeCategory !== "all";
}

function saveCart() {
  try {
    localStorage.setItem("ezoz-market-cart", JSON.stringify(cart));
  } catch (error) {
    console.warn("Savatni saqlab bo‘lmadi:", error);
  }
}

function renderCart() {
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => {
    const product = products.find(({ id }) => id === item.id);
    return total + product.price * item.quantity;
  }, 0);

  cartCount.textContent = totalQuantity;
  drawerCount.textContent = `(${totalQuantity})`;
  cartEmpty.hidden = cart.length > 0;
  drawerFooter.hidden = cart.length === 0;
  cartItems.innerHTML = cart.map((item) => {
    const product = products.find(({ id }) => id === item.id);
    return `
      <article class="cart-line">
        <img src="${imageUrl(product.image, 180)}" alt="${product.name}">
        <div>
          <h3 class="cart-line-name">${product.name}</h3>
          <p class="cart-line-price">${formatPrice(product.price)}</p>
          <div class="quantity-control">
            <button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Bittaga kamaytirish">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-quantity="${product.id}" data-change="1" aria-label="Bittaga ko‘paytirish">+</button>
          </div>
        </div>
        <button class="remove-item" type="button" data-remove="${product.id}" aria-label="${product.name}ni savatdan o‘chirish">×</button>
      </article>
    `;
  }).join("");
  document.querySelector("#cart-total").textContent = formatPrice(totalPrice);
}

function addToCart(id) {
  const existingItem = cart.find((item) => item.id === id);
  if (existingItem) existingItem.quantity += 1;
  else cart.push({ id, quantity: 1 });
  saveCart();
  renderCart();
  const product = products.find((item) => item.id === id);
  showToast(`${product.name} savatga qo‘shildi`);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function setCartOpen(isOpen) {
  cartDrawer.classList.toggle("is-open", isOpen);
  drawerBackdrop.classList.toggle("is-open", isOpen);
  cartDrawer.setAttribute("aria-hidden", String(!isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
  if (isOpen) document.querySelector("#cart-close").focus();
}

function applyCategory(category) {
  activeCategory = category;
  categorySelect.value = category;
  renderProducts();
  document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
}

categoryGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (button) applyCategory(button.dataset.category);
});

categorySelect.addEventListener("change", (event) => {
  activeCategory = event.target.value;
  renderProducts();
});

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  searchTerm = searchInput.value.trim().toLocaleLowerCase("uz");
  renderProducts();
  document.querySelector("#products").scrollIntoView({ behavior: "smooth" });
});

searchInput.addEventListener("input", () => {
  if (!searchInput.value.trim()) {
    searchTerm = "";
    renderProducts();
  }
});

document.querySelector("#product-grid").addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    addToCart(Number(addButton.dataset.add));
    return;
  }

  const favoriteButton = event.target.closest(".favorite-button");
  if (favoriteButton) {
    const isFavorite = favoriteButton.getAttribute("aria-pressed") !== "true";
    favoriteButton.setAttribute("aria-pressed", String(isFavorite));
    favoriteButton.classList.toggle("is-favorite", isFavorite);
    favoriteButton.textContent = isFavorite ? "♥" : "♡";
    showToast(isFavorite ? "Sevimlilarga qo‘shildi" : "Sevimlilardan olib tashlandi");
  }
});

cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    const id = Number(quantityButton.dataset.quantity);
    const item = cart.find((entry) => entry.id === id);
    if (item) item.quantity += Number(quantityButton.dataset.change);
    cart = cart.filter((entry) => entry.quantity > 0);
  } else if (removeButton) {
    const id = Number(removeButton.dataset.remove);
    cart = cart.filter((entry) => entry.id !== id);
  } else {
    return;
  }

  saveCart();
  renderCart();
});

document.querySelector("#cart-open").addEventListener("click", () => setCartOpen(true));
document.querySelector("#cart-close").addEventListener("click", () => setCartOpen(false));
drawerBackdrop.addEventListener("click", () => setCartOpen(false));
document.querySelector("#continue-shopping").addEventListener("click", () => setCartOpen(false));
document.querySelector("#checkout-button").addEventListener("click", () => {
  showToast("Buyurtma berish xizmati tez orada ishga tushadi");
});
document.querySelector("#show-more").addEventListener("click", () => {
  activeCategory = "all";
  categorySelect.value = "all";
  renderProducts();
});
document.querySelectorAll("[data-nav-category]").forEach((link) => {
  link.addEventListener("click", () => {
    activeCategory = link.dataset.navCategory;
    categorySelect.value = activeCategory;
    renderProducts();
  });
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) setCartOpen(false);
});

renderCategories();
renderProducts();
renderCart();
