let users = JSON.parse(localStorage.getItem("users")) || [];


function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const error = document.getElementById("error");

  if (!email || !password) {
    error.textContent = "Please enter email and password";
    return;
  }

  const existing = users.find(u => u.email === email);
  if (existing) {
    error.textContent = "User already exists";
    return;
  }

  users.push({ email, password });
  localStorage.setItem("users", JSON.stringify(users));

  error.textContent = "Signup successful. You can now login.";
}



function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (user) {
    localStorage.setItem("loggedInUser", email);
    window.location.href = "index.html";
  } else {
    document.getElementById("error").textContent = "Invalid email or password";
  }
}

