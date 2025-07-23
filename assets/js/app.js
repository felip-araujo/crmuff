let clienteEditandoId = null;


document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const nivel = localStorage.getItem("admin");

  if (!token || nivel !== "administrator") {
    alert("Acesso não autorizado. Faça login novamente.");
    window.location.href = "index.html"; // ou login.html
    return;
  }

  fetchAndRenderContacts();
});


function openModal() {
  document.getElementById("modal").classList.remove("hidden");
}

function openEditModal(contact) {
  clienteEditandoId = contact.id;

  document.getElementById("nome-edit").value = contact.nome;
  document.getElementById("telefone-edit").value = contact.telefone;
  document.getElementById("email-edit").value = contact.email;
  document.getElementById("status-edit").value = contact.status;
  document.getElementById("nivel-edit").value = contact.nivel;

  document.getElementById("modal-edit").classList.remove("hidden");
}


function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  clearForm();
}

function closeEditModal() {
  document.getElementById("modal-edit").classList.add("hidden");
  clearForm();
}

function clearForm() {
  document.getElementById("nome").value = "";
  document.getElementById("telefone").value = "";
  document.getElementById("email").value = "";
  document.getElementById("senha").value = "";
  document.getElementById("status").value = "Ativo";
  document.getElementById("nivel").value = "cliente";
  document.getElementById("documento").value = "";
}

async function addContact() {
  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const status = document.getElementById("status").value;
  const nivel = document.getElementById("nivel").value;
  const documento = document.getElementById("documento").files[0];

  if (!nome || !telefone || !email || !senha || !nivel) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    // 1. Cadastra o cliente
    const token = localStorage.getItem("token");

    const resCliente = await fetch('https://evoludesign.com.br/crm/wp-json/crm/v1/clientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nome,
        telefone,
        email,
        senha,
        status,
        nivel
      })
    });

    const clienteData = await resCliente.json();

    if (!resCliente.ok) {
      throw new Error(clienteData.message || "Erro ao cadastrar cliente");
    }

    const cliente_id = clienteData.id;

    // 2. Faz upload do documento se houver
    if (documento) {
      const formData = new FormData();
      formData.append("cliente_id", cliente_id);
      formData.append("arquivo", documento);

      const resDoc = await fetch("https://evoludesign.com.br/crm/wp-json/crm/v1/documento", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const docData = await resDoc.json();

      if (!resDoc.ok) {
        throw new Error(docData.message || "Erro ao enviar documento");
      }
    }

    alert("Cliente cadastrado com sucesso!");
    closeModal();
    fetchAndRenderContacts();

  } catch (error) {
    console.error(error);
    alert("Erro: " + error.message);
  }
}

async function fetchAndRenderContacts() {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token não encontrado, faça login novamente.");

    const res = await fetch('https://evoludesign.com.br/crm/wp-json/crm/v1/clientes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Erro ao buscar clientes");
    }

    const data = await res.json();

    // Limpa e preenche tabela
    const table = document.getElementById("contactTable");
    table.innerHTML = "";

    data.forEach(contact => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="p-2">${contact.nome}</td>
        <td class="p-2">${contact.telefone}</td>
        <td class="p-2">${contact.nivel}</td>
        <td class="p-2">${contact.email}</td>
        <td class="p-2">${contact.status}</td>
        <td class="p-2">
          <button onclick='openEditModal(${JSON.stringify(contact)})' class="text-blue-600 hover:underline">
    <i class="fas fa-pen"></i> 
  </button>

  <button onclick="openDocumentoModal(${contact.id})" class="text-green-600 hover:underline">
    <i class="fas fa-upload"></i> 
  </button>

  <button onclick="deleteContact(${contact.id})" class="text-red-600 hover:underline">
    <i class="fas fa-trash"></i> 
  </button>

  <button onclick="abrirDocumentosCliente(${contact.id}, '${contact.nome}')" class="text-yellow-600 hover:underline">
    <i class="fas fa-folder-open"></i>  
  </button>
          
        </td>
      `;
      table.appendChild(row);
    });

  } catch (error) {
    console.error("Erro ao buscar contatos:", error);
  }
}


async function deleteContact(clienteId) {
  if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`https://evoludesign.com.br/crm/wp-json/crm/v1/clientes/${clienteId}`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Erro ao excluir cliente");
    }

    alert("Cliente excluído com sucesso.");
    fetchAndRenderContacts();

  } catch (error) {
    console.error(error);
    alert("Erro ao excluir cliente.");
  }
}

