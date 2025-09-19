import { API_BASE } from "../js/config/config.js";

const titulo = document.getElementById("titulo");
const Api = API_BASE;

// Função para formatar data YYYY-MM-DD HH:MM:SS → DD-MM-YYYY
function formatarDataBR(dataStr) {
  if (!dataStr) return "";
  const [data] = dataStr.split(" "); // pega só a parte da data
  const [ano, mes, dia] = data.split("-");
  return `${dia}-${mes}-${ano}`;
}

let paginaAtualModal = 1; // controla a página atual
const limiteModal = 10; // itens por página

async function abrirModal(pagina = 1) {
  paginaAtualModal = pagina;

  const modal = document.getElementById("modalRequisicao");
  const tabela = document.getElementById("tabelaRequisicoes");

  titulo.textContent = "Todas as Requisições";
  tabela.innerHTML = `<tr><td colspan="8" class="p-4 text-center italic text-gray-500">Carregando...</td></tr>`;

  try {
    // Ajuste: enviar parâmetros que o PHP espera
    const response = await fetch(
      // `https://evoludesign.com.br/api-conipa/requisicoes/lsitar.php?pagina=${pagina}&por_pagina=${limiteModal}`
      `${API_BASE}requisicoes/lsitar.php?pagina=${pagina}&por_pagina=${limiteModal}`
    );
    const data = await response.json();

    if (data.success) {
      if (!data.requisicoes || data.requisicoes.length === 0) {
        tabela.innerHTML = `<tr><td colspan="8" class="p-4 text-center italic text-gray-500">Nenhuma requisição encontrada.</td></tr>`;
      } else {
        tabela.innerHTML = "";

        // Renderiza linhas
        data.requisicoes.forEach((req) => {
          const itensHtml = Array.isArray(req.itens)
            ? req.itens
                .map(
                  (item) =>
                    `
                  <div class="mb-1">• ${item.codigo_material} (Qtd: ${item.quantidade})</div>
                  `
                )
                .join("")
            : '<span class="italic text-gray-400">Sem itens</span>';

          const row = `
            <tr class="hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-base">
                <td class="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">${
                  req.n_requisicao ? req.n_requisicao : "-"
                }</td>
                <td class="px-4 py-2">${req.nome}</td>
                <td class="px-4 py-2">${req.setor}</td>
                <td class="px-4 py-2">${req.re}</td>
                <td class="px-4 py-2 uppercase">${req.status}</td>
                <td class="px-4 py-2">${formatarDataBR(req.criado_em)}</td>
                <td class="px-4 py-2 max-w-[350px] whitespace-normal break-words">${itensHtml}</td>
                <td class="px-4 py-2">
                    <button onclick="excluirReqGeral(${req.id})" 
                        class="bg-red-600 text-white px-4 py-2 rounded-lg text-base font-medium hover:bg-red-700 transition">
                        Excluir
                    </button>
                </td>
                <td class="px-4 py-2 text-center">
                  <input type="checkbox" 
                         ${req.pago == 1 ? "checked" : ""} 
                         onchange="atualizarPagamento(${
                           req.id
                         }, this.checked ? 1 : 0)">
              </td>
            </tr>
        `;

          tabela.insertAdjacentHTML("beforeend", row);
        });

        // Paginação
        const totalPaginas = data.total_paginas;
        const paginaAtual = data.pagina_atual;

        let paginacaoHTML = `<tr><td colspan="8" class="px-4 py-2 text-center"><div class="flex justify-center gap-2 mt-4">`;

        // Botão Anterior
        paginacaoHTML += `<button ${
          paginaAtual === 1 ? "disabled" : ""
        } onclick="abrirModal(${
          paginaAtual - 1
        })" class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 dark:text-white">Anterior</button>`;

        // Páginas visíveis (máx 5)
        let startPage = Math.max(paginaAtual - 2, 1);
        let endPage = Math.min(startPage + 4, totalPaginas);

        for (let i = startPage; i <= endPage; i++) {
          paginacaoHTML += `<button onclick="abrirModal(${i})" class="px-3 py-1 rounded ${
            i === paginaAtual
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-600 dark:text-white"
          }">${i}</button>`;
        }

        // Botão Próximo
        paginacaoHTML += `<button ${
          paginaAtual === totalPaginas ? "disabled" : ""
        } onclick="abrirModal(${
          paginaAtual + 1
        })" class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 dark:text-white">Próximo</button>`;

        paginacaoHTML += `</div></td></tr>`;
        tabela.insertAdjacentHTML("beforeend", paginacaoHTML);
      }
    } else {
      tabela.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-red-600">Erro ao carregar dados da API.</td></tr>`;
    }

    if (typeof modal.showModal === "function") modal.showModal();
    else modal.classList.remove("hidden");
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    tabela.innerHTML = `<tr><td colspan="8" class="p-4 text-center text-red-600">Erro ao carregar requisições.</td></tr>`;
  }
}

