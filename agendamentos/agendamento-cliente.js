// AGENDAMENTO-CLIENTE.JS

const WHATSAPP_LOJA = "5561998015647";

let dadosAgendamento = {};

// Submit do formulário
document.getElementById("formAgendamento").addEventListener("submit", function(e) {
  e.preventDefault();
  agendar();
});

// Limpar formulário
function limparFormulario() {
  ["nomeCliente","telCliente","dataAgend","horaAgend","servicoAgend","funcAgend"]
    .forEach(function(id) { document.getElementById(id).value = ""; });
  const msg = document.getElementById("msgAgendamento");
  msg.className = "msg";
  msg.textContent = "";
}

// Horário de funcionamento: terça a sábado, 07:00 às 18:00
(function configurarCampoData() {
  const campoData = document.getElementById("dataAgend");
  const campoHora = document.getElementById("horaAgend");

  // Data mínima = hoje
  const hoje = new Date();
  const dd = String(hoje.getDate()).padStart(2, "0");
  const mm = String(hoje.getMonth() + 1).padStart(2, "0");
  campoData.min = `${hoje.getFullYear()}-${mm}-${dd}`;

  // Limitar horário entre 07:00 e 18:00
  campoHora.min = "07:00";
  campoHora.max = "18:00";

  // Quando o cliente escolher uma data, checar se é domingo ou segunda
  campoData.addEventListener("change", function() {
    if (!this.value) return;
    const diaSemana = new Date(this.value + "T12:00").getDay();
    const msg = document.getElementById("msgAgendamento");
    if (diaSemana === 0 || diaSemana === 1) {
      msg.textContent = "O salão não funciona aos domingos e segundas. Escolha outro dia.";
      msg.classList.add("show", "erro");
      this.value = "";
    } else {
      msg.className = "msg";
      msg.textContent = "";
    }
  });
})();

// Validar e abrir modal
function agendar() {
  const nome    = document.getElementById("nomeCliente").value.trim();
  const tel     = document.getElementById("telCliente").value.trim();
  const data    = document.getElementById("dataAgend").value;
  const hora    = document.getElementById("horaAgend").value;
  const servico = document.getElementById("servicoAgend").value;
  const func    = document.getElementById("funcAgend").value;

  const msg = document.getElementById("msgAgendamento");
  msg.className = "msg";
  msg.textContent = "";

  // Nome obrigatório
  if (!nome) {
    msg.textContent = "Por favor, informe seu nome.";
    msg.classList.add("show", "erro");
    document.getElementById("nomeCliente").focus();
    return;
  }

  // Telefone obrigatório
  if (!tel) {
    msg.textContent = "Por favor, informe seu telefone.";
    msg.classList.add("show", "erro");
    document.getElementById("telCliente").focus();
    return;
  }

  // Telefone: obrigatório DD (2 dígitos) + 9 + 8 dígitos = 11 dígitos no total
  const nums = tel.replace(/\D/g, "");
  if (nums.length !== 11) {
    msg.textContent = "Telefone incompleto. Digite DDD + 9 + 8 dígitos. Ex: (61) 99999-0000";
    msg.classList.add("show", "erro");
    document.getElementById("telCliente").focus();
    return;
  }
  if (nums[2] !== "9") {
    msg.textContent = "O número deve começar com 9 após o DDD. Ex: (61) 99999-0000";
    msg.classList.add("show", "erro");
    document.getElementById("telCliente").focus();
    return;
  }

  // Demais campos obrigatórios
  if (!data) {
    msg.textContent = "Selecione a data do agendamento.";
    msg.classList.add("show", "erro");
    return;
  }
  if (!hora) {
    msg.textContent = "Selecione o horário do agendamento.";
    msg.classList.add("show", "erro");
    return;
  }
  if (!servico) {
    msg.textContent = "Selecione o serviço desejado.";
    msg.classList.add("show", "erro");
    return;
  }
  if (!func) {
    msg.textContent = "Selecione o colaborador.";
    msg.classList.add("show", "erro");
    return;
  }

  // Validar dia da semana
  const diaSemana = new Date(data + "T12:00").getDay();
  if (diaSemana === 0 || diaSemana === 1) {
    msg.textContent = "O salão não funciona aos domingos e segundas. Escolha outro dia.";
    msg.classList.add("show", "erro");
    return;
  }

  // Validar horário 07:00 às 18:00
  const [h, m] = hora.split(":").map(Number);
  const minutos = h * 60 + m;
  if (minutos < 7 * 60 || minutos > 18 * 60) {
    msg.textContent = "O salão funciona das 07:00 às 18:00. Escolha um horário dentro desse período.";
    msg.classList.add("show", "erro");
    return;
  }

  const [ano, mes, dia] = data.split("-");
  dadosAgendamento = {
    nome, tel,
    data: `${dia}/${mes}/${ano}`,
    hora: hora.slice(0, 5),
    servico, func
  };

  document.getElementById("modalSucesso").classList.add("aberto");
}

// Monta mensagem e abre WhatsApp da loja
function enviarWhatsApp() {
  const { nome, tel, data, hora, servico, func } = dadosAgendamento;

  const msg =
    `🌸 *Novo Agendamento — Espaço Carmem Lúcia*\n\n` +
    `👤 *Nome:* ${nome}\n` +
    `📱 *Telefone:* ${tel}\n` +
    `📅 *Data:* ${data}\n` +
    `🕐 *Hora:* ${hora}\n` +
    `✂️ *Serviço:* ${servico}\n` +
    `💼 *Colaborador(a):* ${func}\n\n` +
    `_Agendamento realizado pelo site._`;

  window.open(`https://wa.me/${WHATSAPP_LOJA}?text=${encodeURIComponent(msg)}`, "_blank");
  fecharModal();
  limparFormulario();
}

// Fechar modal
function fecharModal() {
  document.getElementById("modalSucesso").classList.remove("aberto");
}
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("modal-overlay")) fecharModal();
});
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") fecharModal();
});

// Acessibilidade - ativa/desativa e persiste no sessionStorage
function toggleAcessibilidade() {
  const ativa = document.body.classList.toggle("acessibilidade-ativa");
  sessionStorage.setItem("acessibilidade", ativa ? "1" : "0");
}

// Restaura estado ao carregar a página
(function restaurarAcessibilidade() {
  if (sessionStorage.getItem("acessibilidade") === "1") {
    document.body.classList.add("acessibilidade-ativa");
  }
})();

// Scroll - sobe o botão quando está no topo
const btnAcess = document.getElementById("btnAcess");
function atualizarBotao() {
  // No PC a tela é maior, usa threshold maior para o botão subir
  const threshold = window.innerWidth >= 768 ? 140 : 80;
  if (window.scrollY < threshold) {
    btnAcess.classList.add("no-topo");
  } else {
    btnAcess.classList.remove("no-topo");
  }
}
window.addEventListener("scroll", atualizarBotao, { passive: true });
atualizarBotao();

// Máscara de telefone
document.getElementById("telCliente").addEventListener("input", function(e) {
  let v = e.target.value.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  if      (v.length <= 2) e.target.value = v;
  else if (v.length <= 7) e.target.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
  else                    e.target.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
});
