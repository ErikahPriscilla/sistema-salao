// HOME.JS - Tela inicial do sistema Espaço Carmem Lúcia

// MENU LATERAL
function abrirMenu() {
  document.getElementById("sidebar").classList.add("aberta");
  document.getElementById("overlay").classList.add("ativo");
}

function fecharMenu() {
  document.getElementById("sidebar").classList.remove("aberta");
  document.getElementById("overlay").classList.remove("ativo");
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") fecharMenu();
});

// Avatar / dropdown de perfil
function togglePerfil(event) {
  event.stopPropagation();
  document.getElementById("perfilDropdown").classList.toggle("aberto");
}

document.addEventListener("click", function () {
  document.getElementById("perfilDropdown").classList.remove("aberto");
});

function gerarIniciais(nome) {
  if (!nome) return "?";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
}

function carregarPerfil() {
  const nome  = sessionStorage.getItem("usuarioNome");
  const email = sessionStorage.getItem("usuarioEmail");

  if (nome) {
    document.getElementById("avatar").textContent      = gerarIniciais(nome);
    document.getElementById("perfilNome").textContent  = nome;
    document.getElementById("perfilEmail").textContent = email || "";
  } else {
    window.location.href = "../login/login.html";
  }
}

// Data de hoje no formato DD/MM/AAAA
function hojeFormatado() {
  const d   = new Date();
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${d.getFullYear()}`;
}

// Mostra data e hora abaixo da saudação
function mostrarData() {
  const hoje   = new Date();
  const opcoes = { weekday: "long", day: "2-digit", month: "long" };
  const texto  = hoje.toLocaleDateString("pt-BR", opcoes);
  const hora   = hoje.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const el = document.getElementById("dataHoje");
  if (el) {
    el.textContent = texto.charAt(0).toUpperCase() + texto.slice(1) + " · " + hora;
  }
}

// Saudação por horário
function saudacao() {
  const h   = new Date().getHours();
  const msg = h < 12 ? "Bom dia!" : h < 18 ? "Boa tarde!" : "Boa noite!";
  document.querySelector(".sub").textContent = msg;
}

// Retorna "Primeiro Sobrenome" — se o nome for muito longo corta com ...
function nomeResumido(nomeCompleto) {
  if (!nomeCompleto) return "";
  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length <= 2) return nomeCompleto; // já é curto, mostra tudo
  // Mais de 2 partes: mostra primeiro + último sobrenome
  return partes[0] + " " + partes[partes.length - 1];
}

// Dados (futuramente virão do backend)
const agendamentosDados = [
  { nome: "Gabrielle Lima",  tel: "61999990001", hora: "09:00", servico: "Escova",            data: "07/06/2026", funcionario: "Carmem Lúcia" },
  { nome: "Zilda Brito",     tel: "61999990002", hora: "10:30", servico: "Manicure",          data: "07/06/2026", funcionario: "Erika"        },
  { nome: "Gabriel Santos",  tel: "61999990004", hora: "11:00", servico: "Corte de Cabelo",   data: "07/06/2026", funcionario: "Carmem Lúcia" },
  { nome: "Yan Cruz",        tel: "61999990003", hora: "14:00", servico: "Corte Masculino",   data: "07/06/2026", funcionario: "Carmem Lúcia" },
  { nome: "Guilherme Souza", tel: "61999990005", hora: "15:30", servico: "Corte e Barba",     data: "07/06/2026", funcionario: "Erika"        },
];

// Carrega agendamentos do dia
function carregarAgendamentosHoje() {
  const lista = document.getElementById("listaHome");
  if (!lista) return;

  const hoje  = hojeFormatado();
  const cargo = sessionStorage.getItem("usuarioCargo");
  const nome  = sessionStorage.getItem("usuarioNome") || "";

  let deHoje = agendamentosDados.filter(a => a.data === hoje);

  if (cargo !== "proprietaria") {
    deHoje = deHoje.filter(a =>
      a.funcionario.toLowerCase().includes(nome.split(" ")[0].toLowerCase())
    );
  }

  deHoje.sort((a, b) => a.hora.localeCompare(b.hora));

  // No mobile limita a 4 agendamentos — a usuária clica "Ver todos" para ver o resto
  const isMobile = window.innerWidth < 768;
  const limite   = isMobile ? 5 : deHoje.length;
  const deHojeLimitado = deHoje.slice(0, limite);

  lista.innerHTML = "";

  if (deHoje.length === 0) {
    const li = document.createElement("li");
    li.className   = "card-item-vazio";
    li.textContent = "Nenhum agendamento";
    lista.appendChild(li);
    return;
  }

  deHojeLimitado.forEach(a => {
    const li = document.createElement("li");
    li.className = "card-item";

    // Tudo dentro do card-item:
    // Linha 1: hora + nome + WhatsApp (sempre dentro da área com borda)
    // Linha 2: serviço (alinhado abaixo do nome via padding-left)
    li.innerHTML = `
      <div class="card-item-linha">
        <span class="card-item-hora">${a.hora}</span>
        <span class="card-item-nome">${nomeResumido(a.nome)}</span>
        <!-- WhatsApp mobile: dentro da linha (some no PC via CSS) -->
        <a class="btn-whats-item"
           href="https://wa.me/${a.tel || ''}"
           target="_blank"
           title="WhatsApp de ${a.nome}"
           aria-label="WhatsApp de ${a.nome}"
           style="margin-left:auto; flex-shrink:0;">
          <i class="fa-brands fa-whatsapp" style="font-size:0.85rem;"></i>
        </a>
      </div>
      <!-- Serviço: linha de baixo no mobile, inline no PC -->
      <span class="card-item-servico">${a.servico}</span>
      <!-- WhatsApp desktop: aparece no FINAL da linha (some no mobile via CSS) -->
      <a class="btn-whats-item btn-whats-desktop"
         href="https://wa.me/${a.tel || ''}"
         target="_blank"
         title="WhatsApp de ${a.nome}"
         aria-label="WhatsApp de ${a.nome}"
         style="display:none; margin-left:auto; flex-shrink:0;">
        <i class="fa-brands fa-whatsapp" style="font-size:0.85rem;"></i>
      </a>
    `;
    lista.appendChild(li);
  });
}

// Lucro do dia
function carregarLucroHoje() {
  const lista = document.getElementById("listaLucro");
  if (!lista) return;

  lista.innerHTML = "";

  const cargo = sessionStorage.getItem("usuarioCargo");
  const nomeUsuario = sessionStorage.getItem("usuarioNome") || "";

  const lucroDados = [
    { nome: "Carmem", valor: "R$ 600,00", servicos: "4 serviços", valorNumerico: 600.00 },
    { nome: "Erika",  valor: "R$ 200,00", servicos: "2 serviços", valorNumerico: 200.00 }
  ];

  let mostra = [];
  let totalFuncionario = 0;

  if (cargo === "proprietaria") {
    mostra = lucroDados;
  } else {
    mostra = lucroDados.filter(l => nomeUsuario.toLowerCase().includes(l.nome.toLowerCase()));
    if (mostra.length > 0) totalFuncionario = mostra[0].valorNumerico;
  }

  if (mostra.length === 0) {
    const li = document.createElement("li");
    li.className = "card-item-vazio";
    li.textContent = "Nenhum lucro registrado para este funcionário.";
    lista.appendChild(li);
    return totalFuncionario;
  }

  mostra.forEach(l => {
    const li = document.createElement("li");
    li.className = "card-item";
    li.innerHTML = `
      <div class="card-item-linha">
        <span class="card-item-hora">${l.valor}</span>
        <span class="card-item-nome">${l.nome}</span>
      </div>
      <span class="card-item-servico">${l.servicos}</span>
    `;
    lista.appendChild(li);
  });

  return totalFuncionario;
}

function toggleLucro() {
  const el = document.getElementById("lucroValor");
  const lista = document.getElementById("listaLucro");
  const icone = document.getElementById("iconOlho");
  const aberto = icone.classList.contains("fa-eye");
  const cargo = sessionStorage.getItem("usuarioCargo");
  const nomeUsuario = sessionStorage.getItem("usuarioNome") || "";

  if (aberto) {
    el.textContent = "";
    lista.innerHTML = "";
    icone.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    if (cargo === "proprietaria") {
      el.textContent = "R$ 800,00";
      carregarLucroHoje();
    } else {
      const lucroDados = [
        { nome: "Carmem", valorNumerico: 600.00 },
        { nome: "Erika",  valorNumerico: 200.00 }
      ];
      const funcionario = lucroDados.find(l => nomeUsuario.toLowerCase().includes(l.nome.toLowerCase()));
      if (funcionario) {
        el.textContent = `R$ ${funcionario.valorNumerico.toFixed(2).replace('.', ',')}`;
      } else {
        el.textContent = "";
      }
      carregarLucroHoje();
    }
    icone.classList.replace("fa-eye-slash", "fa-eye");
  }
}

// Permissões
(function aplicarPermissoes() {
  const cargo = sessionStorage.getItem("usuarioCargo");
  const restritos = ["funcionarios.html", "servico.html", "financas.html"];
  if (cargo === "proprietaria") return;
  document.querySelectorAll(".sidebar-menu a").forEach(function(link) {
    const href = link.getAttribute("href") || "";
    const file = href.split("/").pop();
    if (restritos.includes(file))
      link.closest("li").style.display = "none";
  });
})();

// Link "Ver detalhes" só para proprietária
(function controlarLinkFinancas() {
  const cargo = sessionStorage.getItem("usuarioCargo");
  const linkDetalhes = document.getElementById("link-ver-detalhes");
  if (linkDetalhes && cargo !== "proprietaria") {
    linkDetalhes.style.display = "none";
  }
})();

// BOTÃO WHATSAPP flutuante — envia resumo do dia
const btnWhatsHome = document.querySelector(".btn-whats");
if (btnWhatsHome) {
  btnWhatsHome.onclick = function() {
    const hoje = hojeFormatado();
    const agendamentosHoje = agendamentosDados.filter(a => a.data === hoje);

    if (agendamentosHoje.length === 0) {
      alert("Nenhum agendamento para hoje.");
      return;
    }

    let msg = `*RESUMO DE AGENDAMENTOS - ${hoje}*\n\n`;
    agendamentosHoje.forEach(a => {
      msg += `${a.hora} - ${a.nome} - ${a.servico}\n`;
    });
    msg += `\nTotal: ${agendamentosHoje.length} agendamento(s)`;

    const telefoneCarmem = "5561998015647";
    window.open(`https://wa.me/${telefoneCarmem}?text=${encodeURIComponent(msg)}`, "_blank");
  };
}

// Inicializa
mostrarData();
saudacao();
carregarPerfil();
carregarAgendamentosHoje();