window.abrirModal = abrirModal;

async function excluirReqGeral(id) {
  let confirmacao = confirm("Realmente deseja excluir essa requisição?");

  if (confirmacao) {
    try {
      let response = await fetch(
        // "https://evoludesign.com.br/api-conipa/requisicoes/excluir.php",
        `${API_BASE}requisicoes/excluir.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_requisicao: id }),
        }
      );

      let resultado = await response.json();

      if (resultado.success) {
        alert("Requisição excluída com sucesso!");
        // ✅ Atualiza a tabela automaticamente na mesma página
        abrirModal(paginaAtualModal);
      } else {
        alert(
          "Erro ao excluir a requisição: " +
            (resultado.message || "Tente novamente.")
        );
        console.error("Erro:", resultado);
      }
    } catch (error) {
      alert("Erro de conexão com a API.");
      console.error("Erro de rede:", error);
    }
  } else {
    console.log("Exclusão cancelada. ID:", id);
  }
}

window.excluirReqGeral = excluirReqGeral;

let paginaAtualPendentes = 1;
const limitePendentes = 10; // 10 itens por página

async function abrirModalPendentes(pagina = 1, filtros = {}) {
  paginaAtualPendentes = pagina;

  const titulopen = document.getElementById("titulopen");
  const modal = document.getElementById("modalRequisicaoPendente");
  const tabela = document.getElementById("tabelaRequisicoesPendentes");
  titulopen.textContent = "Requisições Pendentes";

  tabela.innerHTML = `
        <tr>
            <td colspan="8" class="p-4 text-center italic text-gray-500">Carregando...</td>
        </tr>
    `;

  try {
    // Monta a querystring com pagina, limite e filtros
    // let url = `https://evoludesign.com.br/api-conipa/requisicoes/pendentes.php?pagina=${pagina}&limite=${limitePendentes}`;
    let url = `${API_BASE}requisicoes/pendentes.php?pagina=${pagina}&limite=${limitePendentes}`;

    if (filtros.setor) url += `&setor=${encodeURIComponent(filtros.setor)}`;
    if (filtros.usuario) url += `&nome=${encodeURIComponent(filtros.usuario)}`;
    if (filtros.data_inicial)
      url += `&data_inicial=${encodeURIComponent(filtros.data_inicial)}`;
    if (filtros.data_final)
      url += `&data_final=${encodeURIComponent(filtros.data_final)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.success) {
      tabela.innerHTML = `
                <tr>
                    <td colspan="8" class="p-4 text-center text-red-600">Erro ao carregar dados da API.</td>
                </tr>
            `;
      return;
    }

    const requisicoes = data.requisicoes || [];
    const totalPaginas = data.total_paginas || 1;

    if (requisicoes.length === 0) {
      tabela.innerHTML = `
                <tr>
                    <td colspan="8" class="p-4 text-center italic text-gray-500">Nenhuma requisição encontrada.</td>
                </tr>
            `;
    } else {
      tabela.innerHTML = "";

      requisicoes.forEach((req) => {
        const itensHtml = Array.isArray(req.itens)
          ? `<div class="max-h-48 overflow-y-auto flex flex-col gap-1">
              ${req.itens
                .map(
                  (item) => `
                <div class="inline-block p-2 border rounded bg-gray-50 text-sm 
                            dark:bg-zinc-800 dark:border-zinc-900 shadow-sm">
                  <p class="font-semibold text-gray-800 dark:text-gray-50 mb-0">
                    ${item.descricao}
                  </p>
                  <p class="text-gray-500 dark:text-gray-300 text-xs mb-0">
                    ${item.grupo} | Cód: ${item.codigo_material}
                  </p>
                  <p class="text-gray-500 dark:text-gray-300 text-xs mb-0">
                    Qtd: <strong>${item.quantidade}</strong>
                  </p>
                </div>`
                )
                .join("")}
            </div>`
          : '<span class="italic text-gray-400">Sem itens</span>';

        const row = `
          <tr class="hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <td class="px-4 py-2">
                  <input type="text" id="nReq-${req.id}" 
                         class="border border-gray-300 rounded px-2 py-1 w-24 text-sm text-center dark:bg-stone-900 dark:text-white"
                         placeholder="Nº Req">
              </td>
      
              <td class="px-4 py-2 whitespace-nowrap">${req.nome}</td>
              <td class="px-4 py-2 whitespace-nowrap">${req.setor}</td>
              <td class="px-4 py-2 whitespace-nowrap">
  ${formatarDataBR(req.criado_em)}
</td>

      
              <td class="px-4 py-2 max-w-full">${itensHtml}</td>
      
              <td class="">
                  <button onclick="alterarStatus(${req.id}, 'aprovado')" 
                      class="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700">Aprovar</button>
                  <button onclick="alterarStatus(${req.id}, 'rejeitado')" 
                      class="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700">Rejeitar</button>
              </td>
      
              <td class="px-4 py-2 text-center">
                  <input type="checkbox" 
                         ${req.pago == 1 ? "checked" : ""} 
                         onchange="atualizarPagamento(${
                           req.id
                         }, this.checked ? 1 : 0)">
              </td>
          </tr>
        `;

        tabela.insertAdjacentHTML("beforeend", row);
      });

      // Paginação (mantendo filtros)
      let paginacaoHTML = `<tr><td colspan="8" class="p-4 text-center"><div class="flex justify-center gap-2">`;

      // Botão Anterior
      if (paginaAtualPendentes > 1) {
        paginacaoHTML += `<button onclick='abrirModalPendentes(${
          paginaAtualPendentes - 1
        }, ${JSON.stringify(
          filtros
        )})' class="px-3 py-1 bg-gray-300 rounded">Anterior</button>`;
      }

      // Definindo range de páginas visíveis (máx 5)
      let maxBotoes = 5;
      let startPage = Math.max(
        1,
        paginaAtualPendentes - Math.floor(maxBotoes / 2)
      );
      let endPage = startPage + maxBotoes - 1;

      if (endPage > totalPaginas) {
        endPage = totalPaginas;
        startPage = Math.max(1, endPage - maxBotoes + 1);
      }

      // Botões das páginas
      for (let i = startPage; i <= endPage; i++) {
        paginacaoHTML += `<button onclick='abrirModalPendentes(${i}, ${JSON.stringify(
          filtros
        )})' class="px-3 py-1 rounded ${
          i === paginaAtualPendentes ? "bg-blue-600 text-white" : "bg-gray-200"
        }'>${i}</button>`;
      }

      // Botão Próxima
      if (paginaAtualPendentes < totalPaginas) {
        paginacaoHTML += `<button onclick='abrirModalPendentes(${
          paginaAtualPendentes + 1
        }, ${JSON.stringify(
          filtros
        )})' class="px-3 py-1 bg-gray-300 rounded">Próxima</button>`;
      }

      paginacaoHTML += `</div></td></tr>`;
      tabela.insertAdjacentHTML("beforeend", paginacaoHTML);
    }

    // Abrir modal
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    tabela.innerHTML = `
            <tr>
                <td colspan="8" class="p-4 text-center text-red-600">Erro ao carregar requisições.</td>
            </tr>
        `;
  }
}

