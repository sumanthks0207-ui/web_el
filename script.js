const products = [
  { id: 1, name: "Phone", price: 49990, category: "electronics", image: "images/iPhone_15_Pink_Pure_Back_iPhone_15_Pink_Pure_Front_2up_Screen__WWEN_cfd96ace-df87-4ab3-a96a-e8e9b13bb7b9_800x.jpg.webp" },
  { id: 2, name: "Laptop", price: 89990, category: "electronics", image: "images/FUi2wwNdyFSwShZZ7LaqWf.jpg" },
  { id: 3, name: "Headphones", price: 2490, category: "electronics", image: "images/headphones_images.jpeg" },
  { id: 4, name: "T-Shirt", price: 590, category: "fashion", image: "images/tshirt -images.jpeg" },
  { id: 5, name: "Shoes", price: 1900, category: "fashion", image: "images/images.jpeg" },
  { id: 6, name: "Jeans", price: 2900, category: "fashion", image: "images/jeans_images.jpeg"},
  { id: 7, name: "Blue Curtain", price: 2690, category: "home", image: "images/curtain_images.jpeg" },
  { id: 8, name: "Chair", price: 4990, category: "home", image: "images/chair_images.jpeg" },
  { id: 9, name: "Desk Lamp", price: 390, category: "home", image: "images/nordic-style-metal-desk-lamp-modern-minimalist-lamp-with-solid-original-imahdg483aav5nrh.jpeg.webp" }
];

let selectedCategory = null;

let cart = JSON.parse(localStorage.getItem("cart")) || [];
const productGrid = document.getElementById("productGrid");
const categoryFilter = document.getElementById("categoryFilter");
const priceSort = document.getElementById("priceSort");
const cartCount = document.getElementById("cart-count");
const cartBtn = document.getElementById("cart-btn");
const cartDropdown = document.getElementById("cart-dropdown");

cartBtn.addEventListener("click", () => {
  cartDropdown.classList.toggle("hidden");
});




/* Render products */
function selectCategory(category) {
  const overlay = document.getElementById("category-overlay");
  const productGrid = document.getElementById("productGrid");

  // hide overlay
  overlay.classList.add("hidden");

  // show products
  productGrid.style.display = "grid";

  let filteredProducts;

  if (category === "all") {
    filteredProducts = products;
  } else {
    filteredProducts = products.filter(
      p => p.category === category
    );
  }

  displayProducts(filteredProducts);
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}


function displayProducts(list) {
  productGrid.innerHTML = "";

  list.forEach(product => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${product.image}" />
      <h3>${product.name}</h3>
      <p>${formatPrice(product.price)}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    productGrid.appendChild(div);
  });
}

/* Add to cart */
function addToCart(productId) {
  const item = cart.find(i => i.id === productId);

  if (item) {
    item.quantity++;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
  calculateCartTotal();
}

/* Update cart count */

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cart-count").textContent = count;
}


function renderCartItems() {
  const cartItemsDiv = document.getElementById("cart-items");
  const emptyText = document.getElementById("cart-empty");

  cartItemsDiv.innerHTML = "";

  if (cart.length === 0) {
    emptyText.style.display = "block";
    return;
  }

  emptyText.style.display = "none";

  cart.forEach(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    if (!product) return;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <span>${product.name} (${cartItem.quantity})</span>
      <span>${formatPrice(product.price * cartItem.quantity)}</span>
      <button onclick="removeFromCart(${cartItem.id})">✕</button>
    `;

    cartItemsDiv.appendChild(div);
  });
}
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
  calculateCartTotal();
}
function calculateCartTotal() {
  let total = 0;

  cart.forEach(cartItem => {
    const product = products.find(p => p.id === cartItem.id);
    if (!product) return;

    total += product.price * cartItem.quantity;
  });

  document.getElementById("cart-total").textContent = formatPrice(total);
}
/* Filters */
function applyFilters() {
  let filtered = [...products];

  if (categoryFilter.value !== "all") {
    filtered = filtered.filter(p => p.category === categoryFilter.value);
  }

  if (priceSort.value === "low-high") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (priceSort.value === "high-low") {
    filtered.sort((a, b) => b.price - a.price);
  }

  displayProducts(filtered);
}

/* Event listeners */
categoryFilter.addEventListener("change", applyFilters);
priceSort.addEventListener("change", applyFilters);

/* Initial load */
displayProducts(products);
updateCartCount();
renderCartItems();
calculateCartTotal();
localStorage.removeItem("cart");