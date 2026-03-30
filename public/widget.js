// async function fetchBotConfig(publicKey) {
//   try {
//     const res = await fetch(
//       `http://localhost:3000/api/public/bot/${publicKey}`,
//     );
//     if (!res.ok) throw new Error("Bot config not found");
//     return await res.json();
//   } catch (e) {
//     console.error("Failed to load bot config", e);
//     return {
//       name: "AI Assistant",
//       primary_color: "#4f46e5",
//     };
//   }
// }

// function createUserMessage(text, themeColor) {
//   const div = document.createElement("div");
//   div.style.cssText = `
//     align-self: flex-end;
//     background: ${themeColor};
//     color: white;
//     padding: 10px 12px;
//     border-radius: 14px 14px 2px 14px;
//     max-width: 80%;
//     margin: 6px 0;
//     font-size: 14px;
//     line-height: 1.4;
//   `;
//   div.textContent = text;
//   return div;
// }

// function createBotMessage() {
//   const div = document.createElement("div");
//   div.style.cssText = `
//     align-self: flex-start;
//     background: #f3f4f6;
//     color: #111;
//     padding: 10px 12px;
//     border-radius: 14px 14px 14px 2px;
//     max-width: 80%;
//     margin: 6px 0;
//     font-size: 14px;
//     line-height: 1.4;
//   `;
//   return div;
// }

// function createGreetingMessage(botName) {
//   const div = createBotMessage();

//   div.innerHTML = `
//     Hi 👋 I'm <strong>${botName}</strong>.<br/>
//     How can I help you today?
//   `;

//   return div;
// }

// function createLoadingBubble() {
//   const div = document.createElement("div");
//   div.style.cssText = `
//     align-self: flex-start;
//     background: #f3f4f6;
//     color: #666;
//     padding: 10px 12px;
//     border-radius: 14px 14px 14px 2px;
//     margin: 6px 0;
//     font-size: 14px;
//   `;
//   div.textContent = "Typing…";
//   return div;
// }

// (function loadMarked() {
//   if (window.marked) return;

//   const script = document.createElement("script");
//   script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
//   script.async = true;
//   document.head.appendChild(script);
// })();

// (async function () {
//   const script = document.querySelector("script[bot-id]");
//   const publicKey = script?.getAttribute("bot-id");

//   if (!publicKey) {
//     console.error("Chatbot widget: missing bot-id");
//     return;
//   }

//   const conversationKey = `chat_conversation_id_${publicKey}`;
//   const conversationId =
//     localStorage.getItem(conversationKey) || crypto.randomUUID();
//   localStorage.setItem(conversationKey, conversationId);

//   const bot = await fetchBotConfig(publicKey);

//   const THEME = {
//     color: bot.primary_color,
//     botName: bot.name,
//   };

//   const launcher = document.createElement("button");
//   launcher.innerHTML = "💬";
//   launcher.style.cssText = `
//     position: fixed;
//     bottom: 20px;
//     right: 20px;
//     width: 56px;
//     height: 56px;
//     border-radius: 50%;
//     border: none;
//     background: ${THEME.color};
//     color: white;
//     font-size: 24px;
//     cursor: pointer;
//     z-index: 9999;
//     box-shadow: 0 10px 25px rgba(0,0,0,.25);
//   `;
//   document.body.appendChild(launcher);

//   const widget = document.createElement("div");
//   widget.style.cssText = `
//     position: fixed;
//     bottom: 90px;
//     right: 20px;
//     width: 360px;
//     height: 480px;
//     background: white;
//     border-radius: 12px;
//     box-shadow: 0 20px 40px rgba(0,0,0,.2);
//     display: none;
//     flex-direction: column;
//     font-family: system-ui;
//     z-index: 9999;
//     overflow: hidden;
//     opacity: 0;
//     transform: translateY(20px) scale(0.95);
//     pointer-events: none;
//     transition:
//     opacity 0.25s ease,
//     transform 0.25s ease;
//   `;

//   widget.innerHTML = `
//     <div style="
//       background:${THEME.color};
//       color:white;
//       padding:12px;
//       font-weight:600;
//       display:flex;
//       justify-content:space-between;
//       align-items:center;
//     ">
//       <span>${THEME.botName}</span>
//       <button id="ai-close" style="
//         background:none;
//         border:none;
//         color:white;
//         font-size:18px;
//         cursor:pointer;
//       ">✕</button>
//     </div>

//     <div id="ai-messages" style="flex:1;padding:8px;overflow-y:auto"></div>

//     <form id="ai-form" style="display:flex;border-top:1px solid #eee">
//       <input
//         id="ai-input"
//         placeholder="Ask something…"
//         style="flex:1;padding:12px;border:none;outline:none"
//       />
//       <button
//         style="background:${THEME.color};color:white;border:none;padding:0 16px"
//       >Send</button>
//     </form>
//   `;

//   document.body.appendChild(widget);

//   const markdownStyle = document.createElement("style");
//   markdownStyle.textContent = `
//   #ai-messages p {
//     margin: 0;
//     padding: 0;
//     display: inline;
//   }

