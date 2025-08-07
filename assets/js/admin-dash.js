async function abrirModal() {
    const modal = document.getElementById("modalRequisicao");
    const tabela = document.getElementById("tabelaRequisicoes");

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