async function editContact() {
  try {
    const nomeedit = document.getElementById("nome-edit").value;
    const telefoneedit = document.getElementById("telefone-edit").value;
    const emailedit = document.getElementById("email-edit").value;
    const senhaedit = document.getElementById("senha-edit").value;
    const statusedit = document.getElementById("status-edit").value;
    const niveledit = document.getElementById("nivel-edit").value;
    const documentoedit = document.getElementById("documento-edit").files[0];

    const token = localStorage.getItem("token");

    const res = await fetch(`https://evoludesign.com.br/crm/wp-json/crm/v1/clientes/${clienteEditandoId}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome: nomeedit,
        email: emailedit,
        password: senhaedit,
        telefone: telefoneedit,
        status: statusedit,
        nivel: niveledit
      })
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Erro ao editar cliente");
    }

    alert('Cliente editado com sucesso!');
    closeEditModal();
    fetchAndRenderContacts();

  } catch (error) {
    console.error(error);
    alert("Erro ao editar dados do cliente.");
  }
}


function openDocumentoModal(id) {
  document.getElementById("doc-user-id").value = id;
  document.getElementById("documentoModal").classList.remove("hidden");
}

function closeDocumentoModal() {
  document.getElementById("documentoModal").classList.add("hidden");
  document.getElementById("novo-documento").value = "";
}


async function uploadDocumento() {
  const token = localStorage.getItem("token");
  const userId = document.getElementById("doc-user-id").value;
  const fileInput = document.getElementById("novo-documento");

  if (!fileInput.files.length) {
    alert("Selecione um arquivo PDF.");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]); // campo "file" para o backend

  try {
    const response = await fetch(`https://evoludesign.com.br/crm/wp-json/crm/v1/clientes/${userId}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // NÃO definir Content-Type aqui, o browser define com boundary para multipart/form-data
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      alert("Documento enviado com sucesso!");
      fecharModalPDFs(); // Fechar modal (corrigi o nome da função)
      // Aqui você pode recarregar a lista de documentos se quiser atualizar a UI
    } else {
      alert("Erro ao enviar documento: " + (data.message || data.error || "Erro desconhecido."));
    }
  } catch (error) {
    console.error(error);
    alert("Erro na requisição.");
  }
}



function abrirDocumentosCliente(clienteId, clienteNome) {
  const token = localStorage.getItem("token");
  const modal = document.getElementById("cliente-pdfs-modal");
  const lista = document.getElementById("lista-documentos");
  const nomeSpan = document.getElementById("cliente-nome-modal");

  nomeSpan.textContent = clienteNome;
  lista.innerHTML = '<li>Carregando documentos...</li>';
  modal.classList.remove("hidden");

  fetch(`https://evoludesign.com.br/crm/wp-json/crm/v1/clientes/${clienteId}/documentos`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(response => response.json())
    .then(data => {
      lista.innerHTML = ""; // Limpa a lista
      if (!data || data.length === 0) {
        lista.innerHTML = "<li>Nenhum documento encontrado.</li>";
        return;
      }
      data.forEach(doc => {
        const li = document.createElement("li");
        li.innerHTML = `
          <a href="${doc.url}" target="_blank" class="text-blue-600 underline">${doc.nome}</a>
        `;
        lista.appendChild(li);
      });
    })
    .catch(error => {
      lista.innerHTML = `<li class="text-red-600">Erro ao carregar documentos.</li>`;
      console.error("Erro ao buscar documentos:", error);
    });
}


function fecharModalPDFs() {
  document.getElementById("cliente-pdfs-modal").classList.add("hidden");
}






function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("nivel");
  window.location.href = "login.html"; // ou login.html
}


// Chama a função ao carregar a página
document.addEventListener("DOMContentLoaded", fetchAndRenderContacts);
