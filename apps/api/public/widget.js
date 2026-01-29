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
  `;

  widget.innerHTML = `
    <div style="background:${THEME.color};color:white;padding:12px;font-weight:600">
      ${THEME.botName}
    </div>
    <div id="ai-messages" style="flex:1;padding:8px;overflow-y:auto"></div>
    <form id="ai-form" style="display:flex;border-top:1px solid #eee">
      <input id="ai-input" placeholder="Ask something…" style="flex:1;padding:14px;border:none;outline:none" />
      <button style="background:${THEME.color};color:white;border:none;padding:0 16px">Send</button>
    </form>
  `;

  document.body.appendChild(widget);

  launcher.onclick = () => {
    widget.style.display = widget.style.display === "none" ? "flex" : "none";
  };

  const messages = widget.querySelector("#ai-messages");
  const form = widget.querySelector("#ai-form");
  const input = widget.querySelector("#ai-input");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    messages.innerHTML += `<div><b>You:</b> ${text}</div>`;
    input.value = "";

    const botMsg = document.createElement("div");
    botMsg.innerHTML = `<b>Bot:</b> `;
    messages.appendChild(botMsg);

    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicKey, message: text }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let answer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      answer += decoder.decode(value);
      botMsg.innerHTML = `<b>Bot:</b> ${answer}`;
      messages.scrollTop = messages.scrollHeight;
    }
  });
})();
