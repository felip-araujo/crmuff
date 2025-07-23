**Rotas da API**
1 - Criar cliente (registro)
POST /wp-json/crm/v1/clientes

Corpo JSON (exemplo):
json
Copiar
Editar
{
  "nome": "Felipe Araujo",
  "email": "felipe@email.com",
  "telefone": "11999999999",
  "senha": "minhasenha123"
}
Resposta: ID do usuário criado e mensagem.

2- Perfil do cliente autenticado

GET /wp-json/crm/v1/meu-perfil

Header: Authorization: Bearer <seu_token_jwt>

Resposta: Dados do usuário autenticado (nome, email, telefone, status).

Listar PDFs do cliente autenticado

3 - GET /wp-json/crm/v1/meus-pdfs

Header: Authorization: Bearer <seu_token_jwt>

Resposta: Lista de URLs dos PDFs vinculados (se houver).

Como testar:
1) Criar cliente (registro) — sem token
Use o Postman ou Insomnia

Método: POST

URL: https://seusite.com/wp-json/crm/v1/clientes

Body: raw JSON (conforme exemplo acima)

Envie e confira se usuário foi criado

2) Login no WordPress para gerar o token JWT
Você usa seu plugin JWT para gerar o token — geralmente no endpoint padrão:

bash
Copiar
Editar
POST https://seusite.com/wp-json/jwt-auth/v1/token
Body:
{
  "username": "email_ou_username",
  "password": "senha"
}
Resposta: recebe um campo token (JWT)

3) Consultar perfil / PDFs com token
Em GET para /wp-json/crm/v1/meu-perfil ou /wp-json/crm/v1/meus-pdfs

No Header adicione: Authorization: Bearer <token_recebido>

Você deve receber os dados do perfil ou lista de PDFs.
# crmuff
