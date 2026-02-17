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
  const message = document.getElementById("order-message");

  // show message
  message.classList.remove("hidden");

  // clear cart
  localStorage.removeItem("cart");

  // optional: disable button
  document.querySelector(".confirm-btn").disabled = true;
}



checkoutTotal.textContent = formatPrice(total);
