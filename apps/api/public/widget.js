(function () {
  const script = document.currentScript;
  const publicKey = script.getAttribute("data-bot");

  if (!publicKey) {
    console.error("Chatbot widget: missing data-bot");
    return;
  }

  const container = document.createElement("div");
  container.innerHTML = `
    <div id="ai-widget" style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      height: 420px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      font-family: system-ui;
      z-index: 9999;
    ">
      <div style="padding: 12px; font-weight: bold; border-bottom: 1px solid #eee;">
        Chat with us
      </div>
      <div id="ai-messages" style="flex: 1; padding: 8px; overflow-y: auto;"></div>
      <form id="ai-form" style="display: flex; border-top: 1px solid #eee;">
        <input id="ai-input" placeholder="Ask something…" style="flex:1;padding:8px;border:none;outline:none;" />
        <button style="padding:8px">Send</button>
      </form>
    </div>
  `;

  document.body.appendChild(container);

  const messages = container.querySelector("#ai-messages");
  const form = container.querySelector("#ai-form");
  const input = container.querySelector("#ai-input");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    messages.innerHTML += `<div><b>You:</b> ${text}</div>`;
    input.value = "";

    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey,
        message: text,
      }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let answer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      answer += decoder.decode(value);
      messages.innerHTML += `<div><b>Bot:</b> ${answer}</div>`;
    }
  });
})();
