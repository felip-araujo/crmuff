
const token = localStorage.getItem("token");

// Redireciona se não estiver logado
if (!token) {
  window.location.href = "index.html";
} else {
  busca();
  buscarPDFs();
  showSection("documentos"); // Exibe a aba de documentos por padrão
}

// Exibe os dados do usuário logado
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
    document.getElementById("statusUsuario").textContent = data.status || "—";
    if (data.status === "Ativo") {
      statusIcon.classList.add("text-green-500", "fas", "fa-circle-check");
      statusIcon.classList.remove("text-red-500", "fa-circle-xmark");
    } else {
      statusIcon.classList.add("text-red-500", "fas", "fa-circle-xmark");
      statusIcon.classList.remove("text-green-500", "fa-circle-check");
    }

  } catch (err) {
    console.error("Erro na busca de dados:", err);
  }
}

// Lista os PDFs do cliente logado
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
    console.log("PDFs do usuário:", data);

    const pdfContainer = document.getElementById("pdfContainer");
    pdfContainer.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      pdfContainer.innerHTML = `<p class="text-gray-600">Nenhum documento disponível no momento.</p>`;
      return;
    }

    data.forEach((item, index) => {
      let url = typeof item === "string" ? item : item.url;
      let nomeCompleto = "";

      if (typeof item === "object" && item.nome) {
        nomeCompleto = item.nome;
      } else if (url) {
        // extrai nome do arquivo da URL, ex: comprovante_endereco.pdf
        const nomeArquivo = url.split("/").pop().split(".")[0].replace(/[_-]/g, " ");
        nomeCompleto = nomeArquivo;
      } else {
        nomeCompleto = `Documento ${index + 1}`;
      }

      // Pega as duas primeiras palavras
      const palavras = nomeCompleto.split(" ");
      const nomeExibido = palavras.slice(0, 2).join(" ");

      const bloco = document.createElement("div");
      bloco.className = "bg-white p-4 rounded shadow hover:shadow-lg transition cursor-pointer border border-gray-200 flex flex-col";

      bloco.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-md font-semibold text-blue-700">${nomeExibido}</h2>
          <i class="fas fa-file-pdf text-red-500 text-xl"></i>
        </div>
        <a href="${url}" target="_blank" class="mt-auto bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 text-center">
          Ver Documento
        </a>
      `;

      pdfContainer.appendChild(bloco);
    });

  } catch (err) {
    console.error("Erro ao buscar PDFs:", err);
    const pdfContainer = document.getElementById("pdfContainer");
    pdfContainer.innerHTML = `<p class="text-red-600">Erro ao carregar seus documentos.</p>`;
  }
}


// Alterna visibilidade entre seções
function showSection(id) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
  });
  const sectionToShow = document.getElementById(id);
  if (sectionToShow) sectionToShow.classList.remove('hidden');
}

// Faz logout
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
