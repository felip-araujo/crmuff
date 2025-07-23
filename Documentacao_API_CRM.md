
# 📘 Documentação da API CRM WordPress

## 🔐 Autenticação
A maioria das rotas exige autenticação com cookie de sessão ou token JWT (se estiver usando um plugin como o JWT Authentication).

---

## 🔹 1. Criar Cliente
- **Rota:** `POST /wp-json/crm/v1/clientes`
- **Função:** `crm_criar_cliente`
- **Permissão:** Público
- **Descrição:** Cria um novo usuário (cliente ou administrador).

### Corpo da requisição (JSON):
```json
{
  "nome": "João da Silva",
  "email": "joao@email.com",
  "telefone": "11999998888",
  "senha": "senha123",
  "papel": "subscriber"
}
```

### Exemplo `curl`:
```bash
curl -X POST https://seusite.com/wp-json/crm/v1/clientes   -H "Content-Type: application/json"   -d '{"nome":"João","email":"joao@email.com","telefone":"11999998888","senha":"senha123"}'
```

---

## 🔹 2. Listar Todos os Clientes
- **Rota:** `GET /wp-json/crm/v1/clientes`
- **Função:** `crm_listar_clientes`
- **Permissão:** Somente administradores

---

## 🔹 3. Ver Cliente por ID
- **Rota:** `GET /wp-json/crm/v1/clientes/{id}`
- **Função:** `crm_ver_cliente`
- **Permissão:** Somente administradores

---

## 🔹 4. Editar Cliente por ID
- **Rota:** `PUT /wp-json/crm/v1/clientes/{id}`
- **Função:** `crm_editar_cliente`
- **Permissão:** Somente administradores

### Corpo da requisição (JSON):
```json
{
  "nome": "Novo Nome",
  "email": "novo@email.com",
  "telefone": "11988887777",
  "status": "ativo",
  "senha": "novasenha123"
}
```

### Exemplo `fetch`:
```js
fetch('https://seusite.com/wp-json/crm/v1/clientes/123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer SEU_TOKEN_JWT'
  },
  body: JSON.stringify({
    nome: "Novo Nome",
    telefone: "11988887777"
  })
})
```

---

## 🔹 5. Deletar Cliente por ID
- **Rota:** `DELETE /wp-json/crm/v1/clientes/{id}`
- **Função:** `crm_deletar_cliente`
- **Permissão:** Somente administradores

---

## 🔹 6. Upload de PDF para Cliente
- **Rota:** `POST /wp-json/crm/v1/clientes/{id}/upload-pdf`
- **Função:** `crm_upload_pdf`
- **Permissão:** Somente administradores

### Formulário `multipart/form-data`:
Campo obrigatório: `arquivo`

### Exemplo `curl`:
```bash
curl -X POST https://seusite.com/wp-json/crm/v1/clientes/123/upload-pdf   -H "Authorization: Bearer SEU_TOKEN_JWT"   -F "arquivo=@/caminho/do/arquivo.pdf"
```

---

## 🔹 7. Listar PDFs do Cliente Autenticado
- **Rota:** `GET /wp-json/crm/v1/meus-pdfs`
- **Função:** `crm_meus_pdfs`
- **Permissão:** Cliente logado

---

## 🔹 8. Ver Perfil do Cliente Autenticado
- **Rota:** `GET /wp-json/crm/v1/meu-perfil`
- **Função:** `crm_meu_perfil`
- **Permissão:** Cliente logado

---

## 🧪 Exemplos para testar com Postman ou Insomnia
1. Faça o login e obtenha o cookie de sessão ou o token JWT.
2. Use o token nas rotas protegidas (`Authorization: Bearer SEU_TOKEN`).
