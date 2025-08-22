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

      if (
        info?.success &&
        Array.isArray(info.material) &&
        info.material.length > 0
      ) {
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
  document
    .getElementById("btnAdicionarItem")
    ?.addEventListener("click", adicionarItem);

  // 🚀 Enviar requisição
  document
    .getElementById("btnEnviarRequisicao")
    ?.addEventListener("click", enviarRequisicao);

  // 🎯 Abrir e fechar modal
  document
    .getElementById("btnAbrirModal")
    ?.addEventListener("click", abrirModal);
  document
    .getElementById("btnFecharModal")
    ?.addEventListener("click", fecharModal);
});

// 🧠 Buscar material via API
async function buscarMaterialPorCodigo(codigo) {
  if (!codigo) return null;

  try {
    const response = await fetch(
      "https://evoludesign.com.br/api-conipa/material/material-por-id.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codigo }),
      }
    );

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
    document
      .getElementById("codigo_material")
      .insertAdjacentElement("afterend", divInfo);
  }

  divInfo.innerHTML = `
                <strong>Material:</strong> ${material.descricao || "---"}<br>
                <strong>Grupo:</strong> ${material.grupo || "---"}<br>
                <strong>Código:</strong> ${material.codigo || "---"}
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
      quantidade: parseInt(qtd, 10),
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
  listaItens.querySelectorAll("p").forEach((p) => {
    const texto = p.textContent; // "Código: 12345, Quantidade: 10"
    const match = texto.match(/Código:\s*(\S+),\s*Quantidade:\s*(\d+)/);
    if (match) {
      itens.push({
        codigo_material: match[1],
        quantidade: parseInt(match[2], 10),
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
      itens,
    };

    const response = await fetch(
      "https://evoludesign.com.br/api-conipa/requisicoes/criar.php",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

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


function formatarDataBR(dataStr) {
  if (!dataStr) return "";
  const [data] = dataStr.split(" "); // pega só a parte da data
  const [ano, mes, dia] = data.split("-");
  return `${dia}-${mes}-${ano}`;
}






let paginaAtual = 1;
let buscaCodigo = "";
let buscaData = "";

async function minhasRequisicoes() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const container = document.getElementById("minhasRequisicoes");
  container.innerHTML = `<p class="italic text-gray-500 dark:text-gray-400">Carregando...</p>`;

  if (!usuario || !usuario.id) {
    container.innerHTML = `<p class="text-red-500">Usuário não autenticado.</p>`;
    return;
  }

  try {
    // Monta a URL com paginação e filtros
    let url = `https://evoludesign.com.br/api-conipa/requisicoes/minhas-requisicoes.php?id_usuario=${usuario.id}&pagina=${paginaAtual}&limite=5`;
    if (buscaCodigo) url += `&codigo=${encodeURIComponent(buscaCodigo)}`;
    if (buscaData) url += `&data=${encodeURIComponent(buscaData)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.erro) {
      container.innerHTML = `<p class="text-red-500">${
        data.erro || "Erro ao buscar requisições."
      }</p>`;
      return;
    }

    if (!data.requisicoes || data.requisicoes.length === 0) {
      container.innerHTML = `
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-900 w-11/12 h-5/6 rounded-lg shadow-lg relative overflow-auto">
            <button 
              class="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700 transition text-sm" 
              onclick="fecharHistorico()">
              <i class="fa-solid fa-xmark"></i>
            </button>
            <p class="italic text-gray-500 dark:text-gray-400 mt-16 text-center">Nenhuma requisição encontrada.</p>
          </div>
        </div>
      `;
      return;
    }

    // --- Modal com campos de busca + tabela ---
    let html = `
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-900 w-11/12 h-5/6 rounded-lg shadow-lg relative overflow-auto">

          <!-- Botão de fechar -->
          <button 
            class="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded shadow hover:bg-red-700 transition text-sm" 
            onclick="fecharHistorico()">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <!-- Campos de busca -->
          <div class="p-4 mt-10 flex gap-4">
            <input id="buscaCodigoInput" 
              type="text" 
              placeholder="Buscar por código..." 
              value="${buscaCodigo}"
              class="border px-3 py-2 rounded w-1/2 dark:bg-gray-800 dark:text-white" 
              onkeyup="aplicarBuscaCodigo(this.value)" />

            <input id="buscaDataInput"
              type="date"
              value="${buscaData}"
              class="border px-3 py-2 rounded w-1/2 dark:bg-gray-800 dark:text-white"
              onchange="aplicarBuscaData(this.value)" />
          </div>

          <!-- Tabela -->
          <table class="min-w-full border border-gray-300 dark:border-gray-700 rounded overflow-hidden mt-2">
            <thead class="bg-gray-200 dark:bg-gray-800 sticky top-0">
              <tr>
                <th class="px-4 py-2 border-b text-left">Itens</th>
                <th class="px-4 py-2 border-b text-left">Data</th>
                <th class="px-4 py-2 border-b text-left">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-900">
    `;

    // Linhas da tabela
    data.requisicoes.forEach((req) => {
      const itens = req.itens
        .map((i) => `${i.codigo_material} (${i.quantidade})`)
        .join(", ");
      html += `
        <tr class="hover:bg-gray-100 dark:hover:bg-gray-800">
          <td class="px-4 py-2 border-b">${itens}</td>
          <td class="px-4 py-2 border-b">${formatarDataBR(req.criado_em)}</td>
          <td class="px-4 py-2 border-b capitalize">${req.status}</td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>

          <!-- Paginação -->
          <div class="flex justify-between items-center p-4">
            <button 
              class="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
              onclick="paginaAnterior()" 
              ${!data.paginacao.tem_anterior ? "disabled" : ""}>
              ← Anterior
            </button>

            <span class="text-sm dark:text-gray-300">
              Página ${data.paginacao.pagina_atual} de ${
      data.paginacao.total_paginas
    }
            </span>

            <button 
              class="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
              onclick="proximaPagina()" 
              ${!data.paginacao.tem_proximo ? "disabled" : ""}>
              Próxima →
            </button>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  } catch (e) {
    console.error(e);
    container.innerHTML = `<p class="text-red-500">Erro ao buscar requisições.</p>`;
  }
}

