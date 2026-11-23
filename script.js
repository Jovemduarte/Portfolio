// starfield generation
(function () {
  const field = document.getElementById('stars');
  const count = window.innerWidth < 600 ? 70 : 130;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2 + 0.6;
    s.style.width = size + 'px';
    s.style.height = size + 'px';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDuration = (2 + Math.random() * 4) + 's';
    s.style.animationDelay = (Math.random() * 4) + 's';
    field.appendChild(s);
  }
})();

// drifting asteroid particles across the whole page
(function () {
  const n = window.innerWidth < 600 ? 8 : 16;
  for (let i = 0; i < n; i++) {
    const a = document.createElement('div');
    a.className = 'asteroid';
    a.style.left = Math.random() * 100 + 'vw';
    a.style.top = (Math.random() * 100) + 'vh';
    a.style.animationDuration = (14 + Math.random() * 18) + 's';
    a.style.animationDelay = (Math.random() * 10) + 's';
    a.style.opacity = (0.25 + Math.random() * 0.35).toFixed(2);
    document.body.appendChild(a);
  }
})();

// occasional shooting stars
(function () {
  function spawn() {
    const s = document.createElement('div');
    s.className = 'shooting-star';
    const top = Math.random() * 50;
    const left = 55 + Math.random() * 40;
    s.style.top = top + 'vh';
    s.style.left = left + 'vw';
    s.style.animation = `shoot ${1 + Math.random() * 0.6}s linear forwards`;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 2000);
  }
  setInterval(spawn, 3200);
  setTimeout(spawn, 900);
})();

// interactive astronaut: drag with inertia, snaps back to float
(function () {
  const wrap = document.getElementById('astro-wrap');
  const stage = document.getElementById('stage');
  let dragging = false;
  let originX = 0, originY = 0;
  let curX = 0, curY = 0;
  let lastX = 0, lastY = 0;
  let vx = 0, vy = 0;
  let rot = -4;
  let raf = null;
  let lastMoveT = 0;

  const eyes = document.getElementById('astro-eyes');

  let totalMoveDist = 0;

  function setTransform(x, y, r) {
    wrap.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
  }

  // visor cyber eyes subtly track cursor across the screen
  if (eyes && stage) {
    window.addEventListener('pointermove', function (e) {
      if (dragging) return;
      const rect = stage.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
      eyes.style.transform = `translate(${dx * 4.5}px, ${dy * 3}px)`;
    });
  }

  function pointerDown(e) {
    dragging = true;
    totalMoveDist = 0;
    wrap.classList.remove('floating');
    wrap.classList.add('is-dragging');
    cancelAnimationFrame(raf);
    const p = (e.touches ? e.touches[0] : e);
    originX = p.clientX;
    originY = p.clientY;
    lastX = p.clientX;
    lastY = p.clientY;
    lastMoveT = performance.now();
    wrap.setPointerCapture && e.pointerId !== undefined && wrap.setPointerCapture(e.pointerId);
  }

  function pointerMove(e) {
    if (!dragging) return;
    const p = (e.touches ? e.touches[0] : e);
    const now = performance.now();
    const dt = Math.max(now - lastMoveT, 1);
    const dx = p.clientX - originX;
    const dy = p.clientY - originY;

    totalMoveDist += Math.hypot(p.clientX - lastX, p.clientY - lastY);
    vx = (p.clientX - lastX) / dt * 16;
    vy = (p.clientY - lastY) / dt * 16;
    lastX = p.clientX; lastY = p.clientY; lastMoveT = now;

    curX = dx; curY = dy;
    rot = Math.max(-45, Math.min(45, dx * 0.25));
    setTransform(curX, curY, rot);
    if (eyes) {
      const eyeX = Math.max(-1, Math.min(1, vx / 10));
      const eyeY = Math.max(-1, Math.min(1, vy / 10));
      eyes.style.transform = `translate(${eyeX * 6}px, ${eyeY * 4}px)`;
    }
    e.preventDefault && e.preventDefault();
  }

  function pointerUp() {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove('is-dragging');
    inertiaLoop();
  }

  function inertiaLoop() {
    const bound = (stage.clientWidth / 2) - 40;
    function step() {
      // spring pull toward center
      const springX = -curX * 0.06;
      const springY = -curY * 0.06;
      vx += springX;
      vy += springY;
      vx *= 0.92;
      vy *= 0.92;
      curX += vx;
      curY += vy;

      if (curX > bound) { curX = bound; vx *= -0.5; }
      if (curX < -bound) { curX = -bound; vx *= -0.5; }
      if (curY > bound) { curY = bound; vy *= -0.5; }
      if (curY < -bound) { curY = -bound; vy *= -0.5; }

      rot += (0 - rot) * 0.03 + vx * 0.4;
      rot = Math.max(-60, Math.min(60, rot));

      setTransform(curX, curY, rot);

      if (Math.abs(vx) > 0.06 || Math.abs(vy) > 0.06 || Math.abs(curX) > 0.5 || Math.abs(curY) > 0.5) {
        raf = requestAnimationFrame(step);
      } else {
        curX = 0; curY = 0; vx = 0; vy = 0; rot = -4;
        wrap.style.transform = '';
        wrap.classList.add('floating');
      }
    }
    raf = requestAnimationFrame(step);
  }

  function tapWiggle() {
    wrap.classList.remove('floating');
    cancelAnimationFrame(raf);
    curX = 0; curY = -6; vx = (Math.random() - 0.5) * 10; vy = -4; rot = (Math.random() - 0.5) * 40;
    inertiaLoop();
  }

  wrap.addEventListener('pointerdown', pointerDown);
  window.addEventListener('pointermove', pointerMove);
  window.addEventListener('pointerup', pointerUp);

  // Clicking the astronaut triggers wiggle AND opens the Roobot AI chat
  wrap.addEventListener('click', function (e) {
    if (totalMoveDist < 10) {
      tapWiggle();
      if (window.openRoobotChat) window.openRoobotChat();
    }
  });

  // Clicking the speech callout also opens Roobot AI chat
  const callout = document.getElementById('roobot-callout');
  if (callout) {
    callout.addEventListener('click', function () {
      tapWiggle();
      if (window.openRoobotChat) window.openRoobotChat();
    });
    callout.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        tapWiggle();
        if (window.openRoobotChat) window.openRoobotChat();
      }
    });
  }
})();

