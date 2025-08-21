const titulo = document.getElementById("titulo");
const Api = "https://evoludesign.com.br/api-conipa";


// Função para formatar data YYYY-MM-DD HH:MM:SS → DD-MM-YYYY
function formatarDataBR(dataStr) {
    if (!dataStr) return "";
    const [data] = dataStr.split(" "); // pega só a parte da data
    const [ano, mes, dia] = data.split("-");
    return `${dia}-${mes}-${ano}`;
}



let paginaAtualModal = 1; 
const limiteModal =  10;

async function abrirModal(pagina = 1) {
    paginaAtualModal = pagina;

    const modal = document.getElementById("modalRequisicao");
    const tabela = document.getElementById("tabelaRequisicoes");

    titulo.textContent = "Todas as Requisições";
    tabela.innerHTML = `
<tr>
    <td colspan="8" class="p-4 text-center italic text-gray-500">Carregando...</td>
</tr>
`;

    try {
        const response = await fetch("https://evoludesign.com.br/api-conipa/requisicoes/lsitar.php");
        const data = await response.json();

        if (data.success) {
            if (!data.requisicoes || data.requisicoes.length === 0) {
                tabela.innerHTML = `
            <tr>
                <td colspan="8" class="p-4 text-center italic text-gray-500">Nenhuma requisição encontrada.</td>
            </tr>
        `;
            } else {
                tabela.innerHTML = "";

                // Paginação
                const totalPaginas = Math.ceil(data.requisicoes.length / limiteModal);
                const inicio = (paginaAtualModal - 1) * limiteModal;
                const fim = inicio + limiteModal;
                const requisicoesPagina = data.requisicoes.slice(inicio, fim);

                requisicoesPagina.forEach(req => {
                    const itensHtml = Array.isArray(req.itens)
                        ? req.itens.map(item =>
                            `<div class="mb-1">• ${item.codigo_material} (Qtd: ${item.quantidade})</div>`
                        ).join("")
                        : '<span class="italic text-gray-400">Sem itens</span>';

                    const row = `
                <tr class="hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <td class="px-4 py-2">${req.id}</td>
                    <td class="px-4 py-2">${req.nome}</td>
                    <td class="px-4 py-2">${req.setor}</td>
                    <td class="px-4 py-2">${req.re}</td>
                    <td class="px-4 py-2">${req.status}</td>
                    <td class="px-4 py-2">${formatarDataBR(req.criado_em)}</td>
                    <td class="px-4 py-2">${itensHtml}</td>
                    <td>
                        <button onclick="alterarStatus(${req.id}, 'rejeitado')" 
                                class="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700">
                            Excluir
                        </button>
                    </td>
                </tr>
            `;
                    tabela.insertAdjacentHTML("beforeend", row);
                });

                // Controles de paginação
                let paginacaoHTML = `<tr><td colspan="8" class="px-4 py-2 text-center"><div class="flex justify-center gap-2 mt-4">`;
                for (let i = 1; i <= totalPaginas; i++) {
                    paginacaoHTML += `
                        <button onclick="abrirModal(${i})"
                                class="px-3 py-1 rounded ${i === paginaAtualModal ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 dark:text-white'}">
                            ${i}
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


let paginaAtualPendentes = 1;
const limitePendentes = 10; // 10 itens por página



async function abrirModalPendentes(pagina = 1) {
    paginaAtualPendentes = pagina;

    const modal = document.getElementById("modalRequisicao");
    const tabela = document.getElementById("tabelaRequisicoes");
    titulo.textContent = "Requisições Pendentes";

    tabela.innerHTML = `
        <tr>
            <td colspan="8" class="p-4 text-center italic text-gray-500">Carregando...</td>
        </tr>
    `;

    try {
        const response = await fetch(`https://evoludesign.com.br/api-conipa/requisicoes/pendentes.php?pagina=${pagina}&limite=${limitePendentes}`);
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

            requisicoes.forEach(req => {
                const itensHtml = Array.isArray(req.itens)
                    ? req.itens.map(item =>
                        `<div class="mb-1">• ${item.codigo_material} (Qtd: ${item.quantidade})</div>`
                    ).join("")
                    : '<span class="italic text-gray-400">Sem itens</span>';

                const row = `
                    <tr class="hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <td class="px-4 py-2">${req.id}</td>
                        <td class="px-4 py-2">${req.nome}</td>
                        <td class="px-4 py-2">${req.setor}</td>
                        <td class="px-4 py-2">${req.re}</td>
                        <td class="px-4 py-2">${req.status}</td>
                        <td class="px-4 py-2">${formatarDataBR(req.criado_em)}</td>
                        <td class="px-4 py-2">${itensHtml}</td>
                        <td class="px-4 py-2 flex gap-2">
                            <button onclick="alterarStatus(${req.id}, 'aprovado')" 
                                class="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700">Aprovar</button>
                            <button onclick="alterarStatus(${req.id}, 'rejeitado')" 
                                class="bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700">Rejeitar</button>
                        </td>
                    </tr>
                `;
                tabela.insertAdjacentHTML("beforeend", row);
            });

            // Paginação
            let paginacaoHTML = `<tr><td colspan="8" class="p-4 text-center"><div class="flex justify-center gap-2">`;

            if (paginaAtualPendentes > 1) {
                paginacaoHTML += `<button onclick="abrirModalPendentes(${paginaAtualPendentes - 1})" class="px-3 py-1 bg-gray-300 rounded">Anterior</button>`;
            }

            for (let i = 1; i <= totalPaginas; i++) {
                paginacaoHTML += `<button onclick="abrirModalPendentes(${i})" class="px-3 py-1 rounded ${i === paginaAtualPendentes ? 'bg-blue-600 text-white' : 'bg-gray-200'}">${i}</button>`;
            }

            if (paginaAtualPendentes < totalPaginas) {
                paginacaoHTML += `<button onclick="abrirModalPendentes(${paginaAtualPendentes + 1})" class="px-3 py-1 bg-gray-300 rounded">Próxima</button>`;
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




// Função para aprovar/rejeitar
async function alterarStatus(id, status) {
    try {
        const response = await fetch("https://evoludesign.com.br/api-conipa/requisicoes/aprovar-requisicao.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_requisicao: id,
                status_requisicao: status
            })
        });

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




async function UsuariosPendentes() {
    const modal = document.getElementById("modalUsuariosPendentes");
    const tabela = document.getElementById("tabelaUsuariosPendentes");
    const titulo2 = document.getElementById("tituloUsuarios");
    titulo2.textContent = "Pré-Cadastro de Usuários";

    tabela.innerHTML = `
        <tr>
            <td colspan="7" class="p-4 text-center italic text-gray-500">Carregando...</td>
        </tr>
    `;

    try {
        const response = await fetch(Api + "/usuarios/listar-pendentes.php");
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
                data.usuarios.forEach(user => {
                    const row = `
                        <tr class="hover:bg-gray-100 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <td class="px-4 py-2">${user.id}</td>
                            <td class="px-4 py-2">${user.nome}</td>
                            <td class="px-4 py-2">${user.setor}</td>
                            <td class="px-4 py-2">${user.re}</td>
                            <td class="px-4 py-2">
                                <select id="acao_${user.id}" class="border rounded p-1 text-sm">
                                    <option value="pendente" ${user.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                                    <option value="aprovar" ${user.status === 'aprovado' ? 'selected' : ''}>Aprovado</option>
                                    <option value="rejeitar" ${user.status === 'rejeitado' ? 'selected' : ''}>Rejeitado</option>
                                </select>
                            </td>
                            <td class="px-4 py-2">
                                <select id="tipo_${user.id}" class="border rounded p-1 text-sm">
                                    <option value="admin" ${user.tipo === 'admin' ? 'selected' : ''}>Administrador</option>
                                    <option value="usuario" ${user.tipo === 'usuario' ? 'selected' : ''}>Usuário</option>
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
                tipo: tipo
            })
        });

        const data = await response.json();
        if (data.success) {
            alert("Usuário atualizado com sucesso!");
            UsuariosPendentes(); // recarrega a lista
        } else {
            alert("Erro: " + data.message);
        }
    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        alert("Erro ao atualizar usuário.");
    }
}