// Funções auxiliares
function aplicarBuscaCodigo(valor) {
  buscaCodigo = valor;
  paginaAtual = 1;
  minhasRequisicoes();
}

function aplicarBuscaData(valor) {
  buscaData = valor;
  paginaAtual = 1;
  minhasRequisicoes();
}

function proximaPagina() {
  paginaAtual++;
  minhasRequisicoes();
}

function paginaAnterior() {
  if (paginaAtual > 1) {
    paginaAtual--;
    minhasRequisicoes();
  }
}

document.addEventListener("DOMContentLoaded", minhasRequisicoes);

async function mostrarHistórico() {
  const container = document.getElementById("minhasRequisicoes");
  container.classList.remove("hidden");
}

async function fecharHistorico() {
  const container = document.getElementById("minhasRequisicoes");
  container.classList.add("hidden");
}

let paginaMaterial = 1;
const limiteMaterial = 10;

async function verMaterial(pagina = 1) {
  paginaMaterial = pagina;

  const tituloMaterial = document.getElementById("tituloMaterial");
  tituloMaterial.textContent = "Material Disponível";
  const modal = document.getElementById("Material");
  const tabela = document.getElementById("tabelaMaterial");

  tabela.innerHTML = `
        <tr>
            <td colspan="8" class="p-4 text-center italic text-gray-500">Carregando...</td>
        </tr>
    `;

  try {
    const response = await fetch(
      `https://evoludesign.com.br/api-conipa/material/listar-material.php?page=${paginaMaterial}&limite=${limiteMaterial}`
    );
    const data = await response.json();

    if (data.success) {
      if (!data.data || data.data.length === 0) {
        tabela.innerHTML = `
                    <tr>
                        <td colspan="8" class="p-4 text-center italic text-gray-500">Nenhum material encontrado.</td>
                    </tr>
                `;
      } else {
        tabela.innerHTML = "";

        data.data.forEach((mat) => {
          const row = `
                        <tr class="hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <td class="px-4 py-2">${mat.codigo}</td>
                            <td class="px-4 py-2">${mat.descricao}</td>
                            <td class="px-4 py-2">${mat.grupo}</td>
                            <td>
                              

                                <button onclick="copiarCodigo('${mat.codigo}')" 
        class="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700">
    Copiar Código
</button>

                            </td>
                        </tr>
                    `;
          tabela.insertAdjacentHTML("beforeend", row);
        });

        // Paginação compacta (máx 5 páginas)
        const totalPaginas = data.total_pages;
        const paginaAtual = data.page;
        const maxPaginasVisiveis = 5;

        let inicioPagina = Math.max(
          1,
          paginaAtual - Math.floor(maxPaginasVisiveis / 2)
        );
        let fimPagina = inicioPagina + maxPaginasVisiveis - 1;

        if (fimPagina > totalPaginas) {
          fimPagina = totalPaginas;
          inicioPagina = Math.max(1, fimPagina - maxPaginasVisiveis + 1);
        }

        let paginacaoHTML = `<tr><td colspan="8" class="px-4 py-2 text-center"><div class="flex justify-center gap-2 mt-4">`;

        // Botão Anterior
        if (paginaAtual > 1) {
          paginacaoHTML += `
                        <button onclick="verMaterial(${paginaAtual - 1})"
                                class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 dark:text-white">
                            Anterior
                        </button>
                    `;
        }

        // Botões de páginas
        for (let i = inicioPagina; i <= fimPagina; i++) {
          paginacaoHTML += `
                        <button onclick="verMaterial(${i})"
                                class="px-3 py-1 rounded ${
                                  i === paginaAtual
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-600 dark:text-white"
                                }">
                            ${i}
                        </button>
                    `;
        }

        // Botão Próximo
        if (paginaAtual < totalPaginas) {
          paginacaoHTML += `
                        <button onclick="verMaterial(${paginaAtual + 1})"
                                class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 dark:text-white">
                            Próximo
                        </button>
                    `;
        }

        paginacaoHTML += `</div></td></tr>`;
        tabela.insertAdjacentHTML("beforeend", paginacaoHTML);
      }
    } else {
      tabela.innerHTML = `
                <tr>
                    <td colspan="8" class="p-4 text-center text-red-600">Erro ao carregar dados da API.</td>
                </tr>
            `;
    }
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    tabela.innerHTML = `
            <tr>
                <td colspan="8" class="p-4 text-center text-red-600">Erro ao carregar materiais.</td>
            </tr>
        `;
  }

  // Abrir modal
  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    modal.classList.remove("hidden");
  }
}

