const usuarios = [
    {
      email: "cliente1@email.com",
      senha: "123456",
      nome: "João da Silva",
      telefone: "(92) 91234-5678",
      pdf: "arquivos/contrato-joao.pdf"
    },
    {
      email: "cliente2@email.com",
      senha: "abcdef",
      nome: "Maria Oliveira",
      telefone: "(92) 99876-5432",
      pdf: "arquivos/contrato-maria.pdf"
    }, 
    {
      email: "cliente3@gmail.com",
      senha: "teste",
      nome: "Maria Oliveira",
      telefone: "(92) 99876-5432",
      pdf: "arquivos/contrato-maria.pdf"
    }
  ];
  
  function loginUsuario() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
  
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
  
    if (usuario) {
      // Salvar os dados no localStorage
      localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
      window.location.href = "perfil.html";
    } else {
      document.getElementById("erro").classList.remove("hidden");
    }
  }
  