// ========================================================
// ROOBOT AI CHAT ENGINE
// ========================================================
(function () {
  const chatWindow = document.getElementById('roobot-chat');
  const backdrop = document.getElementById('roobot-backdrop');
  const floatBtn = document.getElementById('roobot-floating-btn');
  const closeBtn = document.getElementById('roobot-close-btn');
  const ttsBtn = document.getElementById('roobot-tts-btn');
  const messagesEl = document.getElementById('roobot-messages');
  const form = document.getElementById('roobot-form');
  const input = document.getElementById('roobot-input');
  const suggestionsBox = document.getElementById('roobot-suggestions');
  const chips = document.querySelectorAll('.roobot-chip');

  let ttsEnabled = false;
  let isTyping = false;
  let initialGreetingSent = false;

  function formatTime() {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  function safeFormat(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\[(.*?)\]\(((?:https?:\/\/|mailto:|#).*?)\)/g, (match, label, href) => {
        if (href.startsWith('#')) {
          return `<a href="${href}" class="chat-section-link" data-scroll="${href}">${label}</a>`;
        }
        return `<a href="${href}" target="_blank" rel="noopener">${label}</a>`;
      })
      .replace(/\n/g, '<br>');
  }

  function speakText(text) {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*_#`[\]()]/g, ' ').replace(/(https?:\/\/|mailto:|#)\S+/g, '');
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = 'pt-BR';
    utter.rate = 1.05;
    window.speechSynthesis.speak(utter);
  }

  function appendMessage(sender, text) {
    const msg = document.createElement('div');
    msg.className = `roobot-msg msg-${sender}`;

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = safeFormat(text);

    const time = document.createElement('div');
    time.className = 'msg-time';
    time.textContent = formatTime();

    msg.appendChild(bubble);
    msg.appendChild(time);
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'roobot-typing';
    typing.id = 'roobot-typing-indicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTypingIndicator() {
    const typing = document.getElementById('roobot-typing-indicator');
    if (typing) typing.remove();
  }

  function getRoobotResponse(rawText) {
    if (!rawText) return "Olá! Como posso te ajudar hoje? 🚀";
    const text = rawText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    // 1. Quem é o Michel / Sobre
    if (/\b(quem e|sobre|trajetoria|historia|experiencia|perfil|michel bispo|michel|autor|dono)\b/.test(text) && !/projeto|contato|skill|habilidade/.test(text)) {
      return "O **Michel Bispo** é um desenvolvedor em transição de rota apaixonado por tecnologia! 🚀\n\nEle é movido pela curiosidade de transformar lógica e criatividade em soluções reais, funcionais e bem estruturadas. Atualmente foca seus estudos em Front-end, Python e automações com n8n!\n\n[📖 Ver seção \"Sobre mim\" na página](#sobre)";
    }

    // 2. Habilidades / Tecnologias
    if (/\b(habilidade|habilidades|skill|skills|tecnologia|tecnologias|stack|ferramentas|linguagens|o que ele sabe|estuda)\b/.test(text)) {
      return "O arsenal atual do Michel é composto por:\n\n• **HTML5**: Estruturação semântica de páginas e acessibilidade.\n• **CSS3**: Estilos avançados, temas espaciais e animações fluidas.\n• **Python**: Lógica algorítmica, scripts e apps com CustomTkinter.\n• **n8n**: Orquestração de workflows automatizados e conexão de APIs.\n\n[🛠️ Ver seção de Habilidades na página](#skills)";
    }

    // 3. n8n
    if (/\b(n8n|automacao|automacoes|workflow|fluxo|integracao|integracoes|api)\b/.test(text)) {
      return "O **n8n** é uma das ferramentas favoritas do Michel! ⚡\n\nÉ uma plataforma líder para orquestrar workflows automatizados, conectar APIs e automatizar processos inteligentes sem atrito.\n\n[⚡ Ver card do n8n nas Habilidades](#skills)";
    }

    // 4. Projetos
    if (/\b(projeto|projetos|portfolio|portfolio espacial|trabalhos|repositorio)\b/.test(text) && !/quem|contato/.test(text)) {
      return "Aqui estão os projetos em órbita do Michel:\n\n1. 🤖 **Chatbot com IA**: App desktop em Python (CustomTkinter) conectado à API do Google Gemini com memória de conversa.\n2. 🌌 **Portfólio Espacial**: Este site interativo com gravidade zero e astronauta reativo!\n\n[🚀 Explorar Projetos na página](#projetos)\n[🐙 Ver repositórios no GitHub](https://github.com/Jovemduarte)";
    }

    // 5. Chatbot / Gemini
    if (/\b(chatbot|ia|gemini|customtkinter|inteligencia artificial)\b/.test(text)) {
      return "O Michel criou um **Chatbot com IA** em Python usando a biblioteca CustomTkinter para uma interface moderna, integrado à API do Google Gemini com memória de histórico contextual!\n\n[🚀 Ver projeto na página](#projetos)";
    }

    // 6. Contato / Falar com ele / Redes
    if (/\b(contato|email|e-mail|falar|conversar|redes|instagram|github|mensagem|contratar|trabalhar)\b/.test(text)) {
      return "Quer falar com o Michel? Aqui estão as coordenadas de contato:\n\n• 📧 **E-mail**: [pbmarlon14@gmail.com](mailto:pbmarlon14@gmail.com)\n• 🐙 **GitHub**: [github.com/Jovemduarte](https://github.com/Jovemduarte)\n• 📸 **Instagram**: [@euduartesz](https://www.instagram.com/euduartesz/)\n\n[📬 Ir para a seção de Contato](#contato)";
    }

    // 7. Roobot / Quem é você
    if (/\b(voce|roobot|seu nome|quem e voce|robo|assistente)\b/.test(text)) {
      return "Prazer! Eu sou o **Roobot** 🤖✨, o assistente virtual e mascote oficial do Michel Bispo. Minha missão é guiar os visitantes por esta nave estelar de projetos e responder qualquer dúvida sobre as criações dele!";
    }

    // 8. Piada / Humor
    if (/\b(piada|engracad|humor|conte uma piada|rir|meme)\b/.test(text)) {
      const piadas = [
        "Por que o astronauta terminou o namoro? Porque ele precisava de espaço! 🌌😂",
        "Existem 10 tipos de pessoas no mundo: as que entendem binário e as que não entendem! 🤖",
        "Qual é o café favorito dos programadores? O Java! ☕💻",
        "O que o CSS disse para o HTML? 'Sem mim você não tem estilo nenhum!' ✨💅"
      ];
      return piadas[Math.floor(Math.random() * piadas.length)];
    }

    // 9. Saudações
    if (/\b(oi|ola|hey|hello|e ai|bom dia|boa tarde|boa noite|opa|salve)\b/.test(text)) {
      return "Olá, viajante espacial! 🚀 Sou o **Roobot**. Que bom ter você a bordo! Em que posso te ajudar hoje? (Clique nas sugestões acima ou envie sua dúvida!)";
    }

    // 10. Agradecimentos
    if (/\b(obrigado|obrigada|valeu|thanks|top|legal|show|perfeito|valeu demais)\b/.test(text)) {
      return "Disponha sempre! ✦ Foi um prazer te ajudar. Se precisar de mais alguma informação sobre o Michel ou seus projetos, estou por aqui!";
    }

    // 11. Dicas de programação
    if (/\b(aprender|programar|dica|estudar|como comecar|conselho)\b/.test(text)) {
      return "A dica de ouro do Michel é: comece pela base da lógica e nunca pare de praticar com projetos reais! Criar pequenos projetos em HTML, CSS e Python traz motivação diária. E aprender ferramentas como n8n dá superpoderes para automatizar tarefas!";
    }

    // Fallback
    return "Excelente pergunta! 🌌 Como assistente de bordo do Michel Bispo, sou especialista em falar sobre a jornada dele na programação, suas tecnologias (**HTML, CSS, Python, n8n**), seus projetos ou canais de contato. Você pode clicar nas sugestões acima ou me perguntar diretamente!";
  }

  function handleUserInput(text) {
    if (!text) return;
    const cleanText = text.trim();
    if (!cleanText) return;

    appendMessage('user', cleanText);

    // If currently typing, reset to answer immediately
    removeTypingIndicator();
    isTyping = true;
    showTypingIndicator();

    // Trigger happy bounce on the astronaut
    const wrap = document.getElementById('astro-wrap');
    if (wrap) {
      wrap.style.transform = 'translate(0, -12px) scale(1.05) rotate(3deg)';
      setTimeout(() => { wrap.style.transform = ''; }, 450);
    }

    setTimeout(() => {
      try {
        removeTypingIndicator();
        const reply = getRoobotResponse(cleanText);
        appendMessage('bot', reply);
        speakText(reply);
      } catch (err) {
        console.error('Roobot error:', err);
        removeTypingIndicator();
        appendMessage('bot', 'Desculpe, ocorreu uma instabilidade estelar! 🛸 Pode perguntar novamente?');
      } finally {
        isTyping = false;
      }
    }, 380 + Math.random() * 200);
  }

  function openChat() {
    if (!chatWindow) return;
    chatWindow.classList.add('active');
    chatWindow.setAttribute('aria-hidden', 'false');
    if (backdrop) backdrop.classList.add('active');
    if (floatBtn) floatBtn.classList.add('hidden');

    if (!initialGreetingSent) {
      initialGreetingSent = true;
      appendMessage('bot', "Olá, explorador(a) espacial! 🚀 Sou o **Roobot**, o assistente de IA do Michel Bispo. Estou aqui para responder dúvidas sobre os projetos dele, tecnologias (**HTML, CSS, Python, n8n**) ou como entrar em contato. O que gostaria de saber?");
    }

    setTimeout(() => {
      if (input) input.focus();
    }, 300);
  }

  function closeChat() {
    if (!chatWindow) return;
    chatWindow.classList.remove('active');
    chatWindow.setAttribute('aria-hidden', 'true');
    if (backdrop) backdrop.classList.remove('active');
    if (floatBtn) floatBtn.classList.remove('hidden');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  window.openRoobotChat = openChat;
  window.closeRoobotChat = closeChat;

  if (closeBtn) closeBtn.addEventListener('click', closeChat);
  if (backdrop) backdrop.addEventListener('click', closeChat);
  if (floatBtn) floatBtn.addEventListener('click', openChat);

  if (ttsBtn) {
    ttsBtn.addEventListener('click', function () {
      ttsEnabled = !ttsEnabled;
      ttsBtn.classList.toggle('active', ttsEnabled);
      ttsBtn.title = ttsEnabled ? "Voz do Roobot ativada (clique para mutar)" : "Ativar voz do Roobot";
      if (!ttsEnabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const text = input.value.trim();
      if (text) {
        input.value = '';
        handleUserInput(text);
      }
    });
  }

  // Handle smooth scroll clicks on section links inside chat messages
  if (messagesEl) {
    messagesEl.addEventListener('click', function (e) {
      const link = e.target.closest('.chat-section-link');
      if (link) {
        const href = link.getAttribute('data-scroll');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            target.style.transition = 'box-shadow 0.4s ease';
            target.style.boxShadow = '0 0 35px rgba(0, 240, 255, 0.45)';
            setTimeout(() => { target.style.boxShadow = ''; }, 2000);
          }
        }
      }
    });
  }

  // Click & Touch handler for suggestion chips
  function onChipClick(chipEl) {
    if (!chipEl) return;
    const q = chipEl.getAttribute('data-q') || chipEl.dataset.q || chipEl.textContent.trim();
    if (!q) return;

    chipEl.classList.add('chip-clicked');
    setTimeout(() => chipEl.classList.remove('chip-clicked'), 350);

    handleUserInput(q);
  }

  // Delegation on container
  if (suggestionsBox) {
    suggestionsBox.addEventListener('click', function (e) {
      const chip = e.target.closest('.roobot-chip');
      if (chip) {
        e.preventDefault();
        e.stopPropagation();
        onChipClick(chip);
      }
    });
  }

  // Direct binding on each chip
  chips.forEach(chip => {
    chip.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      onChipClick(this);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && chatWindow && chatWindow.classList.contains('active')) {
      closeChat();
    }
  });
})();
