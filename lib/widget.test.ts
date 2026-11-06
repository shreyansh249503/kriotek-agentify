/**
 * Security tests for public/widget.js, which runs on merchants' storefronts.
 */
import fs from "fs";
import path from "path";

const source = fs.readFileSync(path.join(__dirname, "../public/widget.js"), "utf8");

type WidgetRender = {
  escapeHtml: (value: unknown) => string;
  safeUrl: (value: unknown, fallback?: string | null, options?: { allowDataImage?: boolean }) => string | null;
  safeColor: (value: unknown, fallback: string) => string;
  renderMarkdown: (text: string) => string;
};

function loadHelpers(): WidgetRender {
  let helpers!: WidgetRender;
  new Function("__agentifyWidgetTestHook", source)((h: WidgetRender) => {
    helpers = h;
  });
  return helpers;
}

/** Puts the HTML in a detached element and lists anything that could run script. */
function dangerousBits(html: string): string[] {
  const root = document.createElement("div");
  root.innerHTML = html;
  const found: string[] = [];
  root.querySelectorAll("*").forEach((el) => {
    if (["SCRIPT", "IFRAME", "OBJECT", "EMBED", "STYLE"].includes(el.tagName)) found.push(el.tagName);
    for (const attr of Array.from(el.attributes)) {
      if (attr.name.startsWith("on")) found.push(`${el.tagName}[${attr.name}]`);
      if (["href", "src"].includes(attr.name) && /^\s*(javascript|vbscript|data:text)/i.test(attr.value)) {
        found.push(`${el.tagName}[${attr.name}=${attr.value}]`);
      }
    }
  });
  return found;
}