//   #ai-messages br {
//     line-height: 1.2;
//   }

//   #ai-messages ul,
//   #ai-messages ol {
//     margin: 2px 0;
//     padding-left: 14px;
//   }

//   #ai-messages li {
//     margin: 0;
//     padding: 0;
//   }

//   #ai-messages h1,
//   #ai-messages h2,
//   #ai-messages h3,
//   #ai-messages h4 {
//     margin: 2px 0;
//     font-size: 14px;
//     font-weight: 600;
//   }

//   #ai-messages pre {
//     margin: 4px 0;
//     padding: 6px;
//     font-size: 12px;
//   }
// `;
//   document.head.appendChild(markdownStyle);

//   let isOpen = false;
//   const greetingKey = `chat_greeting_${publicKey}`;
//   let greetingShown = localStorage.getItem(greetingKey) === "true";

//   function openWidget() {
//     isOpen = true;
//     widget.style.display = "flex";

//     if (!greetingShown) {
//       setTimeout(() => {
//         const greeting = createGreetingMessage(THEME.botName);
//         messages.appendChild(greeting);
//         messages.scrollTop = messages.scrollHeight;
//       }, 400);

//       greetingShown = true;
//       localStorage.setItem(greetingKey, "true");
//     }
//     requestAnimationFrame(() => {
//       widget.style.opacity = "1";
//       widget.style.transform = "translateY(0) scale(1)";
//       widget.style.pointerEvents = "auto";
//     });
//   }

//   function closeWidget() {
//     isOpen = false;
//     widget.style.opacity = "0";
//     widget.style.transform = "translateY(20px) scale(0.95)";
//     widget.style.pointerEvents = "none";

//     setTimeout(() => {
//       if (!isOpen) widget.style.display = "none";
//     }, 250);
//   }

//   launcher.onclick = () => {
//     isOpen ? closeWidget() : openWidget();
//   };

//   widget.querySelector("#ai-close").onclick = closeWidget;

//   const messages = widget.querySelector("#ai-messages");
//   messages.style.display = "flex";
//   messages.style.flexDirection = "column";
//   messages.style.gap = "4px";

//   const form = widget.querySelector("#ai-form");
//   const input = widget.querySelector("#ai-input");

//   form.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const text = input.value.trim();
//     if (!text) return;

//     const userBubble = createUserMessage(text, THEME.color);
//     messages.appendChild(userBubble);
//     messages.scrollTop = messages.scrollHeight;
//     input.value = "";

//     const loadingBubble = createLoadingBubble();
//     messages.appendChild(loadingBubble);
//     messages.scrollTop = messages.scrollHeight;

//     const res = await fetch("http://localhost:3000/api/chat", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ publicKey, message: text, conversationId }),
//     });

//     loadingBubble.remove();

//     const botBubble = createBotMessage();
//     messages.appendChild(botBubble);

//     const reader = res.body.getReader();
//     const decoder = new TextDecoder();
//     let answer = "";

//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;
//       answer += decoder.decode(value);
//       botBubble.innerHTML = marked.parse(answer);
//       messages.scrollTop = messages.scrollHeight;
//     }
//   });
// })();

