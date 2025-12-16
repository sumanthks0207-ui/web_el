const products = [
  { id: 1, name: "Phone", price: 500, category: "electronics", image: "https://via.placeholder.com/200" },
  { id: 2, name: "Laptop", price: 900, category: "electronics", image: "https://via.placeholder.com/200" },
  { id: 3, name: "T-Shirt", price: 25, category: "fashion", image: "https://via.placeholder.com/200" },
  { id: 4, name: "Shoes", price: 80, category: "fashion", image: "https://via.placeholder.com/200" }
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
  cart.push(id);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

/* Update cart count */
function updateCartCount() {
  cartCount.textContent = cart.length;
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
