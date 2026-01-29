async function fetchBotConfig(publicKey) {
  try {
    const res = await fetch(
      `http://localhost:3000/api/public/bot/${publicKey}`,
    );
    if (!res.ok) throw new Error("Bot config not found");
    return await res.json();
  } catch (e) {
    console.error("Failed to load bot config", e);
    return {
      name: "AI Assistant",
      primary_color: "#4f46e5",
    };
  }
}

function createUserMessage(text, themeColor) {
  const div = document.createElement("div");
  div.style.cssText = `
    align-self: flex-end;
    background: ${themeColor};
    color: white;
    padding: 10px 12px;
    border-radius: 14px 14px 2px 14px;
    max-width: 80%;
    margin: 6px 0;
    font-size: 14px;
    line-height: 1.4;
  `;
  div.textContent = text;
  return div;
}

function createBotMessage() {
  const div = document.createElement("div");
  div.style.cssText = `
    align-self: flex-start;
    background: #f3f4f6;
    color: #111;
    padding: 10px 12px;
    border-radius: 14px 14px 14px 2px;
    max-width: 80%;
    margin: 6px 0;
    font-size: 14px;
    line-height: 1.4;
    white-space: pre-wrap;
  `;
  return div;
}

function createLoadingBubble() {
  const div = document.createElement("div");
  div.style.cssText = `
    align-self: flex-start;
    background: #f3f4f6;
    color: #666;
    padding: 10px 12px;
    border-radius: 14px 14px 14px 2px;
    margin: 6px 0;
    font-size: 14px;
  `;
  div.textContent = "Typing…";
  return div;
}

(async function () {
  const script = document.querySelector("script[bot-id]");
  const publicKey = script?.getAttribute("bot-id");

  if (!publicKey) {
    console.error("Chatbot widget: missing bot-id");
    return;
  }

  const bot = await fetchBotConfig(publicKey);

  const THEME = {
    color: bot.primary_color,
    botName: bot.name,
  };

  const launcher = document.createElement("button");
  launcher.innerHTML = "💬";
  launcher.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    background: ${THEME.color};
    color: white;
    font-size: 24px;
    cursor: pointer;
    z-index: 9999;
    box-shadow: 0 10px 25px rgba(0,0,0,.25);
  `;
  document.body.appendChild(launcher);

  const widget = document.createElement("div");
  widget.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 360px;
    height: 480px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0,0,0,.2);
    display: none;
    flex-direction: column;
    font-family: system-ui;
    z-index: 9999;
    overflow: hidden;
    opacity: 0;
    transform: translateY(20px) scale(0.95);
    pointer-events: none;
    transition:
    opacity 0.25s ease,
    transform 0.25s ease;
  `;

  widget.innerHTML = `
    <div style="
      background:${THEME.color};
      color:white;
      padding:12px;
      font-weight:600;
      display:flex;
      justify-content:space-between;
      align-items:center;
    ">
      <span>${THEME.botName}</span>
      <button id="ai-close" style="
        background:none;
        border:none;
        color:white;
        font-size:18px;
        cursor:pointer;
      ">✕</button>
    </div>

    <div id="ai-messages" style="flex:1;padding:8px;overflow-y:auto"></div>

    <form id="ai-form" style="display:flex;border-top:1px solid #eee">
      <input
        id="ai-input"
        placeholder="Ask something…"
        style="flex:1;padding:12px;border:none;outline:none"
      />
      <button
        style="background:${THEME.color};color:white;border:none;padding:0 16px"
      >Send</button>
    </form>
  `;

  document.body.appendChild(widget);

  let isOpen = false;

  function openWidget() {
    isOpen = true;
    widget.style.display = "flex";
    requestAnimationFrame(() => {
      widget.style.opacity = "1";
      widget.style.transform = "translateY(0) scale(1)";
      widget.style.pointerEvents = "auto";
    });
  }

  function closeWidget() {
    isOpen = false;
    widget.style.opacity = "0";
    widget.style.transform = "translateY(20px) scale(0.95)";
    widget.style.pointerEvents = "none";

    setTimeout(() => {
      if (!isOpen) widget.style.display = "none";
    }, 250);
  }

  launcher.onclick = () => {
    isOpen ? closeWidget() : openWidget();
  };

  widget.querySelector("#ai-close").onclick = closeWidget;

  const messages = widget.querySelector("#ai-messages");
  messages.style.display = "flex";
  messages.style.flexDirection = "column";
  messages.style.gap = "4px";

  const form = widget.querySelector("#ai-form");
  const input = widget.querySelector("#ai-input");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const userBubble = createUserMessage(text, THEME.color);
    messages.appendChild(userBubble);
    messages.scrollTop = messages.scrollHeight;
    input.value = "";

    const loadingBubble = createLoadingBubble();
    messages.appendChild(loadingBubble);
    messages.scrollTop = messages.scrollHeight;

    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicKey, message: text }),
    });

    loadingBubble.remove();

    const botBubble = createBotMessage();
    messages.appendChild(botBubble);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let answer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      answer += decoder.decode(value);
      botBubble.textContent = answer;
      messages.scrollTop = messages.scrollHeight;
    }
  });
})();
