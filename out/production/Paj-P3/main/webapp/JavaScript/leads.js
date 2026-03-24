/*const LEADS_API_URL = "http://localhost:8080/backend-p2-1.0-SNAPSHOT/rest/leads";*/
let leadsList = [];

// Estados (frontend) – index = STATE_ID (como no teu backend atual)
const statusOptions = ["Novo", "Em análise", "Proposta", "Ganho", "Perdido"];

// ==========================================
// CARREGAR E LISTAR
// ==========================================

async function carregarLeads() {
  const username = sessionStorage.getItem("username");
  const password = sessionStorage.getItem("password");
  if (!username) return;

  try {
    const response = await fetch(LEADS_API_URL, {
      method: "GET",
      headers: { username, password },
    });

    if (response.ok) {
      leadsList = await response.json();

      // ordenar: por estado e depois por título (podes ajustar)
      leadsList.sort((a, b) => {
        const ea = Number(a.estado ?? 0);
        const eb = Number(b.estado ?? 0);
        if (ea !== eb) return ea - eb;
        return (a.titulo || "").localeCompare(b.titulo || "");
      });

      listarLeads();
    } else {
      alert("Erro ao ir buscar leads: " + (await response.text()));
    }
  } catch (error) {
    console.error("Erro na ligação ao servidor:", error);
  }
}

function listarLeads() {
  const main = document.getElementById("content");
  if (!main) return;

  let html = `
    <div class="barra-leads">
      <h2>Leads</h2>
      <button class="btn" type="button" onclick="formNovaLead()">
        <i class="fa-solid fa-plus"></i> Nova Lead
      </button>
    </div>

    <label class="filtro-label" for="filtroEstado">Filtrar por estado:</label>
    <select id="filtroEstado"></select>

    <div id="listaLeads" style="margin-top: 5%;"></div>
    <br>
  `;

  main.innerHTML = html;

  preencherFiltroEstados();
  renderListaLeads(leadsList);

  // listener (porque o HTML é injetado)
  const filtro = document.getElementById("filtroEstado");
  filtro.addEventListener("change", () => {
    const val = filtro.value;
    if (val === "") {
      renderListaLeads(leadsList);
    } else {
      const estado = Number(val);
      const filtradas = leadsList.filter((l) => Number(l.estado) === estado);
      renderListaLeads(filtradas);
    }
  });
}

function preencherFiltroEstados() {
  const select = document.getElementById("filtroEstado");
  if (!select) return;

  select.innerHTML = `<option value="">Todos</option>`;
  statusOptions.forEach((nome, idx) => {
    select.innerHTML += `<option value="${idx}">${nome}</option>`;
  });
}

function renderListaLeads(lista) {
  const container = document.getElementById("listaLeads");
  if (!container) return;

  container.innerHTML = lista.map(lead => {
    const nomeEstado = statusOptions[Number(lead.estado)] ?? "Desconhecido";
    const dataTxt = formatarData(lead.dataCriacao);

    return `
      <div class="lead-item">
        <button class="lead-btn" onclick="mostrarDetalhesLeadPorId(${lead.id})">
          <span class="lead-titulo">${lead.titulo}</span>
          <span class="lead-estado">Estado: ${nomeEstado}</span>
          <span class="lead-data">Criada: ${dataTxt}</span>
        </button>
      </div>
    `;
  }).join("");
}

// Formatação de data

function formatarData(data) {
  if (!data) return "-";

  const str = String(data);

  // Se vier tipo "2026-02-23T10:20:30..."
  const apenasData = str.includes("T") ? str.split("T")[0] : str;

  const [y, m, d] = apenasData.split("-");
  if (!y || !m || !d) return str;

  return `${d}-${m}-${y}`;
}

// ==========================================
// MOSTRAR DETALHES
// ==========================================

function mostrarDetalhesLeadPorId(id) {
  const lead = leadsList.find((l) => Number(l.id) === Number(id));
  if (!lead) {
    alert("Lead não encontrada");
    return;
  }

  const main = document.getElementById("content");
  const nomeEstado = statusOptions[Number(lead.estado)] ?? "Desconhecido";

  main.innerHTML = `
    <div class="detalhes-container">
      <h2>Detalhes da Lead</h2>
      <br>

      <p><strong>ID:</strong> ${lead.id}</p>
      <p><strong>Título:</strong> ${lead.titulo}</p>
      <p><strong>Descrição:</strong> ${lead.descricao}</p>
      <p><strong>Estado:</strong> ${nomeEstado}</p>
      <p><strong>Data de criação:</strong> ${formatarData(lead.dataCriacao)}</p>

      <br>
      <button class="btn" onclick="editarLead(${lead.id})">
        <i class="fa-regular fa-pen-to-square"></i> Editar
      </button>
      <button class="btn" onclick="removerLead(${lead.id})">
        <i class="fa-solid fa-trash"></i> Remover
      </button>
      <button class="btn" onclick="carregarLeads()">
        <i class="fa-solid fa-arrow-left"></i> Voltar
      </button>
    </div>
  `;
}

// ==========================================
// FORMULÁRIOS (NOVO E EDITAR)
// ==========================================