(async function () {
  const scriptTag = document.querySelector("script[bot-id]");
  const publicKey = scriptTag?.getAttribute("bot-id");
  if (!publicKey) return;

  // Derive base URL for assets from script tag
  const scriptSrc = scriptTag.src;
  const ASSET_BASE_URL = scriptSrc.substring(0, scriptSrc.lastIndexOf("/"));
  const API_BASE_URL = ASSET_BASE_URL.replace("/public", "");
  const BOT_AVATAR = `${ASSET_BASE_URL}/Chatbot.png`;
  const BOT_ICON = `${ASSET_BASE_URL}/2-bot-icon.png`;

  async function fetchBotConfig(publicKey) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/bot/${publicKey}`);
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
    max-width: 70%;
    width: fit-content;
    margin: 6px 0;
    font-size: 14px;
    line-height: 1.4;
    word-break: break-word;
  `;
    div.textContent = text;
    return div;
  }

  function createBotMessage(messages) {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      display: flex;
      align-items: flex-end;
      gap: 8px;
      margin: 6px 0;
    `;

    const avatar = document.createElement("img");
    avatar.src = BOT_ICON;
    avatar.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    `;

    const bubble = document.createElement("div");
    bubble.style.cssText = `
      background: #f3f4f6;
      color: #111;
      padding: 10px 12px;
      border-radius: 14px 14px 14px 2px;
      max-width: 80%;
      font-size: 14px;
      line-height: 1.4;
    `;

    // wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    return bubble;
  }

  function createTypingIndicator() {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 6px 0;
    `;

    const avatar = document.createElement("img");
    avatar.src = BOT_ICON;
    avatar.alt = "bot";
    avatar.style.cssText = `
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      background: #fff;
    `;

    const bubble = document.createElement("div");
    bubble.style.cssText = `
      background: #f3f4f6;
      padding: 10px 14px;
      border-radius: 14px;
      display: flex;
      gap: 4px;
    `;
    bubble.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;

    // wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    return wrapper;
  }

  function createGreetingMessage(messages, botName) {
    const bubble = createBotMessage(messages);
    bubble.innerHTML = `Hi 👋 I'm <strong>${botName}</strong>.<br/>How can I help you today?`;
  }

  // Load marked if not present
  if (!window.marked) {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
    script.async = true;
    document.head.appendChild(script);
  }

  const conversationKey = `chat_conversation_id_${publicKey}`;
  const conversationId =
    localStorage.getItem(conversationKey) || crypto.randomUUID();
  localStorage.setItem(conversationKey, conversationId);

  const bot = await fetchBotConfig(publicKey);
  const THEME = {
    color: bot.primary_color,
    botName: bot.name,
  };

  const launcher = document.createElement("button");
  launcher.innerHTML = `
    <img 
      src="${BOT_ICON}"
      alt="chat"
      style="
        width: 150%;
        height: 150%;
        object-fit: contain;
        pointer-events: none;
        border-radius: 50%;
      "
    />
  `;
  launcher.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background: transparent;
    cursor: pointer;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    // box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `;
  launcher.onmouseover = () => (launcher.style.transform = "scale(1.1)");
  launcher.onmouseout = () => (launcher.style.transform = "scale(1)");
  document.body.appendChild(launcher);

  const widget = document.createElement("div");
  widget.style.cssText = `
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 380px;
    height: 600px;
    max-height: 80vh;
    background: white;
    border-radius: 16px;
    box-shadow: 0 12px 48px rgba(0,0,0,0.15);
    display: none;
    flex-direction: column;
    font-family: system-ui, -apple-system, sans-serif;
    overflow: hidden;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 9999;
  `;

  widget.innerHTML = `
    <div style="
      background: ${THEME.color};
      color: white;
      padding: 16px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>${THEME.botName}</span>
      </div>
      <button id="ai-close" style="background:none; border:none; color:white; font-size:20px; cursor:pointer; padding: 4px;">✕</button>
    </div>
<div id="ai-messages" style="flex:1; padding: 16px; overflow-y:auto; background: #fff; display: flex; flex-direction: column;"></div>    <form id="ai-form" style="display:flex; border-top:1px solid #eee; padding: 8px; background: #f9fafb;">
      <input id="ai-input" placeholder="Type your message..."
        style="flex:1; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; outline:none; font-size: 14px;"/>
      <button style="background:${THEME.color}; color:white; border:none; padding: 0 16px; margin-left: 8px; border-radius: 8px; cursor: pointer; font-weight: 500;">
        Send
      </button>
    </form>
  `;

  document.body.appendChild(widget);

  const style = document.createElement("style");
  style.textContent = `
    .typing-dot {
      width: 4px; height: 4px; background: #888; border-radius: 50%;
      animation: typingBounce 1.4s infinite ease-in-out;
    }
    .typing-dot:nth-child(2) { animation-delay: .2s; }
    .typing-dot:nth-child(3) { animation-delay: .4s; }
    @keyframes typingBounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    #ai-messages::-webkit-scrollbar { width: 6px; }
    #ai-messages::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
    #ai-messages p { margin: 0; display: inline; }
  `;
  document.head.appendChild(style);

  const messages = widget.querySelector("#ai-messages");
  const form = widget.querySelector("#ai-form");
  const input = widget.querySelector("#ai-input");

  let isOpen = false;

  let greetingShown = false;

  function openWidget() {
    isOpen = true;
    widget.style.display = "flex";
    setTimeout(() => {
      widget.style.opacity = "1";
      widget.style.transform = "translateY(0)";
    }, 10);

    if (!greetingShown) {
      greetingShown = true;
      const typing = createTypingIndicator();
      messages.appendChild(typing);
      setTimeout(() => {
        typing.remove();
        createGreetingMessage(messages, THEME.botName);
      }, 1000);
    }
  }

  function closeWidget() {
    isOpen = false;
    widget.style.opacity = "0";
    widget.style.transform = "translateY(20px)";
    setTimeout(() => {
      if (!isOpen) widget.style.display = "none";
    }, 300);
  }

  launcher.onclick = () => (isOpen ? closeWidget() : openWidget());
  widget.querySelector("#ai-close").onclick = closeWidget;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    messages.appendChild(createUserMessage(text, THEME.color));
    input.value = "";
    messages.scrollTop = messages.scrollHeight;

    const typing = createTypingIndicator();
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey, message: text, conversationId }),
      });

      typing.remove();
      const bubble = createBotMessage(messages);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value);
        if (window.marked) {
          bubble.innerHTML = window.marked.parse(answer);
        } else {
          bubble.textContent = answer;
        }
        messages.scrollTop = messages.scrollHeight;
      }
    } catch (error) {
      console.error("Chat error:", error);
      typing.remove();
      const bubble = createBotMessage(messages);
      bubble.textContent = "Sorry, I encountered an error. Please try again.";
    }
  });
})();
