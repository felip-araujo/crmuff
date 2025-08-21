
let itensRequisicao = [];


document.addEventListener("DOMContentLoaded", () => {
  // 🌙 Dark Mode
  const toggle = document.getElementById("toggleDarkMode");
  const html = document.documentElement;
  const dot = document.getElementById("toggleDot");

  function setDarkMode(enabled) {
    if (enabled) {
      html.classList.add("dark");
      toggle.checked = true;
      dot.classList.add("translate-x-5");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      toggle.checked = false;
      dot.classList.remove("translate-x-5");
      localStorage.setItem("theme", "light");
    }
  }

  const savedTheme = localStorage.getItem("theme");
  setDarkMode(savedTheme === "dark");

  toggle.addEventListener("change", () => {
    setDarkMode(toggle.checked);
  });

  // 🔍 Buscar material ao perder foco do input
  const input = document.getElementById("codigo_material");

  if (input) {
    input.addEventListener("blur", async function () {
      const codigo = input.value.trim();
      if (!codigo) {
        limparInfoMaterial();
        return;
      }

      const info = await buscarMaterialPorCodigo(codigo);
      console.log("🔍 Resposta da API:", info);

      if (info?.success && Array.isArray(info.material) && info.material.length > 0) {
        const material = info.material[0];
        mostrarInfoMaterial(material);
      } else {
        limparInfoMaterial();
        alert("Material não encontrado para o código informado.");
      }
    });
  } else {
    console.warn("⚠️ Campo #codigo_material não encontrado");
  }

  // 📦 Adicionar item à lista
  document.getElementById("btnAdicionarItem")?.addEventListener("click", adicionarItem);

  // 🚀 Enviar requisição
  document.getElementById("btnEnviarRequisicao")?.addEventListener("click", enviarRequisicao);

  // 🎯 Abrir e fechar modal
  document.getElementById("btnAbrirModal")?.addEventListener("click", abrirModal);
  document.getElementById("btnFecharModal")?.addEventListener("click", fecharModal);
});

// 🧠 Buscar material via API
async function buscarMaterialPorCodigo(codigo) {
  if (!codigo) return null;

  try {
    const response = await fetch("https://evoludesign.com.br/api-conipa/material/material-por-id.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ codigo })
    });

    if (!response.ok) {
      throw new Error("Erro na resposta da API");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar material:", error);
    return null;
  }
}

// 💬 Mostrar info do material corretamente
function mostrarInfoMaterial(material) {
  let divInfo = document.getElementById("infoMaterial");

  if (!divInfo) {
    divInfo = document.createElement("div");
    divInfo.id = "infoMaterial";
    divInfo.className = "mt-1 text-sm text-green-600 dark:text-green-400";
    document.getElementById("codigo_material").insertAdjacentElement("afterend", divInfo);
  }

  divInfo.innerHTML = `
                <strong>Material:</strong> ${material.descricao || '---'}<br>
                <strong>Grupo:</strong> ${material.grupo || '---'}<br>
                <strong>Código:</strong> ${material.codigo || '---'}
            `;
}

// 🧼 Limpar info do material
function limparInfoMaterial() {
  const divInfo = document.getElementById("infoMaterial");
  if (divInfo) divInfo.remove();
}

// ➕ Adicionar item
function adicionarItem() {
  const lista = document.getElementById("listaItens");
  const cod = document.getElementById("codigo_material").value;
  const qtd = document.getElementById("quantidade_item").value;

  if (cod && qtd) {
    // Adiciona no array de itens
    itensRequisicao.push({
      codigo_material: cod,
      quantidade: parseInt(qtd, 10)
    });

    // Exibe na lista visual
    const p = document.createElement("p");
    p.textContent = `Código: ${cod}, Quantidade: ${qtd}`;
    lista.appendChild(p);

    // Limpar inputs
    document.getElementById("codigo_material").value = "";
    document.getElementById("quantidade_item").value = "";
    limparInfoMaterial();
  }
}

async function enviarRequisicao() {
  const sucesso = document.getElementById("sucesso");
  const erro = document.getElementById("erro");
  const listaItens = document.getElementById("listaItens");

  // Limpar mensagens
  sucesso.classList.add("hidden");
  erro.classList.add("hidden");
  sucesso.textContent = "";
  erro.textContent = "";

  // Recuperar dados do usuário do localStorage
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario || !usuario.id) {
    erro.textContent = "Usuário não autenticado.";
    erro.classList.remove("hidden");
    return;
  }

  // Captura os itens adicionados
  const itens = [];
  listaItens.querySelectorAll("p").forEach(p => {
    const texto = p.textContent; // "Código: 12345, Quantidade: 10"
    const match = texto.match(/Código:\s*(\S+),\s*Quantidade:\s*(\d+)/);
    if (match) {
      itens.push({
        codigo_material: match[1],
        quantidade: parseInt(match[2], 10)
      });
    }
  });

  if (itens.length === 0) {
    erro.textContent = "Adicione pelo menos um item antes de enviar.";
    erro.classList.remove("hidden");
    return;
  }

  try {
    const body = {
      id_usuario: usuario.id,
      nome: usuario.nome,
      re: usuario.re,
      setor: usuario.setor,
      itens
    };

    const response = await fetch("https://evoludesign.com.br/api-conipa/requisicoes/criar.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok || data.erro) {
      erro.textContent = data.erro || "Erro ao enviar a requisição.";
      erro.classList.remove("hidden");
    } else {
      sucesso.textContent = data.mensagem || "Requisição enviada com sucesso!";
      sucesso.classList.remove("hidden");

      // Limpar lista de itens e inputs
      listaItens.innerHTML = "";
      document.getElementById("codigo_material").value = "";
      document.getElementById("quantidade_item").value = "";
      limparInfoMaterial();
    }

  } catch (e) {
    console.error("Erro ao enviar requisição:", e);
    erro.textContent = "Erro ao enviar requisição. Tente novamente.";
    erro.classList.remove("hidden");
  }
}