window.abrirModalPendentes = abrirModalPendentes;

function aplicarFiltrosPendentes() {
  const filtros = {
    setor: document.getElementById("filtroSetor").value,
    usuario: document.getElementById("filtroUsuario").value,
    data_inicial: document.getElementById("filtroDataInicial").value,
    data_final: document.getElementById("filtroDataFinal").value,
  };

  abrirModalPendentes(1, filtros);
}

window.aplicarFiltrosPendentes = aplicarFiltrosPendentes;

function resetarFiltrosPendentes() {
  document.getElementById("filtroSetor").value = "";
  document.getElementById("filtroUsuario").value = "";
  document.getElementById("filtroDataInicial").value = "";
  document.getElementById("filtroDataFinal").value = "";

  abrirModalPendentes(1, {}); // volta sem filtro
}

window.resetarFiltrosPendentes = resetarFiltrosPendentes;

async function atualizarPagamento(id, pago) {
  try {
    const response = await fetch(
      // "https://evoludesign.com.br/api-conipa/requisicoes/pago.php",
      `${API_BASE}requisicoes/pago.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: id,
          pago: pago,
        }),
      }
    );

    const result = await response.json();

    if (response.ok && result.sucesso) {
      console.log("Pagamento atualizado:", result.mensagem);
    } else {
      alert(result.erro || "Erro ao atualizar pagamento.");
      // recarrega a tabela pra não deixar checkbox errado
      abrirModalPendentes(paginaAtualPendentes);
    }
  } catch (error) {
    console.error("Erro no fetch:", error);
    alert("Erro na comunicação com a API.");
    abrirModalPendentes(paginaAtualPendentes);
  }
}

window.atualizarPagamento = atualizarPagamento;

// Função para aprovar/rejeitar
async function alterarStatus(id, status) {
  const nRequisicao = document.getElementById(`nReq-${id}`).value || null;

  try {
    const response = await fetch(
      // "https://evoludesign.com.br/api-conipa/requisicoes/aprovar-requisicao.php",
      `${API_BASE}requisicoes/aprovar-requisicao.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_requisicao: id,
          status_requisicao: status,
          n_requisicao: nRequisicao,
        }),
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      alert(result.mensagem);
      // Recarrega a tabela na mesma página da paginação
      abrirModalPendentes(paginaAtualPendentes);
    } else {
      alert(result.erro || "Erro ao atualizar requisição.");
    }
  } catch (error) {
    console.error("Erro no fetch:", error);
    alert("Erro na comunicação com a API.");
  }
}

