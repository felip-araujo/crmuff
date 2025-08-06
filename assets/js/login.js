function togglePassword() {
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eye-icon");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeIcon.classList.remove("fa-eye");
    eyeIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    eyeIcon.classList.remove("fa-eye-slash");
    eyeIcon.classList.add("fa-eye");
  }
}

async function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("password").value;
  const error = document.getElementById("error");

  try {
    const response = await fetch("https://evoludesign.com.br/api-conipa/auth/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();
    console.log("Login:", data);

    if (!response.ok) {
      throw new Error(data.erro || "Erro ao fazer login");
    }

    // Armazena os dados no localStorage (opcional)
    localStorage.setItem("usuario", JSON.stringify(data.usuario));

    // Redireciona com base no tipo
    if (data.usuario.tipo === "admin") {
      window.location.href = "admindash.html";
    } else {
      window.location.href = "requisicoes.html";
    }

  } catch (err) {
    console.error("Erro no login:", err);
    error.textContent = "Usuário ou senha inválidos.";
    error.classList.remove("hidden");
  }
}
