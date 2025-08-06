
  const itensAdicionados = [];

  function adicionarItem() {
    const codigo = document.getElementById("codigo_material").value.trim();
    const quantidade = parseInt(document.getElementById("quantidade_item").value);

    if (!codigo || !quantidade || quantidade <= 0) {
      alert("Preencha corretamente o código do material e a quantidade.");
      return;
    }

    itensAdicionados.push({ codigo_material: codigo, quantidade });
    document.getElementById("codigo_material").value = "";
    document.getElementById("quantidade_item").value = "";

    renderizarListaItens();
  }

  function renderizarListaItens() {
    const lista = document.getElementById("listaItens");
    if (itensAdicionados.length === 0) {
      lista.innerHTML = `<p class="text-sm text-gray-600 dark:text-gray-400 italic">Nenhum item adicionado ainda.</p>`;
      return;
    }

    lista.innerHTML = `
      <h4 class="font-medium mb-2">Itens Adicionados:</h4>
      <ul class="list-disc pl-5 space-y-1">
        ${itensAdicionados.map(item => `
          <li>${item.codigo_material} — <span class="font-semibold">${item.quantidade}</span> un.</li>
        `).join('')}
      </ul>
    `;
  }

  async function enviarRequisicao() {
    const setor = document.getElementById("setor").value.trim();
    const re = document.getElementById("re").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const mensagem = document.getElementById("mensagem");

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.id) {
      alert("Usuário não autenticado.");
      return;
    }

    if (!setor || !re || !nome || itensAdicionados.length === 0) {
      alert("Preencha todos os campos e adicione pelo menos um item.");
      return;
    }

    const dados = {
      id_usuario: usuario.id,
      setor,
      re,
      nome,
      itens: itensAdicionados
    };

    try {
      const response = await fetch("https://evoludesign.com.br/api-conipa/requisicoes/criar.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
      });

      const resultado = await response.json();

      if (!response.ok) {
        throw new Error(resultado.erro || "Erro ao enviar requisição.");
      }

      mensagem.classList.remove("hidden", "text-red-500");
      mensagem.classList.add("text-green-600");
      mensagem.textContent = resultado.mensagem;

      // Limpa tudo
      document.getElementById("setor").value = "";
      document.getElementById("re").value = "";
      document.getElementById("nome").value = "";
      itensAdicionados.length = 0;
      renderizarListaItens();

    } catch (error) {
      mensagem.classList.remove("hidden", "text-green-600");
      mensagem.classList.add("text-red-500");
      mensagem.textContent = error.message;
    }
  }