window.alterarStatus = alterarStatus;

let paginaAtualUsuarios = 1; // controla a página atual
const limiteUsuarios = 10; // registros por página

async function UsuariosPendentes(pagina = 1) {
  paginaAtualUsuarios = pagina;

  const modal = document.getElementById("modalUsuariosPendentes");
  const tabela = document.getElementById("tabelaUsuariosPendentes");
  const titulo2 = document.getElementById("tituloUsuariosPendentes");
  titulo2.textContent = "Pré-Cadastro de Usuários";

  tabela.innerHTML = `
        <tr>
            <td colspan="7" class="p-4 text-center italic text-gray-500">Carregando...</td>
        </tr>
    `;

  try {
    // ✅ agora os nomes batem com os do PHP
    const response = await fetch(
      `${Api}/usuarios/listar-pendentes.php?page=${pagina}&limit=${limiteUsuarios}`
    );
    const data = await response.json();

    if (data.success) {
      if (!data.usuarios || data.usuarios.length === 0) {
        tabela.innerHTML = `
                    <tr>
                        <td colspan="7" class="p-4 text-center italic text-gray-500">
                            Nenhum usuário pendente encontrado.
                        </td>
                    </tr>
                `;
      } else {
        tabela.innerHTML = "";
        data.usuarios.forEach((user) => {
          const row = `
                        <tr class="hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            
                            <td class="px-4 py-2">${user.nome}</td>
                            <td class="px-4 py-2">${user.setor || "-"}</td>
                            <td class="px-4 py-2">${user.re || "-"}</td>
                            <td class="px-4 py-2">
                                <select id="acao_${
                                  user.id
                                }" class="border rounded p-1 text-sm">
                                    <option value="pendente" ${
                                      user.status === "pendente"
                                        ? "selected"
                                        : ""
                                    }>Pendente</option>
                                    <option value="aprovar" ${
                                      user.status === "aprovado"
                                        ? "selected"
                                        : ""
                                    }>Aprovado</option>
                                    <option value="rejeitar" ${
                                      user.status === "rejeitado"
                                        ? "selected"
                                        : ""
                                    }>Rejeitado</option>
                                </select>
                            </td>
                            <td class="px-4 py-2">
                                <select id="tipo_${
                                  user.id
                                }" class="border rounded p-1 text-sm">
                                    <option value="admin" ${
                                      user.tipo === "admin" ? "selected" : ""
                                    }>Administrador</option>
                                    <option value="usuario" ${
                                      user.tipo === "usuario" ? "selected" : ""
                                    }>Usuário</option>
                                </select>
                            </td>
                            <td class="px-4 py-2">
                                <button 
                                    class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                                    onclick="atualizarStatus(${user.id})">
                                    Atualizar
                                </button>
                            </td>
                        </tr>
                    `;
          tabela.insertAdjacentHTML("beforeend", row);
        });

        // ✅ Paginação corrigida
        const totalPaginas = data.totalPaginas;
        const paginaAtual = data.page;

        let paginacaoHTML = `<tr><td colspan="7" class="px-4 py-2 text-center"><div class="flex justify-center gap-2 mt-4">`;

        // Botão Anterior
        paginacaoHTML += `<button ${
          paginaAtual === 1 ? "disabled" : ""
        } onclick="UsuariosPendentes(${
          paginaAtual - 1
        })" class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 dark:text-white">Anterior</button>`;

        // Páginas visíveis (máx 5)
        let startPage = Math.max(paginaAtual - 2, 1);
        let endPage = Math.min(startPage + 4, totalPaginas);

        for (let i = startPage; i <= endPage; i++) {
          paginacaoHTML += `<button onclick="UsuariosPendentes(${i})" class="px-3 py-1 rounded ${
            i === paginaAtual
              ? "bg-blue-600 text-white"
              : "bg-gray-200 dark:bg-gray-600 dark:text-white"
          }">${i}</button>`;
        }

        // Botão Próximo
        paginacaoHTML += `<button ${
          paginaAtual === totalPaginas ? "disabled" : ""
        } onclick="UsuariosPendentes(${
          paginaAtual + 1
        })" class="px-3 py-1 rounded bg-gray-200 dark:bg-gray-600 dark:text-white">Próximo</button>`;

        paginacaoHTML += `</div></td></tr>`;
        tabela.insertAdjacentHTML("beforeend", paginacaoHTML);
      }
    } else {
      tabela.innerHTML = `
                <tr>
                    <td colspan="7" class="p-4 text-center text-red-600">Erro ao carregar usuários.</td>
                </tr>
            `;
    }

    // Abrir modal
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.classList.remove("hidden");
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    tabela.innerHTML = `
            <tr>
                <td colspan="7" class="p-4 text-center text-red-600">
                    Erro ao carregar usuários pendentes.
                </td>
            </tr>
        `;
  }
}