// 📦 Modal
function abrirModal() {
  const modal = document.getElementById("modalRequisicao");
  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    modal.classList.remove("hidden");
  }
}

function fecharModal() {
  const modal = document.getElementById("modalRequisicao");
  if (typeof modal.close === "function") {
    modal.close();
  } else {
    modal.classList.add("hidden");
  }
}

async function minhasRequisicoes() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const container = document.getElementById("minhasRequisicoes");
  container.innerHTML = `<p class="italic text-gray-500 dark:text-gray-400">Carregando...</p>`;

  if (!usuario || !usuario.id) {
    container.innerHTML = `<p class="text-red-500">Usuário não autenticado.</p>`;
    return;
  }

  try {
    const response = await fetch(`https://evoludesign.com.br/api-conipa/requisicoes/minhas-requisicoes.php?id_usuario=${usuario.id}`);
    const data = await response.json();

    if (!response.ok || data.erro) {
      container.innerHTML = `<p class="text-red-500">${data.erro || "Erro ao buscar requisições."}</p>`;
      return;
    }

    if (!data.requisicoes || data.requisicoes.length === 0) {
      container.innerHTML = `<p class="italic text-gray-500 dark:text-gray-400">Nenhuma requisição encontrada.</p>`;
      return;
    }

    // Modal fullscreen com blur no fundo
    let html = `
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-900 w-11/12 h-5/6 rounded-lg shadow-lg relative overflow-auto">
          
          <!-- Botão de fechar -->
          <button 
            class="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700 transition text-sm" 
            onclick="fecharHistorico()">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <!-- Tabela -->
          <table class="min-w-full border border-gray-300 dark:border-gray-700 rounded overflow-hidden mt-14">
            <thead class="bg-gray-200 dark:bg-gray-800 sticky top-0">
              <tr>
                <th class="px-4 py-2 border-b border-gray-300 dark:border-gray-700 text-left">Itens</th>
                <th class="px-4 py-2 border-b border-gray-300 dark:border-gray-700 text-left">Data</th>
                <th class="px-4 py-2 border-b border-gray-300 dark:border-gray-700 text-left">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900">
    `;

    // Popula as linhas
    data.requisicoes.forEach(req => {
      const itens = req.itens.map(i => `${i.codigo_material} (${i.quantidade})`).join(", ");
      html += `
        <tr class="hover:bg-gray-100 dark:hover:bg-gray-800">
          <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">${itens}</td>
          <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700">${req.criado_em}</td>
          <td class="px-4 py-2 border-b border-gray-300 dark:border-gray-700 capitalize">${req.status}</td>
        </tr>
      `;
    });

    // Fecha tabela e modal
    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;

  } catch (e) {
    console.error(e);
    container.innerHTML = `<p class="text-red-500">Erro ao buscar requisições.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", minhasRequisicoes);



// Função para mostrar apenas requisições pendentes
async function carregarRequisicoesPendentes() {
  document.getElementById("requisicoesPendentes").classList.remove("hidden");
  document.getElementById("minhasRequisicoes").classList.add("hidden");

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const container = document.getElementById("requisicoesPendentes");
  container.innerHTML = `<p class="italic text-gray-500 dark:text-gray-400">Carregando requisições pendentes...</p>`;

  try {
      const response = await fetch(`https://evoludesign.com.br/api-conipa/requisicoes/minhas-pendentes.php?${usuario.id}`); // ajuste a rota
      const requisicoes = await response.json();

      if (!requisicoes.length) {
          container.innerHTML = `<p class="italic text-gray-500 dark:text-gray-400">Nenhuma requisição pendente.</p>`;
          return;
      }

      let table = `
          <table class="w-full border-collapse border border-gray-300">
              <thead>
                  <tr class="bg-gray-100">
                      <th class="border border-gray-300 px-4 py-2">ID</th>
                      <th class="border border-gray-300 px-4 py-2">Descrição</th>
                      <th class="border border-gray-300 px-4 py-2">Status</th>
                      <th class="border border-gray-300 px-4 py-2">Data</th>
                  </tr>
              </thead>
              <tbody>
      `;

      requisicoes.forEach(r => {
          table += `
              <tr>
                  <td class="border border-gray-300 px-4 py-2">${r.id}</td>
                  <td class="border border-gray-300 px-4 py-2">${r.descricao}</td>
                  <td class="border border-gray-300 px-4 py-2">${r.status}</td>
                  <td class="border border-gray-300 px-4 py-2">${r.data}</td>
              </tr>
          `;
      });

      table += "</tbody></table>";
      container.innerHTML = table;

  } catch (err) {
      container.innerHTML = `<p class="text-red-500">Erro ao carregar requisições pendentes.</p>`;
  }
}



async function mostrarHistórico() {
  const container = document.getElementById("minhasRequisicoes");
  container.classList.remove("hidden");
}

async function fecharHistorico() {
  const container = document.getElementById("minhasRequisicoes");
  container.classList.add("hidden");
}