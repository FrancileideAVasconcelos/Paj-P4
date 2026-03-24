// ==========================================
// admin.js - Painel de Administração Dinâmico
// ==========================================
let clientesAlvoAdmin = []; // <-- ADICIONA ESTA LINHA AQUI

const token = localStorage.getItem("token");

// 1. Ponto de entrada: Carrega a estrutura base e chama a lista
function carregarPaginaAdmin() {
    const content = document.getElementById("content");

    if (localStorage.getItem("isAdmin") !== "true") {
        content.innerHTML = `<h2 style="color:red; text-align:center; margin-top: 50px;">Acesso Negado</h2>`;
        return;
    }

    if (window.location.hash !== "#admin") window.location.hash = "#admin";

    content.innerHTML = `
        <div class="barra-clientes" style="margin-bottom: 20px;">
            <h2>Painel de Administração</h2>
            <button class="btn" style="margin-bottom: 20px;" onclick="carregarListaUtilizadores()"><i class="fa-solid fa-arrow-left"></i> Voltar à Lista</button>

        </div>
        
        <div id="adminConteudo" style="max-width: 1000px; margin: 0 auto;">
            <p><i class="fa-solid fa-spinner fa-spin"></i> A carregar utilizadores...</p>
        </div>
    `;

    carregarListaUtilizadores();
}

// 2. Mostra a lista de TODOS os utilizadores
async function carregarListaUtilizadores() {
    const conteudo = document.getElementById("adminConteudo");

    try {
        const response = await fetch("http://localhost:8080/projeto3/rest/admin/users", {
            method: "GET", headers: { "token": token }
        });

        if (response.ok) {
            const users = await response.json();

            let html = `
                <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <h3 style="margin-top: 0; margin-bottom: 20px; color: #000080;"><i class="fa-solid fa-users"></i> Utilizadores Registados (${users.length})</h3>
                    <ul style="list-style: none; padding: 0;">
            `;

            users.forEach(u => {
                html += `
                    <li style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${u.primeiroNome} ${u.ultimoNome}</strong> 
                            <span style="color: #888;">(@${u.username})</span>
                            ${u.admin ? '<i class="fa-solid fa-crown" style="color: gold; margin-left: 5px;" title="Administrador"></i>' : ''}
                        </div>
                        <button class="btn" style="padding: 8px 15px; font-size: 13px;" onclick="abrirDetalhesUtilizador('${u.username}')">
                            Gerir <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </li>
                `;
            });

            html += `</ul></div>`;
            conteudo.innerHTML = html;
        } else {
            conteudo.innerHTML = `<p style="color:red;">Erro ao carregar utilizadores: ${await response.text()}</p>`;
        }
    } catch (error) {
        conteudo.innerHTML = `<p style="color:red;">Falha na ligação ao servidor.</p>`;
    }
}

