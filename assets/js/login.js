async function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const error = document.getElementById("error");

  try {
    // Faz login e pega o token
    const response = await fetch("https://evoludesign.com.br/crm/wp-json/jwt-auth/v1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: user,
        password: pass
      })
    });

    const data = await response.json();
    console.log("Login:", data);

    if (!response.ok) {
      throw new Error(data.message || "Erro ao fazer login");
    }

    // Salva o token no localStorage
    localStorage.setItem("token", data.token);

    // Agora busca o perfil do usuário para ver o papel dele
    const perfilResponse = await fetch("https://evoludesign.com.br/crm/wp-json/crm/v1/meu-perfil", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + data.token
      }
    });

    const perfil = await perfilResponse.json();
    console.log("Perfil:", perfil);

    if (!perfilResponse.ok) {
      throw new Error(perfil.message || "Erro ao buscar perfil");
    }

    // Redireciona com base no papel do usuário
    if (perfil.role === "administrator") {
      window.location.href = "dashboard.html";
      localStorage.setItem("admin", perfil.role);
    } else {
      window.location.href = "perfil.html";
    }

  } catch (err) {
    console.error("Erro no login:", err);
    error.textContent = "Usuário ou senha inválidos.";
    error.classList.remove("hidden");
  }
}
