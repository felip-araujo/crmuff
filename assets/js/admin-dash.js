const titulo = document.getElementById("titulo");
const Api = "https://evoludesign.com.br/api-conipa";

async function abrirModal() {
    const modal = document.getElementById("modalRequisicao");
    const tabela = document.getElementById("tabelaRequisicoes");

    titulo.textContent = "Todas as Requisições"
    tabela.innerHTML = `
<tr>
    <td colspan="7" class="p-4 text-center italic text-gray-500">Carregando...</td>
</tr>
`;

    try {
        const response = await fetch("https://evoludesign.com.br/api-conipa/requisicoes/lsitar.php");
        const data = await response.json();

        if (data.success) {
            if (!data.requisicoes || data.requisicoes.length === 0) {
                tabela.innerHTML = `
            <tr>
                <td colspan="7" class="p-4 text-center italic text-gray-500">Nenhuma requisição encontrada.</td>
            </tr>
        `;
            } else {
                tabela.innerHTML = "";

                data.requisicoes.forEach(req => {
                    // Verifica se há itens
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
                    <td class="px-4 py-2">${req.criado_em}</td>
                    <td class="px-4 py-2">${itensHtml}</td>
                </tr>
            `;
                    tabela.insertAdjacentHTML("beforeend", row);
                });
            }
        } else {
            tabela.innerHTML = `
        <tr>
            <td colspan="7" class="p-4 text-center text-red-600">Erro ao carregar dados da API.</td>
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
        <td colspan="7" class="p-4 text-center text-red-600">Erro ao carregar requisições.</td>
    </tr>
`;
    }
}

async function abrirModalPendentes() {
    const modal = document.getElementById("modalRequisicao");
    const tabela = document.getElementById("tabelaRequisicoes");
    titulo.textContent = "Requisições Pendentes"
    tabela.innerHTML = `
    
<tr>
    <td colspan="7" class="p-4 text-center italic text-gray-500">Carregando...</td>
</tr>
`;

    try {
        const response = await fetch("https://evoludesign.com.br/api-conipa/requisicoes/pendentes.php");
        const data = await response.json();

        if (data.success) {
            if (!data.requisicoes || data.requisicoes.length === 0) {
                tabela.innerHTML = `
            <tr>
                <td colspan="7" class="p-4 text-center italic text-gray-500">Nenhuma requisição encontrada.</td>
            </tr>
        `;
            } else {




                tabela.innerHTML = "";

                data.requisicoes.forEach(req => {
                    // Verifica se há itens
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
                    <td class="px-4 py-2">${req.criado_em}</td>
                    <td class="px-4 py-2">${itensHtml}</td>
                </tr>
            `;
                    tabela.insertAdjacentHTML("beforeend", row);
                });
            }
        } else {
            tabela.innerHTML = `
        <tr>
            <td colspan="7" class="p-4 text-center text-red-600">Erro ao carregar dados da API.</td>
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
        <td colspan="7" class="p-4 text-center text-red-600">Erro ao carregar requisições.</td>
    </tr>
`;
    }
}


async function UsuariosPendentes() {
    const modal = document.getElementById("modalUsuariosPendentes");
    const tabela = document.getElementById("tabelaUsuariosPendentes");
    const titulo = document.getElementById("titulo");
    titulo.textContent = "Pré-Cadastro de Usuários";

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