function copiarCodigo(codigo) {
  navigator.clipboard
    .writeText(codigo)
    .then(() => {
      alert(`Código "${codigo}" copiado para a área de transferência!`);
    })
    .catch((err) => {
      console.error("Erro ao copiar código:", err);
      alert("Não foi possível copiar o código.");
    });
}

let paginaPendentes = 1;
const limitePendentes = 5;

async function RequisicoesPendentes() {
  const tituloMaterial = document.getElementById("tituloPendentes");
  tituloMaterial.textContent = "Requisições Pendentes";

  const modal = document.getElementById("Pendentes");
  const tabela = document.getElementById("tabelaPendentes");

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario || !usuario.id) {
    tabela.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-red-600">Usuário não autenticado.</td></tr>`;
    return;
  }

  tabela.innerHTML = `<tr><td colspan="8" class="p-4 text-center italic text-gray-500 dark:text-gray-400">Carregando requisições pendentes...</td></tr>`;

  try {
    const response = await fetch(
      `https://evoludesign.com.br/api-conipa/requisicoes/minhas-pendentes.php?id_usuario=${usuario.id}&pagina=${paginaPendentes}&limite=${limitePendentes}`
    );
    const data = await response.json();

    if (!data.requisicoes || data.requisicoes.length === 0) {
      tabela.innerHTML = `<tr><td colspan="8" class="p-4 text-center italic text-gray-500 dark:text-gray-400">Nenhuma requisição pendente.</td></tr>`;
      return;
    }

    // Limpa tabela
    tabela.innerHTML = "";

    // Popula tabela
    data.requisicoes.forEach((req) => {
      const itens = req.itens.map(i => `${i.codigo_material} (${i.quantidade})`).join(", ");
      const row = `
        <tr class="hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          
          
          <td class="px-4 py-2">${itens}</td>
          <td class="px-4 py-2">${formatarDataBR(req.criado_em)}</td>
          <td class="px-4 py-2">${req.status}</td>
          
        </tr>
      `;
      tabela.insertAdjacentHTML("beforeend", row);
    });

    // Paginação compacta
    const totalPaginas = data.paginacao.total_paginas;
    const paginaAtual = data.paginacao.pagina_atual;
    const maxPaginasVisiveis = 5;

    let inicioPagina = Math.max(1, paginaAtual - Math.floor(maxPaginasVisiveis / 2));
    let fimPagina = inicioPagina + maxPaginasVisiveis - 1;
    if (fimPagina > totalPaginas) {
      fimPagina = totalPaginas;
      inicioPagina = Math.max(1, fimPagina - maxPaginasVisiveis + 1);
    }

    let paginacaoHTML = `<tr><td colspan="8" class="px-4 py-2 text-center"><div class="flex justify-center gap-2 mt-4">`;

    if (data.paginacao.tem_anterior) {
      paginacaoHTML += `<button onclick="paginaAnteriorPendentes()" class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 dark:text-white">← Anterior</button>`;
    }

    for (let i = inicioPagina; i <= fimPagina; i++) {
      paginacaoHTML += `<button onclick="irParaPaginaPendentes(${i})" class="px-3 py-1 rounded ${i === paginaAtual ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-600 dark:text-white"}">${i}</button>`;
    }

    if (data.paginacao.tem_proximo) {
      paginacaoHTML += `<button onclick="proximaPaginaPendentes()" class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 dark:text-white">Próxima →</button>`;
    }

    paginacaoHTML += `</div></td></tr>`;
    tabela.insertAdjacentHTML("beforeend", paginacaoHTML);

  } catch (err) {
    console.error("Erro ao buscar dados:", err);
    tabela.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-red-600">Erro ao carregar requisições pendentes.</td></tr>`;
  }

  // Abrir modal
  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    modal.classList.remove("hidden");
  }
}

// Funções de paginação
function proximaPaginaPendentes() {
  paginaPendentes++;
  RequisicoesPendentes();
}

function paginaAnteriorPendentes() {
  if (paginaPendentes > 1) {
    paginaPendentes--;
    RequisicoesPendentes();
  }
}

function irParaPaginaPendentes(pagina) {
  paginaPendentes = pagina;
  RequisicoesPendentes();
}