window.UsuariosPendentes = UsuariosPendentes;

async function atualizarStatus(userId) {
  const acao = document.getElementById(`acao_${userId}`).value;
  const tipo = document.getElementById(`tipo_${userId}`).value;

  try {
    const response = await fetch(Api + "/usuarios/aprovar_pre_cadastro.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: userId,
        acao: acao,
        tipo: tipo,
      }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Usuário atualizado com sucesso!");
      UsuariosPendentes(); // recarrega a lista
    } else {
      alert(
        "Erro: " +
          (data.erro || data.mensagem || "Ocorreu um erro desconhecido.")
      );
    }
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    alert("Erro ao atualizar usuário.");
  }
}

window.atualizarStatus = atualizarStatus;

let paginaMaterial = 1;
const limiteMaterial = 10;

async function verMaterial(pagina = 1, search = "") {
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
    let url = `${API_BASE}material/listar-material.php?page=${paginaMaterial}&limite=${limiteMaterial}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url);
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
                  <button onclick="excluirMaterial(${mat.id})" 
                          class="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700">
                      Excluir
                  </button>
                  <button onclick="copiarCodigo('${mat.codigo}')" 
                          class="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700">
                      Copiar Código
                  </button>
                </td>
            </tr>
          `;
          tabela.insertAdjacentHTML("beforeend", row);
        });

        // 🔹 Renderizar paginação (nova parte)
        renderPaginacao(data.page, data.total_pages, search);
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

