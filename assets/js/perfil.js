const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html"; // Redireciona se não estiver logado
} else {
  busca(); // chama a função se estiver logado
  buscarPDFs();
}

async function busca() {
  try {
    const response = await fetch("https://evoludesign.com.br/crm/wp-json/crm/v1/meu-perfil", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao acessar seus dados");
    }

    console.log("Dados do usuário:", data);
    document.getElementById("nomeUsuario").textContent = data.nome || "—";
    document.getElementById("emailUsuario").textContent = data.email || "—";
    document.getElementById("telefoneUsuario").textContent = data.telefone || "—";
    const primeiroNome = data.nome ? data.nome.split(" ")[0] : "Usuário";
    document.getElementById("nomeSidebar").textContent = primeiroNome;


  } catch (err) {
    console.error("Erro na busca de dados:", err);
    // Você pode exibir uma mensagem de erro na tela futuramente aqui
  }
}

async function buscarPDFs() {
  try {
    const response = await fetch("https://evoludesign.com.br/crm/wp-json/crm/v1/meus-pdfs", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao buscar seus PDFs.");
    }

    console.log("PDFs do usuário:", data);

  } catch (err) {
    console.error("Erro ao buscar PDFs:", err);
  }
}


function logout() {
  window.location.href = "login.html";
}