describe("widget.js", () => {
  it("loads no third-party scripts and uses no inline event handlers", () => {
    expect(source).not.toMatch(/cdn\.jsdelivr|unpkg\.com|cdnjs/);
    expect(source).not.toMatch(/window\.marked/);
    expect(source).not.toMatch(/\son(click|error|load|mouseover)=/);
  });

  it("only writes to the console through the debug-only logError helper", () => {
    const uses = source.match(/console\.\w+/g) ?? [];
    expect(uses).toEqual(["console.error"]);
    expect(source).toMatch(/if \(AGENTIFY_DEBUG\) console\.error\.apply\(console, arguments\);/);
    expect(source).toMatch(/agentify_debug=1/);
  });

  describe("renderMarkdown", () => {
    const { renderMarkdown } = loadHelpers();

    it("renders the markdown bots use", () => {
      expect(renderMarkdown("Hi **there**, see *this*.\nNext line")).toBe(
        "<p>Hi <strong>there</strong>, see <em>this</em>.<br>Next line</p>"
      );
      expect(renderMarkdown("- one\n- two\n\n1. first\n2. second")).toBe(
        "<ul><li>one</li><li>two</li></ul><ol><li>first</li><li>second</li></ol>"
      );
      expect(renderMarkdown("## Shipping\nUse `code`")).toBe(
        "<p><strong>Shipping</strong></p><p>Use <code>code</code></p>"
      );
      expect(renderMarkdown("[Track](https://example.com/t?a=1&b=2)")).toBe(
        '<p><a href="https://example.com/t?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">Track</a></p>'
      );
      expect(renderMarkdown("Visit https://shop.example.com/sale.")).toBe(
        '<p>Visit <a href="https://shop.example.com/sale" target="_blank" rel="noopener noreferrer">https://shop.example.com/sale</a>.</p>'
      );
    });

    it("handles parentheses in link URLs", () => {
      expect(renderMarkdown("[Wiki](https://en.wikipedia.org/wiki/Tote_(bag)).")).toBe(
        '<p><a href="https://en.wikipedia.org/wiki/Tote_(bag)" target="_blank" rel="noopener noreferrer">Wiki</a>.</p>'
      );
      expect(renderMarkdown("a [bad link](javascript:alert(1)).")).toBe("<p>a bad link.</p>");
    });

    it("links email addresses", () => {
      expect(renderMarkdown("Email support@example.com.")).toBe(
        '<p>Email <a href="mailto:support@example.com">support@example.com</a>.</p>'
      );
    });

    it("keeps underscores in links and words intact", () => {
      expect(renderMarkdown("snake_case_name https://x.com/a_b_c")).toBe(
        '<p>snake_case_name <a href="https://x.com/a_b_c" target="_blank" rel="noopener noreferrer">https://x.com/a_b_c</a></p>'
      );
    });

    it.each([
      "<img src=x onerror=alert(1)>",
      "<script>alert(1)</script>",
      '<a href="javascript:alert(1)">click</a>',
      "[click](javascript:alert(1))",
      "[click](data:text/html,<script>alert(1)</script>)",
      '<svg onload="alert(1)"></svg>',
      "```\n<script>alert(1)</script>\n```",
      '**<img src=x onerror="alert(1)">**',
      'https://evil.com/"onmouseover="alert(1)',
    ])("shows %s as text instead of running it", (attack) => {
      expect(dangerousBits(renderMarkdown(attack))).toEqual([]);
    });
  });

  describe("safeUrl and safeColor", () => {
    const { safeUrl, safeColor } = loadHelpers();

    it("allows only http(s) and same-site URLs", () => {
      expect(safeUrl("https://shop.com/p")).toBe("https://shop.com/p");
      expect(safeUrl("/products/a")).toBe("/products/a");
      expect(safeUrl("javascript:alert(1)")).toBe("#");
      expect(safeUrl(" JavaScript:alert(1)", "fallback")).toBe("fallback");
      expect(safeUrl("//evil.com/x")).toBe("#");
      expect(safeUrl("data:image/png;base64,AAA")).toBe("#");
      expect(safeUrl("data:image/png;base64,AAA", "#", { allowDataImage: true })).toBe("data:image/png;base64,AAA");
      expect(safeUrl("data:text/html,<script>", "#", { allowDataImage: true })).toBe("#");
    });

    it("allows only plain colour values", () => {
      expect(safeColor("#4f46e5", "#000")).toBe("#4f46e5");
      expect(safeColor("rgb(1, 2, 3)", "#000")).toBe("rgb(1, 2, 3)");
      expect(safeColor('red;"><script>alert(1)</script>', "#000")).toBe("#000");
      expect(safeColor(undefined, "#000")).toBe("#000");
    });
  });

  describe("running in a page", () => {
    const attack = "<img src=x onerror=\"window.__pwned = true\">";
    let consoleLog: jest.SpyInstance;
    let consoleError: jest.SpyInstance;

    afterAll(() => {
      consoleLog.mockRestore();
      consoleError.mockRestore();
    });

    beforeAll(async () => {
      consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
      consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
      document.body.innerHTML = '<script bot-id="pk_test" src="https://app.example.com/widget.js"></script>';
      const carousel = JSON.stringify([
        { name: attack, price: "<b>9</b>", url: "javascript:alert(1)", image: "javascript:alert(1)" },
        { name: "Safe", price: 5, url: "https://shop.example.com/p/safe", image: "https://cdn.example.com/a.jpg" },
      ]);
      const journey = JSON.stringify({
        orderNumber: attack,
        currentStep: 2,
        statusBadge: attack,
        shippingAddress: attack,
        tracking: { url: "javascript:alert(1)", company: attack, number: "1" },
        items: [{ name: attack, quantity: 1, price: "10", image: "javascript:alert(1)" }],
      });

      global.fetch = jest.fn(async (url: string) => {
        const json = (body: unknown) => ({ ok: true, json: async () => body });
        if (url.includes("/api/public/bot/")) {
          return json({ name: attack, primary_color: 'red;"><script>window.__pwned=true</script>', logo_url: "javascript:alert(1)" });
        }
        if (url.includes("/api/public/conversation/")) {
          return json({
            state: "idle",
            messages: [
              { role: "user", content: attack },
              { role: "assistant", content: `Here you go ${attack} **bold**` },
              { role: "assistant", content: `Picks:\n<product-carousel>${carousel}</product-carousel>` },
              { role: "assistant", content: `Your order: [ORDER_JOURNEY_JSON:${journey}]` },
            ],
          });
        }
        return json({});
      }) as unknown as typeof fetch;

      new Function("__agentifyWidgetTestHook", source)(undefined);
      // The widget opens itself after 1s and then loads the conversation.
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }, 10000);

    it("renders the conversation", () => {
      expect(document.body.textContent).toContain("Here you go");
      expect(document.querySelector(".product-card")).not.toBeNull();
      expect(document.querySelector(".order-journey-card-container")).not.toBeNull();
    });

    it("uses the small default bot icon when the bot has no valid logo", () => {
      const launcherIcon = document.querySelector<HTMLImageElement>('img[alt="chat"]')!;
      expect(launcherIcon.getAttribute("src")).toBe("https://app.example.com/bot-icon.webp");
    });

    it("keeps the store's browser console quiet", () => {
      expect(consoleLog).not.toHaveBeenCalled();
      // jsdom reports its own unimplemented APIs through console.error; the widget must not.
      const widgetErrors = consoleError.mock.calls.filter(
        ([first]) => !(first instanceof Error && /Not implemented/.test(first.message)),
      );
      expect(widgetErrors).toEqual([]);
    });

    it("never turns bot settings, messages, products or orders into markup", () => {
      expect(dangerousBits(document.body.innerHTML).filter((bit) => !bit.startsWith("SCRIPT") && !bit.startsWith("STYLE"))).toEqual([]);
      expect(document.querySelectorAll("script")).toHaveLength(1); // only the embed tag itself
      expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
      expect(document.body.textContent).toContain(attack);
    });

    it("drops unsafe product and tracking links", () => {
      const links = Array.from(document.querySelectorAll("a")).map((a) => a.getAttribute("href"));
      expect(links).toContain("#");
      expect(links).toContain("https://shop.example.com/p/safe");
      expect(links.some((href) => /javascript:/i.test(href ?? ""))).toBe(false);
    });

    it("scrolls the carousel without inline handlers", () => {
      const next = document.querySelector<HTMLButtonElement>(".carousel-nav-btn.next")!;
      const carousel = document.getElementById(next.getAttribute("data-carousel-target")!)!;
      carousel.scrollBy = jest.fn();

      next.click();

      expect(carousel.scrollBy).toHaveBeenCalledWith({ left: 220, behavior: "smooth" });
    });
  });
});
