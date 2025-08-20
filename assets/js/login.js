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
  const re = document.getElementById("re").value;
  const senha = document.getElementById("password").value;
  const error = document.getElementById("error");

  try {
    const response = await fetch("https://evoludesign.com.br/api-conipa/auth/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ re, senha })
    });

    const data = await response.json();
    console.log("Login:", data);

    if (!response.ok) {
      throw new Error(data.erro || "Erro ao fazer login");
    }

    // Armazena os dados no localStorage (opcional)
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    window.location.href = "requisicoes.html"; // pode ser na Vercel


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

async function preCadastro() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("e-mail").value;
  const setor = document.getElementById("setor").value;
  const re = document.getElementById("re").value;
  const senha1 = document.getElementById("senha1").value;
  const senha2 = document.getElementById("senha-confirm").value;
  const error = document.getElementById("errorModal");
  const sucess = document.getElementById("sucessModal");

  const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|`~]).{8,}$/;

  if (senha1 !== senha2) {
    error.textContent = "As senhas não coincidem";
    error.classList.remove("hidden");
    return;
  }

  if (!senhaRegex.test(senha2)) {
    error.textContent = "A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.";
    error.classList.remove("hidden");
    return;
  }

  try {
    const response = await fetch("https://evoludesign.com.br/api-conipa/auth/pre-cadastro.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, setor, re, senha: senha2 })
    });

    if (!response.ok) {
      throw new Error("Erro ao realizar o Pré-Cadastro");
    } else {
      sucess.textContent = "Pré-Cadastro Realizado, aguarde aprovação de um administrador!";
      sucess.classList.remove("hidden");
    }
  } catch (err) {
    console.error("erro", err);
  }

}

async function trocarSenha() {
  const sucesso = document.getElementById("sucesso");
  const erro = document.getElementById("erro");
  const re = document.getElementById("RE").value;
  const nova_senha = document.getElementById("nova_senha").value;

  // Regex para senha forte
  const regexSenhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (!regexSenhaForte.test(nova_senha)) {
    erro.textContent = "A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos.";
    erro.classList.remove("hidden");
    return;
  }

  try {
    const response = await fetch("https://evoludesign.com.br/api-conipa/auth/recuperar-senha.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "re": re, "nova_senha": nova_senha })
    });

    if (!response.ok) {
      erro.textContent = "Erro ao alterar a senha.";
      erro.classList.remove("hidden");
      return;
    }

    sucesso.textContent = "Senha alterada com sucesso!";
    sucesso.classList.remove("hidden");
    erro.classList.add("hidden");

  } catch (e) {
    erro.textContent = "Ocorreu um erro inesperado.";
    erro.classList.remove("hidden");
  }
}