window.verMaterial = verMaterial;

// Função de paginação dinâmica (máx. 5 botões)
function renderPaginacao(paginaAtual, totalPaginas, search = "") {
  const paginacaoContainer = document.getElementById("paginacaoMaterial");
  paginacaoContainer.innerHTML = "";

  if (totalPaginas <= 1) return;

  const maxBotoes = 5;
  let inicio = Math.max(1, paginaAtual - Math.floor(maxBotoes / 2));
  let fim = inicio + maxBotoes - 1;

  if (fim > totalPaginas) {
    fim = totalPaginas;
    inicio = Math.max(1, fim - maxBotoes + 1);
  }

  // Botão Anterior
  if (paginaAtual > 1) {
    paginacaoContainer.innerHTML += `
      <button class="px-3 py-1 mx-1 bg-gray-300 rounded hover:bg-gray-400"
        onclick="verMaterial(${paginaAtual - 1}, '${search}')">Anterior</button>
    `;
  }

  // Botões numéricos
  for (let i = inicio; i <= fim; i++) {
    paginacaoContainer.innerHTML += `
      <button class="px-3 py-1 mx-1 ${
        i === paginaAtual
          ? "bg-blue-600 text-white"
          : "bg-gray-300 hover:bg-gray-400"
      } rounded"
        onclick="verMaterial(${i}, '${search}')">${i}</button>
    `;
  }

  // Botão Próximo
  if (paginaAtual < totalPaginas) {
    paginacaoContainer.innerHTML += `
      <button class="px-3 py-1 mx-1 bg-gray-300 rounded hover:bg-gray-400"
        onclick="verMaterial(${paginaAtual + 1}, '${search}')">Próximo</button>
    `;
  }
}

window.renderPaginacao = renderPaginacao;

function buscarMaterial() {
  const search = document.getElementById("searchMaterial").value;
  verMaterial(1, search);
}

window.buscarMaterial = buscarMaterial;

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

window.copiarCodigo = copiarCodigo;

async function excluirMaterial(id) {
  let confirmacao = confirm("Realmente deseja excluir este material?");

  if (!confirmacao) {
    console.log("Exclusão cancelada. ID:", id);
    return;
  }

  try {
    const response = await fetch(
      // "https://evoludesign.com.br/api-conipa/material/delete.php",
      `${API_BASE}material/delete.php`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_material: id }),
      }
    );

    const resultado = await response.json();

    if (resultado.success) {
      alert("Material excluído com sucesso!");
      console.log("Resposta da API:", resultado);
      // Recarregar a lista de materiais após exclusão
      verMaterial(paginaMaterial); // função que renderiza a tabela de materiais
    } else {
      alert(
        "Erro ao excluir material: " + (resultado.message || "Tente novamente.")
      );
      console.error("Erro:", resultado);
    }
  } catch (error) {
    alert("Erro de conexão com a API.");
    console.error("Erro de rede:", error);
  }
}

window.excluirMaterial = excluirMaterial;

async function OpenAddMaterial() {
  const modal = document.getElementById("adicionarMaterial");

  // Abrir modal
  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    modal.classList.remove("hidden");
  }
}
window.OpenAddMaterial = OpenAddMaterial;