// 3. Abre os detalhes, clientes e leads de um utilizador específico
async function abrirDetalhesUtilizador(username) {
    const conteudo = document.getElementById("adminConteudo");
    conteudo.innerHTML = `<p><i class="fa-solid fa-spinner fa-spin"></i> A carregar dados de ${username}...</p>`;

    try {
        const resUser = await fetch(`http://localhost:8080/projeto3/rest/admin/users/${username}`, { method: 'GET', headers: { "token": token } });
        const resClients = await fetch(`http://localhost:8080/projeto3/rest/admin/users/${username}/clients`, { method: 'GET', headers: { "token": token } });

        if (resUser.ok && resClients.ok) {
            const user = await resUser.json();
            const clientes = await resClients.json();

            // Guardamos os clientes na memória para a edição funcionar
            clientesAlvoAdmin = clientes;

            let html = `                
                <div class="user-card">
                    <div style="display: flex; gap: 20px; align-items: center;">
                        <img src="${user.fotoUrl || './imagens/favicon1.png'}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #ccc;">
                        <div>
                            <h3>${user.primeiroNome} ${user.ultimoNome} ${user.admin ? '<i class="fa-solid fa-crown" style="color: gold;"></i>' : ''}</h3>
                            <p style="margin: 3px 0; color: #555;"><i class="fa-solid fa-at"></i> ${user.username} | <i class="fa-solid fa-envelope"></i> ${user.email} | <i class="fa-solid fa-phone"></i> ${user.telefone}</p>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button class="btn" style="background-color: #f0ad4e; color: white; padding: 8px 15px; border: none;" onclick="apagarUtilizadorAdmin('${user.username}', false)"><i class="fa-solid fa-user-slash"></i> Inativar Conta</button>
                        <button class="btn" style="background-color: #d9534f; color: white; padding: 8px 15px; border: none;" onclick="apagarUtilizadorAdmin('${user.username}', true)"><i class="fa-solid fa-trash"></i> Excluir Conta</button>
                    </div>
                </div>

                <div class="cards-container">
                    
                    <div class="info-card clientes">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
                            <h3 style="margin: 0;"><i class="fa-solid fa-briefcase"></i> Clientes (${clientes.length})</h3>
                            
                            <div style="display: flex; gap: 5px;">
                                <button class="btn" style="background-color: #f0ad4e; color: white; font-size: 12px; padding: 5px 10px; border: none;" onclick="apagarTodosClientesAdmin('${user.username}', false)" title="Inativar Todos"><i class="fa-solid fa-ban"></i> Inativar Todos</button>
                                <button class="btn" style="background-color: #d9534f; color: white; font-size: 12px; padding: 5px 10px; border: none;" onclick="apagarTodosClientesAdmin('${user.username}', true)" title="Excluir Definitivamente Todos"><i class="fa-solid fa-fire"></i> Excluir Todos</button>
                            </div>
                        </div>
            `;

            if(clientes.length === 0) {
                html += `<p style="color: #888;">Nenhum cliente registado.</p>`;
            } else {
                html += `<ul style="list-style: none; padding: 0;">`;
                clientes.forEach((c, index) => {
                    html += `
                        <li style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${c.nome}</strong><br>
                                <span style="font-size: 13px; color: #555;"><i class="fa-regular fa-building"></i> ${c.empresa}</span>
                            </div>
                            <div style="display: flex; gap: 5px;">
                                <button class="btn" style="background-color: #f0ad4e; color: white; padding: 5px 10px; font-size: 12px; border: none; min-width: 30px;" onclick="mostrarFormEdicaoClienteAdmin(${index}, '${user.username}')" title="Editar Cliente"><i class="fa-solid fa-pen"></i></button>
                                
                                <button class="btn" style="background-color: #d9534f; color: white; padding: 5px 10px; font-size: 12px; border: none; min-width: 30px;" onclick="apagarClienteAdminBtn(${c.id}, true, '${user.username}')" title="Excluir Cliente"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </li>`;
                });
                html += `</ul>`;
            }

            html += `
                    </div>

                    <div class="info-card leads">
                        <div style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
                            <h3 style="margin: 0;"><i class="fa-solid fa-filter"></i> Leads (Oportunidades)</h3>
                        </div>
                        <p style="color: #888; font-style: italic;"><i class="fa-solid fa-person-digging"></i> Em desenvolvimento pela equipa...</p>
                    </div>

                </div>
            `;

            conteudo.innerHTML = html;
        } else {
            conteudo.innerHTML = `<p style="color:red;">Erro ao carregar detalhes do utilizador.</p>`;
        }
    } catch (error) {
        conteudo.innerHTML = `<p style="color:red;">Falha na ligação ao servidor.</p>`;
    }
}

// ==========================================
// FUNÇÕES DE AÇÃO (DELETE / INATIVAR)
// ==========================================

//se permanente == true, faz hardDelet, senão é softDelet
async function apagarUtilizadorAdmin(username, permanente) {
    if (!confirm(`Tens a certeza que queres ${permanente ? 'EXCLUIR DEFINITIVAMENTE' : 'inativar'} o utilizador @${username}?`)) return;

    try {
        let url = `http://localhost:8080/projeto3/rest/admin/users/${username}` + (permanente ? "?permanente=true" : "");
        const response = await fetch(url, { method: 'DELETE',
                                                          headers: { "token": token }});

        const alerta = await response.text();

        alert(alerta);

        if (permanente) {
            await carregarListaUtilizadores(); // Se apagou de vez, volta para a lista
        }
    } catch (error) {
        alert("Falha na comunicação.");
    }
}

