tipo = localStorage.getItem("tipo");
token = localStorage.getItem("token");
authApi = "https://evoludesign.com.br/api-conipa/auth/auth.php";

// console.log(tipo, token);

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
if (tipo == "usuario" || tipo == null || token == null) {
  logout();
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("tipo");
  localStorage.removeItem("usuario");
  localStorage.removeItem("user_id");
  window.location.href = "index.html";
}
