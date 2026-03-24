# 📊 Customer Relationship Management (CRM) - Projeto 3

Este é um sistema completo de Gestão de Relacionamento com o Cliente (CRM) desenvolvido com uma arquitetura baseada em **API RESTful (Java/Jakarta EE)** no backend e **Vanilla JavaScript** no frontend.

A aplicação permite a múltiplos utilizadores gerirem as suas carteiras de clientes e acompanharem oportunidades de negócio (Leads), incluindo um robusto painel de Administração para controlo global do sistema.

## 🚀 Tecnologias Utilizadas

**Backend:**
* **Java / Jakarta EE 10:** Lógica de negócio e EJB (@Stateless)
* **JAX-RS:** Construção dos endpoints da API RESTful
* **JPA / Hibernate:** Mapeamento Objeto-Relacional (ORM)
* **PostgreSQL:** Base de Dados Relacional
* **WildFly:** Servidor de Aplicações

**Frontend:**
* **HTML5 & CSS3:** Interface responsiva e moderna
* **JavaScript (Vanilla):** Lógica de interface, manipulação do DOM e integração via `Fetch API`
* **FontAwesome:** Ícones da interface

## ✨ Funcionalidades Principais

### 👤 Área de Utilizador
* **Autenticação Segura:** Registo e Login com gestão de sessões baseada em Tokens (geração de hash SHA-256).
* **Gestão de Perfil:** Edição de dados pessoais e alteração de password com validação de credenciais atuais.
* **Gestão de Clientes:** Operações CRUD (Criar, Ler, Atualizar, Inativar/Remover) para a carteira de clientes, com validação de dados duplicados (Nome + Empresa).
* **Gestão de Leads:** Criação e acompanhamento de oportunidades de negócio com funil de vendas (Novo, Em análise, Proposta, Ganho, Perdido) e filtros dinâmicos.

### 👑 Painel de Administração
Acesso exclusivo a contas com privilégios de Administrador, permitindo:
* Visão global de todos os utilizadores registados na plataforma.
* Capacidade de ver, editar e gerir todos os Clientes e Leads de qualquer utilizador.
* **Soft Delete & Hard Delete:** Opção para inativar registos (mantendo-os na BD) ou excluí-los permanentemente.
* **Restauração:** Funcionalidade para reativar contas de utilizadores, clientes ou leads previamente inativados (individualmente ou em massa).

## 🛠️ Como Executar o Projeto

1. **Base de Dados:**
    * Certifica-te que tens o PostgreSQL instalado e a correr.
    * Cria uma base de dados com o nome `projeto3`.
    * As tabelas serão geradas automaticamente pelo Hibernate ao iniciar o servidor.

2. **Backend (Servidor WildFly):**
    * Configura o ficheiro `persistence.xml` com as credenciais do teu PostgreSQL.
    * Faz o build do projeto (ex: via Maven) e faz o deploy do `.war` no servidor WildFly (ex: porta `8080`).

3. **Frontend:**
    * Abre o ficheiro `login.html` num browser moderno (Live Server no VSCode é recomendado).
    * Não é necessário Node.js ou frameworks complexos para correr o frontend.

## 🔒 Segurança e Validações
* Validação rigorosa de dados em duas camadas (Frontend via Regex e Backend via Java).
* Proteção de rotas REST com verificação de Tokens de sessão ativos.
* Tratamento centralizado de Exceções HTTP (400, 401, 403, 404, 409).

---
**Desenvolvido por: Ana Gonçalves e Francileide Vasconcelos. **