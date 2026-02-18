const user = localStorage.getItem("loggedInUser");
if (!user) {
  window.location.href = "login.html";
}

const products = JSON.parse(localStorage.getItem("products")) || [];
const cart = JSON.parse(localStorage.getItem("cart")) || [];

const checkoutItems = document.getElementById("checkout-items");
const checkoutTotal = document.getElementById("checkout-total");

function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

let total = 0;

cart.forEach(item => {
  const product = products.find(p => p.id === item.id);
  if (!product) return;

  const itemTotal = product.price * item.quantity;
  total += itemTotal;

  const div = document.createElement("div");
  div.className = "checkout-row";

  div.innerHTML = `
    <div class="col name">${product.name}</div>
    <div class="col qty">${item.quantity}</div>
    <div class="col price">${formatPrice(itemTotal)}</div>
  `;

  checkoutItems.appendChild(div);
});
function confirmOrder() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const user = localStorage.getItem("loggedInUser");

  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  const newOrder = {
    orderId: Date.now(),   // unique ID
    user: user,
    items: cart,
    total: total,
    date: new Date().toLocaleString()
  };

  // Add to orders array
  orders.push(newOrder);

  // Save updated orders back to localStorage
  localStorage.setItem("orders", JSON.stringify(orders));

  // Clear cart
  localStorage.removeItem("cart");

  alert("Order Confirmed!");

  window.location.href = "index.html";
}




checkoutTotal.textContent = formatPrice(total);