//se permanente == true, faz hardDelet, senão é softDelet
async function apagarTodosClientesAdmin(username, permanente) {
    // Muda a palavra dependendo do que o Admin escolheu
    const acao = permanente ? 'EXCLUIR DEFINITIVAMENTE' : 'inativar';

    if (!confirm(`Tens a certeza que queres ${acao} TODOS os clientes de @${username}?`)) return;

    try {
        let url = `http://localhost:8080/projeto3/rest/admin/users/${username}/clients` + (permanente ? "?permanente=true" : "");
        const response = await fetch(url, { method: 'DELETE', headers: { "token": token }});
        alert(await response.text());
        abrirDetalhesUtilizador(username); // Recarrega os detalhes para atualizar a lista
    } catch (error) {
        alert("Falha na comunicação.");
    }
}

async function apagarClienteAdminBtn(idCliente, permanente, usernameToRefresh) {
    if (!confirm(`Excluir definitivamente este Cliente?`)) return;
    try {
        let url = `http://localhost:8080/projeto3/rest/admin/clients/${idCliente}` + (permanente ? "?permanente=true" : "");
        const response = await fetch(url, { method: 'DELETE', headers: { "token": token }});
        alert(await response.text());
        abrirDetalhesUtilizador(usernameToRefresh); // Recarrega a página para o cliente desaparecer visualmente
    } catch (error) {
        alert("Falha na comunicação.");
    }
}

// ==========================================
// FUNÇÕES DE EDIÇÃO DE CLIENTES (ADMIN)
// ==========================================

function mostrarFormEdicaoClienteAdmin(index, username) {
    const c = clientesAlvoAdmin[index];
    const conteudo = document.getElementById("adminConteudo");

    // Substitui a vista atual pelo formulário de edição
    conteudo.innerHTML = `
        <button class="btn" style="margin-bottom: 20px;" onclick="abrirDetalhesUtilizador('${username}')"><i class="fa-solid fa-arrow-left"></i> Voltar ao perfil do utilizador</button>

        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); max-width: 500px; margin: 0 auto; border-top: 4px solid #f0ad4e;">
            <h3 style="margin-top:0;"><i class="fa-solid fa-pen"></i> Editar Cliente</h3>
            <p style="color: #666; margin-bottom: 20px; font-size: 14px;">A alterar dados do cliente pertencente a <strong>@${username}</strong>.</p>

            <label style="font-weight: bold; font-size: 13px;">Nome</label>
            <input id="editAdminCliNome" type="text" value="${c.nome}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">

            <label style="font-weight: bold; font-size: 13px;">Email</label>
            <input id="editAdminCliEmail" type="email" value="${c.email || ''}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">

            <label style="font-weight: bold; font-size: 13px;">Telefone</label>
            <input id="editAdminCliTelefone" type="text" value="${c.telefone || ''}" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">

            <label style="font-weight: bold; font-size: 13px;">Empresa</label>
            <input id="editAdminCliEmpresa" type="text" value="${c.empresa}" style="width: 100%; padding: 10px; margin-bottom: 25px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;">

            <button class="btn" style="width: 100%; justify-content: center; background-color: #5cb85c; color: white; padding: 12px; font-size: 16px;" onclick="guardarEdicaoClienteAdmin(${c.id}, '${username}')">
                <i class="fa-solid fa-floppy-disk"></i> Guardar Alterações
            </button>
        </div>
    `;
}

async function guardarEdicaoClienteAdmin(idCliente, username) {
    const nome = document.getElementById("editAdminCliNome").value.trim();
    const email = document.getElementById("editAdminCliEmail").value.trim();
    const telefone = document.getElementById("editAdminCliTelefone").value.trim();
    const empresa = document.getElementById("editAdminCliEmpresa").value.trim();

    if (!nome || !empresa || (!email && !telefone)) {
        alert("Nome, Empresa e pelo menos um contacto são obrigatórios.");
        return;
    }

    // O Backend espera um ClientDto (tem de ter os mesmos nomes dos campos no Java)
    const dados = { id: idCliente, nome, email, telefone, empresa };

    try {
        const response = await fetch(`http://localhost:8080/projeto3/rest/admin/clients/${idCliente}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "token": token
            },
            body: JSON.stringify(dados)
        });

        const msg = await response.text();

        if (response.ok) {
            alert("Sucesso: " + msg);
            abrirDetalhesUtilizador(username); // Volta para a vista do utilizador recarregando os dados!
        } else {
            alert("Erro ao editar: " + msg);
        }
    } catch (error) {
        alert("Falha na comunicação com o servidor.");
    }
}