const products = [
  { id: 1, name: "Phone", price: 500, category: "electronics", image: "https://via.placeholder.com/200" },
  { id: 2, name: "Laptop", price: 900, category: "electronics", image: "https://via.placeholder.com/200" },
  { id: 3, name: "Headphones", price: 150, category: "electronics", image: "https://via.placeholder.com/200" },
  { id: 4, name: "T-Shirt", price: 25, category: "fashion", image: "https://via.placeholder.com/200" },
  { id: 5, name: "Shoes", price: 80, category: "fashion", image: "https://via.placeholder.com/200" },
  { id: 6, name: "Jeans", price: 60, category: "fashion", image: "https://via.placeholder.com/200"},
  { id: 7, name: "Blue Curtain", price: 45, category: "home", image: "https://via.placeholder.com/200" },
  { id: 8, name: "Chair", price: 120, category: "home", image: "https://via.placeholder.com/200" },
  { id: 9, name: "Desk Lamp", price: 30, category: "home", image: "https://via.placeholder.com/200" }
];

const productGrid = document.getElementById("productGrid");
const categoryFilter = document.getElementById("categoryFilter");
const priceSort = document.getElementById("priceSort");
const cartCount = document.getElementById("cart-count");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* Render products */
function displayProducts(list) {
  productGrid.innerHTML = "";

  list.forEach(product => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <img src="${product.image}" />
      <h3>${product.name}</h3>
      <p>$${product.price}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    productGrid.appendChild(div);
  });
}

/* Add to cart */
function addToCart(id) {
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

/* Update cart count */
function updateCartCount() {
 const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
}
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
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