async function adicionarMaterial() {
  let codigo = document.getElementById("codigo_material").value;
  let descricao = document.getElementById("descricao_material").value;
  let grupo = document.getElementById("grupo_material").value;

  try {
    const response = await fetch(`${API_BASE}material/adicionar.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, descricao, grupo }),
    });

    const resposta = await response.json();
    if (resposta.sucess) {
      alert("Material Adicionado com Sucesso");
      console.log(resposta);
    } else {
      alert("Erro ao Adicionar Material");
      console.log(resposta);
    }
  } catch ($e) {}

  console.log(codigo, descricao, grupo);
}

window.adicionarMaterial = adicionarMaterial;

let paginaAtualUserGeral = 1;
const limiteUserGeral = 10; // 10 itens por página

async function usuariosGeral(pagina = 1) {
  paginaAtualUserGeral = pagina;

  const modal = document.getElementById("UsuariosGeral");
  const tabela = document.getElementById("tabelaUsuariosGeral");
  const titulo = document.getElementById("tituloUsuarios");

  titulo.textContent = "Lista de Usuários";

  tabela.innerHTML = `
        <tr>
            <td colspan="8" class="p-4 text-center italic text-gray-500">Carregando...</td>
        </tr>
    `;

  try {
    const response = await fetch(
      `${API_BASE}usuarios/listar-todos.php?pagina=${pagina}&limite=${limiteUserGeral}`
    );
    const data = await response.json();

    if (!data.success) {
      tabela.innerHTML = `
                <tr>
                    <td colspan="8" class="p-4 text-center text-red-600">Erro ao carregar dados da API.</td>
                </tr>
            `;
      return;
    }

    const usuarios = data.usuarios || [];
    const totalPaginas = data.total_paginas || 1;
    const paginaAtual = data.pagina_atual || 1;

    if (usuarios.length === 0) {
      tabela.innerHTML = `
                <tr>
                    <td colspan="8" class="p-4 text-center italic text-gray-500">Nenhum usuário encontrado.</td>
                </tr>
            `;
    } else {
      tabela.innerHTML = "";

      // Loop para exibir todos os usuários
      usuarios.forEach((user) => {
        const row = `
                    <tr class="hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        
                        
                        <td class="px-4 py-2">${user.nome}</td>
                        <td class="px-4 py-2">${user.email}</td>
                        <td class="px-4 py-2 uppercase">${user.tipo}</td>
                        <td>
                                <button onclick=" excluirUserGg(${user.id})" class="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700">Excluir</button>
                            </td>
                        
                    </tr>
                `;
        tabela.insertAdjacentHTML("beforeend", row);
      });

      // Paginação
      let paginacaoHTML = `<tr><td colspan="8" class="p-4 text-center"><div class="flex justify-center gap-2">`;

      // Botão Anterior
      if (paginaAtual > 1) {
        paginacaoHTML += `<button onclick="usuariosGeral(${
          paginaAtual - 1
        })" class="px-3 py-1 bg-gray-300 rounded">Anterior</button>`;
      }

      // Páginas
      for (let i = 1; i <= totalPaginas; i++) {
        paginacaoHTML += `<button onclick="usuariosGeral(${i})" class="px-3 py-1 rounded ${
          i === paginaAtual ? "bg-blue-600 text-white" : "bg-gray-200"
        }">${i}</button>`;
      }

      // Botão Próxima
      if (paginaAtual < totalPaginas) {
        paginacaoHTML += `<button onclick="usuariosGeral(${
          paginaAtual + 1
        })" class="px-3 py-1 bg-gray-300 rounded">Próxima</button>`;
      }

      paginacaoHTML += `</div></td></tr>`;
      tabela.insertAdjacentHTML("beforeend", paginacaoHTML);
    }

    // Abrir modal
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      modal.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    tabela.innerHTML = `
            <tr>
                <td colspan="8" class="p-4 text-center text-red-600">
                    Erro ao carregar usuários.
                </td>
            </tr>
        `;
  }
}

window.usuariosGeral = usuariosGeral;

async function excluirUserGg(id) {
  let confirmacao = confirm("Realmente deseja excluir esse Usuário?");

  if (confirmacao) {
    try {
      let response = await fetch(`${API_BASE}usuarios/deletar-usuario.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: id }),
      });

      let resultado = await response.json();

      if (resultado.success) {
        alert("Usuário excluído com sucesso!");
        // ✅ Atualiza a tabela automaticamente na mesma página
        usuariosGeral(paginaAtualUserGeral);
      } else {
        alert(
          "Erro ao excluir Usuário: " +
            (resultado.message || "Tente novamente.")
        );
        console.error("Erro:", resultado);
      }
    } catch (error) {
      alert("Erro de conexão com a API.");
      console.error("Erro de rede:", error);
    }
  } else {
    console.log("Exclusão cancelada. ID:", id);
  }
}

window.excluirUserGg = excluirUserGg;

function registrarClick() {
  // Se quiser enviar ID do usuário logado:
  fetch(`/api/registrar_click.php?user_id=${userId}`).then(() => {
    // Redireciona pro seu site depois de registrar
    window.location.href = "https://seusite.com";
  });
}