function formNovaLead() {
  const content = document.getElementById("content");

  content.innerHTML = `
    <h2>Nova Lead</h2>

    <label>Título</label>
    <input id="leadTitulo" type="text" required><br><br>

    <label>Descrição</label>
    <textarea id="leadDescricao" required></textarea><br><br>

    <label>Estado</label>
    <select id="leadEstado">
      ${statusOptions.map((s, idx) => `<option value="${idx}" ${idx === 0 ? "selected" : ""}>${s}</option>`).join("")}
    </select>
    <br><br>

    <button id="btnGuardarLead" class="btn" disabled type="button" onclick="guardarLead()">
      <i class="fa-solid fa-floppy-disk"></i> Guardar
    </button>

    <button class="btn" type="button" onclick="carregarLeads()">
      <i class="fa-solid fa-xmark"></i> Cancelar
    </button>
  `;

  ativarValidacaoNovaLead();
}

function editarLead(id) {
  const lead = leadsList.find((l) => Number(l.id) === Number(id));
  if (!lead) return;

  const main = document.getElementById("content");

  main.innerHTML = `
    <h2>Editar Lead</h2>

    <label>Título</label>
    <input id="editTitulo" type="text" value="${lead.titulo}"><br><br>

    <label>Descrição</label>
    <textarea id="editDescricao">${lead.descricao}</textarea><br><br>

    <label>Estado</label>
    <select id="editEstado">
      ${statusOptions
        .map((s, idx) => `<option value="${idx}" ${Number(lead.estado) === idx ? "selected" : ""}>${s}</option>`)
        .join("")}
    </select>

    <br><br>

    <button id="btnGuardarEdicaoLead" class="btn" disabled type="button" onclick="guardarLead(${lead.id})">
      <i class="fa-solid fa-floppy-disk"></i> Guardar
    </button>

    <button class="btn" type="button" onclick="mostrarDetalhesLeadPorId(${lead.id})">
      <i class="fa-solid fa-xmark"></i> Cancelar
    </button>
  `;

  ativarValidacaoEdicaoLead({
    titulo: lead.titulo,
    descricao: lead.descricao,
    estado: Number(lead.estado),
  });
}

// ==========================================
// GUARDAR E REMOVER
// ==========================================

async function guardarLead(id = null) {
  const username = sessionStorage.getItem("username");
  const password = sessionStorage.getItem("password");
  if (!username) return;

  const titulo = (id === null ? document.getElementById("leadTitulo") : document.getElementById("editTitulo")).value.trim();
  const descricao = (id === null ? document.getElementById("leadDescricao") : document.getElementById("editDescricao")).value.trim();
  const estado = Number((id === null ? document.getElementById("leadEstado") : document.getElementById("editEstado")).value);

  if (titulo === "" || descricao === "") return;

  const dados = { titulo, descricao, estado };

  try {
    let response;

    if (id === null) {
      // POST: Nova Lead
      response = await fetch(LEADS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          username,
          password,
        },
        body: JSON.stringify(dados),
      });
    } else {
      // PUT: Editar Lead
      response = await fetch(`${LEADS_API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          username,
          password,
        },
        body: JSON.stringify(dados),
      });
    }

    if (response.ok) {
      alert(id === null ? "Lead adicionada com sucesso!" : "Lead atualizada com sucesso!");
      await carregarLeads();
    } else {
      alert("Erro do Java: " + (await response.text()));
    }
  } catch (error) {
    console.error("Falha ao guardar:", error);
  }
}

async function removerLead(id) {
  if (!confirm("Tem a certeza que deseja remover esta lead?")) return;

  const username = sessionStorage.getItem("username");
  const password = sessionStorage.getItem("password");
  if (!username) return;

  try {
    const response = await fetch(`${LEADS_API_URL}/${id}`, {
      method: "DELETE",
      headers: { username, password },
    });

    if (response.ok) {
      alert("Lead removida!");
      await carregarLeads();
    } else {
      alert("Erro ao remover: " + (await response.text()));
    }
  } catch (error) {
    console.error("Erro na ligação:", error);
  }
}

// ==========================================
// 5. VALIDAÇÕES 
// ==========================================

function ativarValidacaoNovaLead() {
  const titulo = document.getElementById("leadTitulo");
  const descricao = document.getElementById("leadDescricao");
  const btn = document.getElementById("btnGuardarLead");

  if (!titulo || !descricao || !btn) return;

  const validar = () => {
    const ok = titulo.value.trim() !== "" && descricao.value.trim() !== "";
    btn.disabled = !ok;
  };

  titulo.addEventListener("input", validar);
  descricao.addEventListener("input", validar);
  validar();
}

function ativarValidacaoEdicaoLead(original) {
  const titulo = document.getElementById("editTitulo");
  const descricao = document.getElementById("editDescricao");
  const estado = document.getElementById("editEstado");
  const btn = document.getElementById("btnGuardarEdicaoLead");

  if (!titulo || !descricao || !estado || !btn) return;

  const validar = () => {
    const t = titulo.value.trim();
    const d = descricao.value.trim();
    const e = Number(estado.value);

    const preenchido = t !== "" && d !== "";
    const mudou = t !== original.titulo || d !== original.descricao || e !== original.estado;

    btn.disabled = !(preenchido && mudou);
  };

  titulo.addEventListener("input", validar);
  descricao.addEventListener("input", validar);
  estado.addEventListener("change", validar);
  validar();
}