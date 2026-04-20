(async function () {
  const scriptTag = document.querySelector("script[bot-id]");
  const publicKey = scriptTag?.getAttribute("bot-id");
  if (!publicKey) return;

  // Derive base URL for assets from script tag
  const scriptSrc = scriptTag.src;
  const ASSET_BASE_URL = scriptSrc.substring(0, scriptSrc.lastIndexOf("/"));
  const API_BASE_URL = ASSET_BASE_URL.replace("/public", "");
  const DEFAULT_BOT_ICON = `${ASSET_BASE_URL}/2-bot-icon.png`;

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

  function createBotMessage(messages, logoUrl) {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      display: flex;
      align-items: flex-end;
      gap: 8px;
      margin: 6px 0;
    `;

    const avatar = document.createElement("img");
    avatar.src = logoUrl;
    avatar.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
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

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    return bubble;
  }

  function createTypingIndicator(logoUrl) {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 6px 0;
    `;

    const avatar = document.createElement("img");
    avatar.src = logoUrl;
    avatar.alt = "bot";
    avatar.style.cssText = `
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
      background: #fff;
      flex-shrink: 0;
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

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    return wrapper;
  }

  function createGreetingMessage(messages, botName, logoUrl) {
    const bubble = createBotMessage(messages, logoUrl);
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
  const historyKey = `chat_history_${publicKey}`;

  let currentConversationId =
    localStorage.getItem(conversationKey) || crypto.randomUUID();
  localStorage.setItem(conversationKey, currentConversationId);

  // Initialize history if it doesn't exist
  let historyIds = JSON.parse(localStorage.getItem(historyKey) || "[]");
  if (!historyIds.includes(currentConversationId)) {
    historyIds.push(currentConversationId);
    localStorage.setItem(historyKey, JSON.stringify(historyIds));
  }

  const bot = await fetchBotConfig(publicKey);
  const THEME = {
    color: bot.primary_color,
    botName: bot.name,
    logoUrl: bot.logo_url
      ? bot.logo_url.trim().startsWith("http")
        ? bot.logo_url.trim()
        : `${API_BASE_URL}${bot.logo_url.trim()}`
      : DEFAULT_BOT_ICON,
  };

  const launcher = document.createElement("button");
  launcher.innerHTML = `
    <img 
      src="${THEME.logoUrl}"
      alt="chat"
      style="
        width: 100%;
        height: 100%;
        object-fit: cover;
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
    padding: 0;
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  `;
  launcher.onmouseover = () => (launcher.style.transform = "scale(1.1)");
  launcher.onmouseout = () => (launcher.style.transform = "scale(1)");
  document.body.appendChild(launcher);

  const widget = document.createElement("div");
  widget.id = "ai-widget";
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
      align-items: center;
      position: relative;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>${THEME.botName}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <button id="ai-menu-btn" style="background:none; border:none; color:white; font-size:24px; cursor:pointer; padding: 4px; display: flex; align-items: center; justify-content: center; align-content: center;">...</button>
        <button id="ai-close" style="background:none; border:none; color:white; font-size:20px; cursor:pointer; padding: 4px;">✕</button>
      </div>
      
      <!-- Menu Dropdown -->
      <div id="ai-menu" style="
        position: absolute;
        top: 100%;
        right: 16px;
        background: white;
        color: #333;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        padding: 8px 0;
        display: none;
        flex-direction: column;
        z-index: 100;
        min-width: 160px;
        border: 1px solid #eee;
      ">
        <button id="ai-new-chat" class="menu-item">
          <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Start a new chat
        </button>
        <button id="ai-end-chat" class="menu-item">
          <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
          End chat
        </button>
        <button id="ai-recent-chats" class="menu-item">
          <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          View recent chats
        </button>
      </div>
    </div>
    
    <div style="flex:1; position: relative; overflow: hidden;">
      <div id="ai-messages" style="height: 100%; padding: 16px; overflow-y:auto; background: #fff; display: flex; flex-direction: column;"></div>
      
      <!-- Recent Chats View -->
      <div id="ai-history" style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        display: none;
        flex-direction: column;
        z-index: 10;
      ">
        <div style="padding: 12px 16px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 8px;">
          <button id="ai-history-back" style="background:none; border:none; color:#666; cursor:pointer; font-size: 20px; padding: 4px;">←</button>
          <span style="font-weight: 600; font-size: 14px;">Recent Chats</span>
        </div>
        <div id="ai-history-list" style="flex:1; overflow-y: auto; padding: 8px;"></div>
      </div>

      <!-- End Chat Confirmation -->
      <div id="ai-confirm" style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        text-align: center;
        z-index: 20;
      ">
        <div style="background: #f3f4f6; width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <svg style="width: 32px; height: 32px; color: #6b7280;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">End chat</h3>
        <p style="margin: 0 0 24px 0; color: #9ca3af; font-size: 14px;">Do you want to end this chat?</p>
        
        <button id="ai-confirm-yes" style="
          width: 100%;
          padding: 12px;
          background: black;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 12px;
          transition: opacity 0.2s;
        ">Yes, end chat</button>
        
        <button id="ai-confirm-cancel" style="
          width: 100%;
          padding: 12px;
          background: white;
          color: #374151;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        ">Cancel</button>
      </div>
    </div>

    <form id="ai-form" style="display:flex; border-top:1px solid #eee; padding: 8px; background: #f9fafb;">
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
    #ai-messages::-webkit-scrollbar, #ai-history-list::-webkit-scrollbar { width: 6px; }
    #ai-messages::-webkit-scrollbar-thumb, #ai-history-list::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
    #ai-messages p { margin: 0; display: inline; }
    
    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 16px;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
      color: #374151;
      transition: background 0.2s;
    }
    .menu-item:hover {
      background: #f3f4f6;
    }
    .menu-item:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .history-item {
      padding: 12px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      margin-bottom: 4px;
      border: 1px solid transparent;
    }
    .history-item:hover {
      background: #f9fafb;
      border-color: #eee;
    }
    .history-item.active {
      background: #f0f4ff;
      border-color: #d1d5db;
    }
    #ai-confirm-yes:hover { opacity: 0.8; }
    #ai-confirm-cancel:hover { background: #f9fafb; }
  `;
  document.head.appendChild(style);

  const messages = widget.querySelector("#ai-messages");
  const form = widget.querySelector("#ai-form");
  const input = widget.querySelector("#ai-input");
  const menuBtn = widget.querySelector("#ai-menu-btn");
  const menu = widget.querySelector("#ai-menu");
  const historyView = widget.querySelector("#ai-history");
  const historyList = widget.querySelector("#ai-history-list");
  const historyBack = widget.querySelector("#ai-history-back");
  const confirmView = widget.querySelector("#ai-confirm");
  const confirmYes = widget.querySelector("#ai-confirm-yes");
  const confirmCancel = widget.querySelector("#ai-confirm-cancel");
  const endChatBtn = widget.querySelector("#ai-end-chat");

  let isOpen = false;
  let isMenuOpen = false;
  let greetingShownInSessions = {};

  function updateEndChatStatus() {
    const hasMessages = messages.children.length > 1; // Assuming 0 or 1 is initial/greeting
    const hasInput = input.value.trim().length > 0;

    if (hasMessages || hasInput) {
      endChatBtn.disabled = false;
    } else {
      endChatBtn.disabled = true;
    }
  }

  function openWidget() {
    isOpen = true;
    widget.style.display = "flex";
    setTimeout(() => {
      widget.style.opacity = "1";
      widget.style.transform = "translateY(0)";
    }, 10);

    if (
      !greetingShownInSessions[currentConversationId] &&
      messages.children.length === 0
    ) {
      showGreeting();
    }
    updateEndChatStatus();
  }

  function showGreeting() {
    greetingShownInSessions[currentConversationId] = true;
    const typing = createTypingIndicator(THEME.logoUrl);
    messages.appendChild(typing);
    setTimeout(() => {
      typing.remove();
      createGreetingMessage(messages, THEME.botName, THEME.logoUrl);
      updateEndChatStatus();
    }, 1000);
  }

  function closeWidget() {
    isOpen = false;
    isMenuOpen = false;
    menu.style.display = "none";
    confirmView.style.display = "none";
    widget.style.opacity = "0";
    widget.style.transform = "translateY(20px)";
    setTimeout(() => {
      if (!isOpen) widget.style.display = "none";
    }, 300);
  }

  launcher.onclick = () => (isOpen ? closeWidget() : openWidget());
  widget.querySelector("#ai-close").onclick = closeWidget;

  menuBtn.onclick = (e) => {
    e.stopPropagation();
    isMenuOpen = !isMenuOpen;
    menu.style.display = isMenuOpen ? "flex" : "none";
  };

  document.addEventListener("click", () => {
    if (isMenuOpen) {
      isMenuOpen = false;
      menu.style.display = "none";
    }
  });

  widget.querySelector("#ai-new-chat").onclick = async () => {
    currentConversationId = crypto.randomUUID();
    localStorage.setItem(conversationKey, currentConversationId);

    let ids = JSON.parse(localStorage.getItem(historyKey) || "[]");
    if (!ids.includes(currentConversationId)) {
      ids.unshift(currentConversationId);
      localStorage.setItem(historyKey, JSON.stringify(ids));
    }

    messages.innerHTML = "";
    showGreeting();
    historyView.style.display = "none";
    confirmView.style.display = "none";
    updateEndChatStatus();
  };

  endChatBtn.onclick = () => {
    confirmView.style.display = "flex";
  };

  confirmCancel.onclick = () => {
    confirmView.style.display = "none";
  };

  confirmYes.onclick = () => {
    messages.innerHTML = "";
    greetingShownInSessions[currentConversationId] = false;
    confirmView.style.display = "none";
    closeWidget();
    // After closing, when they open again, it will show greeting
  };

  widget.querySelector("#ai-recent-chats").onclick = async () => {
    historyView.style.display = "flex";
    historyList.innerHTML = `<div style="padding: 20px; text-align: center; color: #666;">Loading...</div>`;

    const ids = JSON.parse(localStorage.getItem(historyKey) || "[]");
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey, conversationIds: ids }),
      });
      const data = await res.json();

      historyList.innerHTML = "";
      if (data.length === 0) {
        historyList.innerHTML = `<div style="padding: 20px; text-align: center; color: #666;">No recent chats.</div>`;
      } else {
        data.forEach((chat) => {
          const item = document.createElement("div");
          item.className = `history-item ${chat.id === currentConversationId ? "active" : ""}`;
          const date = new Date(chat.created_at).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          item.innerHTML = `
            <div style="font-size: 13px; font-weight: 600; color: ${THEME.color}; margin-bottom: 4px;">${date}</div>
            <div style="font-size: 13px; color: #4b5563; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${chat.snippet || "(Empty chat)"}</div>
          `;
          item.onclick = () => loadConversation(chat.id);
          historyList.appendChild(item);
        });
      }
    } catch (e) {
      console.error(e);
      historyList.innerHTML = `<div style="padding: 20px; text-align: center; color: #ef4444;">Failed to load history.</div>`;
    }
  };

  historyBack.onclick = () => {
    historyView.style.display = "none";
  };

  async function loadConversation(id) {
    currentConversationId = id;
    localStorage.setItem(conversationKey, currentConversationId);
    historyView.style.display = "none";
    messages.innerHTML = `<div style="padding: 20px; text-align: center; color: #666;">Loading messages...</div>`;

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/public/conversation/${id}?publicKey=${publicKey}`,
      );
      const history = await res.json();

      messages.innerHTML = "";
      if (Array.isArray(history)) {
        history.forEach((msg) => {
          if (msg.role === "user") {
            messages.appendChild(createUserMessage(msg.content, THEME.color));
          } else if (msg.role === "assistant") {
            const bubble = createBotMessage(messages, THEME.logoUrl);
            if (window.marked) {
              bubble.innerHTML = window.marked.parse(msg.content);
            } else {
              bubble.textContent = msg.content;
            }
          }
        });
      }
      messages.scrollTop = messages.scrollHeight;
      updateEndChatStatus();
    } catch (e) {
      console.error(e);
      messages.innerHTML = `<div style="padding: 20px; text-align: center; color: #ef4444;">Failed to load messages.</div>`;
    }
  }

  input.oninput = updateEndChatStatus;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    messages.appendChild(createUserMessage(text, THEME.color));
    input.value = "";
    messages.scrollTop = messages.scrollHeight;
    updateEndChatStatus();

    const typing = createTypingIndicator(THEME.logoUrl);
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          message: text,
          conversationId: currentConversationId,
        }),
      });

      typing.remove();
      const bubble = createBotMessage(messages, THEME.logoUrl);

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
      updateEndChatStatus();
    } catch (error) {
      console.error("Chat error:", error);
      typing.remove();
      const bubble = createBotMessage(messages, THEME.logoUrl);
      bubble.textContent = "Sorry, I encountered an error. Please try again.";
      updateEndChatStatus();
    }
  });

  setTimeout(() => {
    openWidget();
  }, 1000);
})();
