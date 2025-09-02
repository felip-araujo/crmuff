import { API_BASE } from "../js/config/config.js";


const tipo = localStorage.getItem("tipo");
const token = localStorage.getItem("token");
const authApi = `${API_BASE}auth/auth.php`;

async function verifi() {
  try {
    const response = await fetch(authApi, {
      method: "POST",
      headers: { Authorization: token },
    });

    if (!response.ok) {
      logout();
    }
  } catch (e) {}
}

verifi();
if (tipo !== "admin" || tipo == null || token == null) {
  logout();
}

async function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("tipo");
  localStorage.removeItem("usuario");
  localStorage.removeItem("user_id");
  window.location.href = "index.html";
}

window.logout = logout;
