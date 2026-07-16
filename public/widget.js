(async function () {
  const scriptTag =
    document.currentScript ||
    document.querySelector("script[bot-id]") ||
    document.querySelector("script[shop-domain]");
  let publicKey = scriptTag?.getAttribute("bot-id");
  const shopDomain =
    scriptTag?.getAttribute("shop-domain") || window.Shopify?.shop;

  if (!publicKey && !shopDomain) return;

  const scriptSrc = scriptTag ? scriptTag.src : "";
  const ASSET_BASE_URL = scriptSrc
    ? scriptSrc.substring(0, scriptSrc.lastIndexOf("/"))
    : "";
  const API_BASE_URL = ASSET_BASE_URL
    ? ASSET_BASE_URL.replace("/public", "")
    : "";
  const DEFAULT_BOT_ICON = ASSET_BASE_URL
    ? `${ASSET_BASE_URL}/2-bot-icon.png`
    : "";

  async function fetchBotConfig(pubKey) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/bot/${pubKey}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
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

  async function fetchBotConfigByShop(shop) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/public/bot-by-shop?shop=${encodeURIComponent(shop)}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        },
      );
      if (!res.ok) throw new Error("Bot config by shop not found");
      return await res.json();
    } catch (e) {
      console.error("Failed to load bot config by shop", e);
      return null;
    }
  }

  let resolvedBotConfig = null;

  if (publicKey) {
    if (window[`__bot_initialized_${publicKey}`]) {
      return;
    }
    window[`__bot_initialized_${publicKey}`] = true;
    resolvedBotConfig = await fetchBotConfig(publicKey);
  } else if (shopDomain) {
    const botByShop = await fetchBotConfigByShop(shopDomain);
    if (!botByShop || !botByShop.publicKey) {
      console.error(
        "Agentify: Could not retrieve bot configuration for shop domain:",
        shopDomain,
      );
      return;
    }
    publicKey = botByShop.publicKey;
    if (window[`__bot_initialized_${publicKey}`]) {
      return;
    }
    window[`__bot_initialized_${publicKey}`] = true;
    resolvedBotConfig = botByShop;
  }

  if (!resolvedBotConfig || !publicKey) return;

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

    wrapper.appendChild(bubble);
    return wrapper;
  }

  function createGreetingMessage(messages, botName, logoUrl) {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px;
      margin: 16px 0;
      background: linear-gradient(135deg, ${THEME.color}10 0%, #ffffff 100%);
      border: 1px solid ${THEME.color}20;
      border-radius: 20px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      text-align: center;
      animation: ai-fade-in-up 0.5s ease-out;
    `;

    const avatarContainer = document.createElement("div");
    avatarContainer.style.cssText = `
      position: relative;
      margin-bottom: 12px;
      width: 64px;
      height: 64px;
    `;

    const avatarPulse = document.createElement("div");
    avatarPulse.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: ${THEME.color};
      opacity: 0.15;
      animation: ai-pulse 2s infinite ease-in-out;
      z-index: 1;
    `;
    avatarContainer.appendChild(avatarPulse);

    const avatar = document.createElement("img");
    avatar.src =
      logoUrl ||
      "https://bhyrxyzokssibgeznojo.supabase.co/storage/v1/object/public/bot-avatars/avatars/OIzZEj7jTSZiY1B5p9b8J.png";
    avatar.style.cssText = `
      position: relative;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      object-fit: cover;
      z-index: 2;
    `;
    avatarContainer.appendChild(avatar);
    wrapper.appendChild(avatarContainer);

    const title = document.createElement("div");
    title.style.cssText = `
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 6px;
    `;
    title.innerHTML = `Hello! 👋 I'm <span style="color: ${THEME.color}">${botName}</span>`;
    wrapper.appendChild(title);

    const subtitle = document.createElement("div");
    subtitle.style.cssText = `
      font-size: 13px;
      color: #4b5563;
      margin-bottom: 20px;
      line-height: 1.5;
    `;
    subtitle.textContent = THEME.ecommerceEnabled
      ? "How can I help you today? Ask me about products, catalog, shipping, or any query."
      : "How can I help you today? Ask me about our services, company info, or contact our team.";
    wrapper.appendChild(subtitle);

    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
    `;

    const suggestions = THEME.ecommerceEnabled
      ? [
          {
            text: "🛍️ Show me the product catalog",
            action: "Show me the product catalog",
          },
          {
            text: "🚚 What are your shipping policies?",
            action: "What are your shipping policies?",
          },
          {
            text: "📞 Contact support/team",
            action: "I'd like to get in touch with support",
          },
        ]
      : [
          {
            text: "ℹ️ What services do you offer?",
            action: "What services do you offer?",
          },
          {
            text: "🏢 Tell me about your company",
            action: "Tell me about your company",
          },
          {
            text: "📞 Contact support/team",
            action: "I'd like to get in touch with support",
          },
        ];

    suggestions.forEach((item) => {
      const chip = document.createElement("button");
      chip.style.cssText = `
        background: #ffffff;
        border: 1px solid #e5e7eb;
        color: #374151;
        padding: 10px 14px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        text-align: left;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        display: flex;
        align-items: center;
        width: 100%;
        outline: none;
      `;
      chip.innerHTML = item.text;

      chip.onmouseover = () => {
        chip.style.background = `${THEME.color}08`;
        chip.style.borderColor = THEME.color;
        chip.style.color = THEME.color;
        chip.style.transform = "translateY(-1px)";
        chip.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.04)";
      };
      chip.onmouseout = () => {
        chip.style.background = "#ffffff";
        chip.style.borderColor = "#e5e7eb";
        chip.style.color = "#374151";
        chip.style.transform = "translateY(0)";
        chip.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.02)";
      };

      chip.onclick = () => {
        sendMessageText(item.action);
      };

      suggestionsContainer.appendChild(chip);
    });

    wrapper.appendChild(suggestionsContainer);
    messages.appendChild(wrapper);
  }

  let showSupportButtonGlobal = false;

  function processAnswerText(rawText) {
    let text = rawText;
    if (text.includes("[SHOW_SUPPORT_BUTTON]")) {
      showSupportButtonGlobal = true;
      text = text.replace("[SHOW_SUPPORT_BUTTON]", "");
    }
    text = text.replace(
      /<product-carousel>(?![\s\S]*<\/product-carousel>)[\s\S]*/i,
      '<div style="color: #666; font-style: italic; font-size: 12px; padding: 10px;">Generating product recommendations...</div>',
    );
    text = text.replace(
      /<product-carousel>([\s\S]*?)<\/product-carousel>/gi,
      (match, jsonString) => {
        try {
          const products = JSON.parse(jsonString.trim());
          if (!Array.isArray(products) || products.length === 0) return "";
          const carouselId =
            "carousel-" + Math.random().toString(36).substr(2, 9);
          const fallbackSvg =
            "data:image/svg+xml;utf8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22100%25%22%20height=%22100%25%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20stroke=%22%23ccc%22%20stroke-width=%221%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22%3E%3Crect%20x=%223%22%20y=%223%22%20width=%2218%22%20height=%2218%22%20rx=%222%22%20ry=%222%22%3E%3C/rect%3E%3Ccircle%20cx=%228.5%22%20cy=%228.5%22%20r=%221.5%22%3E%3C/circle%3E%3Cpolyline%20points=%2221%2015%2016%2010%205%2021%22%3E%3C/polyline%3E%3C/svg%3E";

          let html = `<div class="carousel-wrapper" style="position: relative; display: flex; align-items: center; margin: 8px 0;">`;
          html += `<button onclick="document.getElementById('${carouselId}').scrollBy({left: -220, behavior: 'smooth'})" style="position: absolute; left: -14px; z-index: 2; border-radius: 50%; width: 28px; height: 28px; background: white; border: 1px solid #e5e7eb; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; font-size: 18px; color: #333; padding-bottom: 2px;">&#8249;</button>`;
          html += `<div id="${carouselId}" class="product-carousel">`;
          products.forEach((p) => {
            const imgUrl = p.image || fallbackSvg;
            const safeName = (p.name || "Product").replace(/"/g, "&quot;");
            html += `
            <div class="product-card">
              <img src="${imgUrl}" class="product-image" alt="${safeName}" onerror="this.src='${fallbackSvg}'"/>
              <div class="product-info">
                <div class="product-name">${p.name || "Unnamed Product"}</div>
                <div class="product-price">${p.price || ""}</div>
                <a class="product-action" href="${p.url || "#"}" target="_blank">View Details</a>
              </div>
            </div>
          `;
          });
          html += `</div>`;
          html += `<button onclick="document.getElementById('${carouselId}').scrollBy({left: 220, behavior: 'smooth'})" style="position: absolute; right: -14px; z-index: 2; border-radius: 50%; width: 28px; height: 28px; background: white; border: 1px solid #e5e7eb; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; font-size: 18px; color: #333; padding-bottom: 2px;">&#8250;</button>`;
          html += `</div>`;
          return html.replace(/\n\s*/g, "");
        } catch (e) {
          console.error("Failed to parse product carousel JSON", e);
          return "";
        }
      },
    );
    return text;
  }

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

  let historyIds = JSON.parse(localStorage.getItem(historyKey) || "[]");
  if (!historyIds.includes(currentConversationId)) {
    historyIds.push(currentConversationId);
    localStorage.setItem(historyKey, JSON.stringify(historyIds));
  }

  const bot = resolvedBotConfig || (await fetchBotConfig(publicKey));
  const THEME = {
    color: bot.primary_color || "#4f46e5",
    botName: bot.name || "AI Assistant",
    logoUrl: bot.logo_url
      ? bot.logo_url.trim().startsWith("http")
        ? bot.logo_url.trim()
        : `${API_BASE_URL}${bot.logo_url.trim()}`
      : DEFAULT_BOT_ICON,
    ecommerceEnabled: !!bot.ecommerce_enabled,
  };

  function applyTheme() {
    const nameEl = widget.querySelector("#bot-name");
    if (nameEl) nameEl.textContent = THEME.botName;

    widget.querySelectorAll(".bot-logo").forEach((img) => {
      img.src = THEME.logoUrl;
    });

    widget.style.setProperty("--bot-theme-color", THEME.color);
    const header = widget.querySelector("#bot-header");
    if (header) header.style.background = THEME.color;
    const sendBtn = widget.querySelector("#bot-send-btn");
    if (sendBtn) sendBtn.style.background = THEME.color;
    const launcherImg = launcher.querySelector("img");
    if (launcherImg) launcherImg.src = THEME.logoUrl;
  }

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
    --bot-theme-color: ${THEME.color};
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 420px;
    height: 750px;
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
    <div id="bot-header" style="
      background: ${THEME.color};
      color: white;
      padding: 10px 16px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <img 
          src="${THEME.logoUrl}"
          class="bot-logo"
          alt="chat"
          style="
            width: 30px;
            height: 30px;
            object-fit: cover;
            pointer-events: none;
            border-radius: 50%;
            background-color: white;
          "
        />
        <span id="bot-name">${THEME.botName}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button id="ai-menu-btn" style="background:none; border:none; color:white; font-size:24px; font-weight: 700; cursor:pointer; padding: 4px 4px 10px 4px; display: flex; align-items: center; justify-content: center; align-content: center;">...</button>
        <button id="ai-close" style="background:none; border:none; color:white; font-size:24px; font-weight: 700; cursor:pointer; padding: 4px;">✕</button>
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
      <div id="ai-messages" style="height: 100%; box-sizing: border-box; padding: 16px 16px 20px 16px; overflow-y:auto; background: #fff; display: flex; flex-direction: column;"></div>
      
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
      <button id="bot-send-btn" style="background:${THEME.color}; color:white; border:none; padding: 0 16px; margin-left: 8px; border-radius: 8px; cursor: pointer; font-weight: 500;">
        Send
      </button>
    </form>
  `;

  document.body.appendChild(widget);
  applyTheme();

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
    .product-carousel {
      display: flex;
      overflow-x: auto;
      gap: 12px;
      padding: 10px 14px;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      flex: 1;
      scroll-behavior: smooth;
    }
    .product-carousel::-webkit-scrollbar { display: none; }
    .product-card {
      min-width: 180px;
      max-width: 200px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      scroll-snap-align: start;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .product-image {
      width: 100%;
      height: 140px;
      object-fit: cover;
      background: #f3f4f6;
    }
    .product-info {
      padding: 12px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .product-name {
      font-weight: 600;
      font-size: 14px;
      color: #111;
      margin-bottom: 4px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.2;
    }
    .product-price {
      font-weight: 700;
      font-size: 13px;
      color: #374151;
      margin-bottom: 12px;
    }
    .product-action {
      margin-top: auto;
      background: var(--bot-theme-color, #4f46e5);
      color: white;
      border: none;
      padding: 8px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      text-align: center;
      transition: opacity 0.2s;
      text-decoration: none;
    }
    .product-action:hover {
      opacity: 0.9;
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

    @keyframes ai-fade-in-up {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes ai-pulse {
      0% {
        transform: scale(1);
        opacity: 0.5;
      }
      50% {
        transform: scale(1.15);
        opacity: 0.2;
      }
      100% {
        transform: scale(1);
        opacity: 0.5;
      }
    }
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

  let currentConvoState = "idle";
  let renderedCount = 0;
  let pollInterval = null;

  function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(async () => {
      await pollConversation(currentConversationId);
    }, 4000);
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  function createSystemMessage(text) {
    const div = document.createElement("div");
    div.style.cssText = `
      align-self: center;
      color: #6b7280;
      font-size: 12.5px;
      margin: 10px 0;
      text-align: center;
      width: 100%;
      font-style: italic;
      background: #f3f4f6;
      padding: 6px 12px;
      border-radius: 8px;
      max-width: 85%;
    `;
    div.textContent = text;
    messages.appendChild(div);
    return div;
  }

  function renderSupportHandoffButton() {
    const existing = messages.querySelector(".support-handoff-container");
    if (existing) existing.remove();

    const wrapper = document.createElement("div");
    wrapper.className = "support-handoff-container";
    wrapper.style.cssText = `
      display: flex;
      justify-content: flex-start;
      margin: 8px 0 16px 0;
      animation: ai-fade-in-up 0.3s ease-out;
    `;
    
    const btn = document.createElement("button");
    btn.textContent = "💬 Talk to customer support";
    btn.style.cssText = `
      background: #ffffff;
      border: 1px solid ${THEME.color};
      color: ${THEME.color};
      padding: 8px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
    `;
    btn.onmouseover = () => {
      btn.style.background = THEME.color;
      btn.style.color = "#ffffff";
    };
    btn.onmouseout = () => {
      btn.style.background = "#ffffff";
      btn.style.color = THEME.color;
    };
    
    btn.onclick = async () => {
      btn.disabled = true;
      btn.textContent = "Connecting...";
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/switch-to-manual`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: currentConversationId,
            publicKey: publicKey,
          }),
        });
        
        if (res.ok) {
          wrapper.remove();
          currentConvoState = "manual";
          createSystemMessage("Connecting to support representative...");
          input.placeholder = "Type a message to support...";
          startPolling();
        } else {
          btn.disabled = false;
          btn.textContent = "💬 Talk to customer support";
        }
      } catch (err) {
        console.error("Failed to transition to customer support", err);
        btn.disabled = false;
        btn.textContent = "💬 Talk to customer support";
      }
    };
    
    wrapper.appendChild(btn);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  }

  async function pollConversation(id) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/public/conversation/${id}?publicKey=${publicKey}`
      );
      if (!res.ok) return;

      const data = await res.json();
      const history = data.messages || [];
      const newState = data.state || "idle";

      if (Array.isArray(history) && history.length > renderedCount) {
        for (let i = renderedCount; i < history.length; i++) {
          const msg = history[i];
          if (msg.role === "user") {
            messages.appendChild(createUserMessage(msg.content, THEME.color));
          } else if (msg.role === "assistant") {
            const bubble = createBotMessage(messages, THEME.logoUrl);
            showSupportButtonGlobal = false;
            const processedAnswer = processAnswerText(msg.content);
            if (window.marked) {
              bubble.innerHTML = window.marked.parse(processedAnswer);
            } else {
              bubble.innerHTML = processedAnswer;
            }
          } else if (msg.role === "system") {
            createSystemMessage(msg.content);
          }
        }
        renderedCount = history.length;
        messages.scrollTop = messages.scrollHeight;
      }

      if (newState !== "manual" && currentConvoState === "manual") {
        currentConvoState = newState;
        stopPolling();
        input.placeholder = "Type your message...";
      }
    } catch (e) {
      console.error("Polling error:", e);
    }
  }

  function updateEndChatStatus() {
    const hasMessages = messages.children.length > 1;
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

    if (messages.children.length === 0) {
      loadConversation(currentConversationId);
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
    stopPolling();

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/public/conversation/${id}?publicKey=${publicKey}`,
      );
      const data = await res.json();

      let history = [];
      let state = "idle";
      if (data && !Array.isArray(data)) {
        state = data.state || "idle";
        history = data.messages || [];
      } else {
        history = data || [];
      }

      currentConvoState = state;
      messages.innerHTML = "";
      renderedCount = 0;

      if (history.length === 0) {
        showGreeting();
        return;
      }

      let lastIsCannotAnswer = false;

      if (Array.isArray(history)) {
        history.forEach((msg) => {
          if (msg.role === "user") {
            messages.appendChild(createUserMessage(msg.content, THEME.color));
          } else if (msg.role === "assistant") {
            const bubble = createBotMessage(messages, THEME.logoUrl);
            showSupportButtonGlobal = false;
            const processedAnswer = processAnswerText(msg.content);
            if (window.marked) {
              bubble.innerHTML = window.marked.parse(processedAnswer);
            } else {
              bubble.innerHTML = processedAnswer;
            }
            lastIsCannotAnswer = showSupportButtonGlobal;
          } else if (msg.role === "system") {
            createSystemMessage(msg.content);
          }
        });
        renderedCount = history.length;
      }

      if (currentConvoState === "manual") {
        input.placeholder = "Type a message to support...";
        startPolling();
      } else {
        input.placeholder = "Type your message...";
        if (lastIsCannotAnswer) {
          renderSupportHandoffButton();
        }
      }

      messages.scrollTop = messages.scrollHeight;
      updateEndChatStatus();
    } catch (e) {
      console.error(e);
      messages.innerHTML = `<div style="padding: 20px; text-align: center; color: #ef4444;">Failed to load messages.</div>`;
    }
  }

  input.oninput = updateEndChatStatus;

  async function sendMessageText(text) {
    messages.appendChild(createUserMessage(text, THEME.color));
    messages.scrollTop = messages.scrollHeight;
    renderedCount += 1;
    updateEndChatStatus();

    if (currentConvoState === "manual") {
      try {
        await fetch(`${API_BASE_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicKey,
            message: text,
            conversationId: currentConversationId,
          }),
        });
      } catch (error) {
        console.error("Chat error:", error);
      }
      return;
    }

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
        showSupportButtonGlobal = false;
        const processedAnswer = processAnswerText(answer);
        if (window.marked) {
          bubble.innerHTML = window.marked.parse(processedAnswer);
        } else {
          bubble.innerHTML = processedAnswer;
        }
        messages.scrollTop = messages.scrollHeight;
      }

      renderedCount += 1;

      if (showSupportButtonGlobal) {
        renderSupportHandoffButton();
      }

      updateEndChatStatus();
    } catch (error) {
      console.error("Chat error:", error);
      typing.remove();
      const bubble = createBotMessage(messages, THEME.logoUrl);
      bubble.textContent = "Sorry, I encountered an error. Please try again.";
      messages.scrollTop = messages.scrollHeight;
      updateEndChatStatus();
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    await sendMessageText(text);
  });

  setTimeout(() => {
    openWidget();
  }, 1000);
})();
