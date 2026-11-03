(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
   * Social links that live in script.js rather than index.html, so a
   * card can stay hidden until its URL exists. Set `x` to your profile
   * URL, e.g. "https://x.com/yourhandle", and the X card appears in
   * Contact with the handle filled in.
   * ============================================================ */
  const SOCIAL_LINKS = {
    x: "https://x.com/joshyvibe",
    // Your scheduling page — Calendly, Google Calendar appointment schedule, Cal.com, etc.
    // Leave empty and every "Book a call" button stays hidden.
    booking: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3R0kV4_lGxLFuGhB-PBuaJd-3m6cjG4iWIfEf7K6rtx5sYozUKFk2nTc8Sd8I5QdzYsaPxYgUC",
  };

  document.querySelectorAll("[data-social]").forEach((card) => {
    const url = SOCIAL_LINKS[card.dataset.social];
    if (!url) return;
    card.href = url;
    const handle = url.replace(/\/+$/, "").split("/").pop();
    card.querySelector(".contact-value").textContent = `@${handle}`;
    card.hidden = false;
  });

  /* ============================================================
   * "Book a call" — opens the scheduling page in a modal where the
   * provider allows embedding, otherwise in a new tab.
   * ============================================================ */
  function bookingEmbedUrl(raw) {
    let url;
    try { url = new URL(raw); } catch { return null; }
    if (url.hostname.endsWith("calendly.com")) {
      url.searchParams.set("embed_domain", window.location.hostname || "localhost");
      url.searchParams.set("embed_type", "Inline");
      url.searchParams.set("hide_gdpr_banner", "1");
      return url.href;
    }
    if (url.hostname === "calendar.google.com" && url.pathname.includes("/appointments/")) {
      url.searchParams.set("gv", "true");
      return url.href;
    }
    if (url.hostname === "cal.com" || url.hostname.endsWith(".cal.com")) {
      url.searchParams.set("embed", "true");
      return url.href;
    }
    return null; // unknown provider — may refuse to be framed, so use a new tab
  }

  const bookingUrl = SOCIAL_LINKS.booking;
  const bookModal = document.getElementById("bookModal");
  if (bookingUrl && bookModal) {
    const embedUrl = bookingEmbedUrl(bookingUrl);
    const frame = document.getElementById("bookFrame");
    document.getElementById("bookModalExt").href = bookingUrl;

    document.querySelectorAll("[data-book]").forEach((el) => {
      el.href = bookingUrl;
      el.target = "_blank";
      el.rel = "noopener";
      el.hidden = false;
      el.addEventListener("click", (e) => {
        if (!embedUrl || typeof bookModal.showModal !== "function") return; // plain new-tab link
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let users force a new tab
        e.preventDefault();
        if (!frame.src) frame.src = embedUrl;
        bookModal.showModal();
      });
    });

    document.getElementById("bookModalClose").addEventListener("click", () => bookModal.close());
    bookModal.addEventListener("click", (e) => { if (e.target === bookModal) bookModal.close(); }); // backdrop
  }

  /* ============================================================
   * Access pass leans toward the pointer (it also sways on its own).
   * ============================================================ */
  const pass = document.getElementById("pass");
  if (pass && !prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    const card = pass.querySelector(".pass-card");
    pass.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${(px * 14).toFixed(2)}deg) rotateX(${(-py * 10).toFixed(2)}deg)`;
    });
    pass.addEventListener("pointerleave", () => { card.style.transform = ""; });
  }

  /* ============================================================
   * Live local clock in the hero (West Africa Time).
   * ============================================================ */
  const heroClock = document.getElementById("heroClock");
  if (heroClock) {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Lagos", hour: "numeric", minute: "2-digit", second: "2-digit",
    });
    const tick = () => {
      const now = fmt.format(new Date());
      heroClock.textContent = now;
      document.querySelectorAll("[data-clock]").forEach((el) => { el.textContent = now; });
    };
    tick();
    window.setInterval(tick, 1000);
  }

  /* ============================================================
   * Theme toggle (persisted; dark navy by default)
   * ============================================================ */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const THEME_KEY = "oa-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
  }

  // Dark navy is the signature look, so it's the default until a visitor picks light.
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch {}
  applyTheme(savedTheme === "light" ? "light" : "dark");

  themeToggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
  });

  /* ============================================================
   * Mobile nav
   * ============================================================ */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.querySelector(".main-nav");

  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ============================================================
   * Footer year
   * ============================================================ */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ============================================================
   * Scroll progress bar
   * ============================================================ */
  const scrollProgress = document.getElementById("scrollProgress");
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  updateScrollProgress();

  /* ============================================================
   * Scroll-spy: highlight the active nav link
   * ============================================================ */
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const navLinks = Array.from(document.querySelectorAll(".main-nav a"));
  const navPill = document.querySelector(".nav-pill");
  // Sections without their own nav item light up the closest one.
  const SPY_ALIAS = {};

  function setActiveLink(link) {
    navLinks.forEach((a) => a.classList.toggle("is-active", a === link));
    if (!navPill) return;
    if (!link || getComputedStyle(link).display === "none" || link.offsetParent === null) {
      navPill.classList.remove("is-on");
      return;
    }
    navPill.style.left = `${link.offsetLeft}px`;
    navPill.style.width = `${link.offsetWidth}px`;
    navPill.classList.add("is-on");
  }

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = SPY_ALIAS[entry.target.id] || entry.target.id;
        const link = navLinks.find((a) => a.getAttribute("href") === `#${id}`);
        if (link) setActiveLink(link);
        else if (entry.target.classList.contains("hero")) setActiveLink(null);
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => spy.observe(s));
  const heroSection = document.querySelector(".hero");
  if (heroSection) spy.observe(heroSection);
  window.addEventListener("resize", () => setActiveLink(navLinks.find((a) => a.classList.contains("is-active")) || null));

  /* ============================================================
   * Reveal-on-scroll (with a tiny per-element stagger for a less
   * mechanical, more hand-timed feel)
   * ============================================================ */
  const reveal = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = prefersReducedMotion ? 0 : Math.random() * 120;
          entry.target.style.transitionDelay = `${delay.toFixed(0)}ms`;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  function observeReveal(el) {
    reveal.observe(el);
  }
  document.querySelectorAll("[data-reveal]").forEach(observeReveal);

  // Safety net: a throttled/backgrounded tab, a slow observer, or any
  // browser quirk should never leave real content permanently invisible.
  window.setTimeout(() => {
    document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => {
      el.classList.add("is-visible");
    });
  }, 2500);

  /* ============================================================
   * Spotlight cursor glow — any .spotlight element tracks the
   * pointer via CSS custom properties read by its ::before.
   * ============================================================ */
  if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    document.addEventListener(
      "pointermove",
      (e) => {
        const target = e.target.closest(".spotlight");
        if (!target) return;
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        target.style.setProperty("--my", `${e.clientY - rect.top}px`);
      },
      { passive: true }
    );
  }

  /* ============================================================
   * Magnetic buttons — nudge toward the pointer within a small
   * radius, spring back on leave.
   * ============================================================ */
  if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      const strength = 0.25;
      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        const relX = e.clientX - (rect.left + rect.width / 2);
        const relY = e.clientY - (rect.top + rect.height / 2);
        el.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "translate(0, 0)";
      });
    });
  }

  /* ============================================================
   * Tilt on project screenshots
   * ============================================================ */
  function attachTilt(el) {
    if (prefersReducedMotion || !window.matchMedia("(hover: hover)").matches) return;
    el.addEventListener("pointermove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) scale3d(1.01,1.01,1.01)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transform = "rotateX(0) rotateY(0) scale3d(1,1,1)";
    });
  }

  /* ============================================================
   * Count-up stats
   * ============================================================ */
  const countTargets = document.querySelectorAll("[data-count]");
  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.getAttribute("data-count"));
        const suffix = el.getAttribute("data-suffix") || "";
        if (prefersReducedMotion) {
          el.textContent = target + suffix;
        } else {
          const duration = 1100;
          const start = performance.now();
          function tick(now) {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
        obs.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  countTargets.forEach((el) => countObserver.observe(el));

  /* ============================================================
   * Typing terminal — reveals each line of the hero code block in
   * sequence, then marks the panel "verified".
   * ============================================================ */
  const termCode = document.getElementById("termCode");
  const termStatus = document.getElementById("termStatus");
  let termTyped = false;

  function typeTerminal() {
    if (termTyped || !termCode) return;
    termTyped = true;
    const lines = Array.from(termCode.querySelectorAll(".term-line"));
    lines.forEach((line) => {
      line.innerHTML = line.getAttribute("data-html") || "";
    });

    if (prefersReducedMotion) {
      lines.forEach((l) => l.classList.add("is-typed"));
      if (termStatus) {
        termStatus.textContent = "verified ✓";
        termStatus.classList.add("is-done");
      }
      return;
    }

    let i = 0;
    function next() {
      if (i > 0) lines[i - 1].classList.remove("is-current");
      if (i >= lines.length) {
        if (termStatus) {
          termStatus.textContent = "verified ✓";
          termStatus.classList.add("is-done");
        }
        return;
      }
      lines[i].classList.add("is-typed", "is-current");
      i += 1;
      window.setTimeout(next, 90 + Math.random() * 60);
    }
    window.setTimeout(next, 300);
  }

  const heroPanel = document.querySelector(".hero-panel");
  if (heroPanel) {
    const heroObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            typeTerminal();
            obs.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    heroObserver.observe(heroPanel);
    // Fallback in case the observer never fires (e.g. hero already filling the viewport on load).
    window.setTimeout(typeTerminal, 1200);
  }

  /* ============================================================
   * Case-study data
   *
   * `repo` defaults to the GitHub profile so nothing links out to a
   * 404 before these projects are pushed. Swap in the direct repo
   * URL per project once it's public.
   *
   * `image` points at a screenshot under assets/projects/ — drop a
   * file in with that name and it appears automatically; until then
   * a branded placeholder renders in its place (see onerror below).
   *
   * `live` is the deployed URL. Leave it null until the project is
   * actually deployed — the card then shows a muted "not deployed
   * yet" pill instead of a link that goes nowhere.
   * ============================================================ */
  const GITHUB_PROFILE = "https://github.com/joshyvibe";

  const ICONS = {
    rag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/></svg>',
    chain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 1 1 0 10h-2M8 12h8"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/><path d="M2.5 3h2l2.6 12.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6"/></svg>',
    kanban: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16M6 9h0M6 13h0M12 8h0M12 12h0M12 16h0M18 9h0M18 15h0"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9a2 2 0 0 0 0 4v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a2 2 0 0 1 0-4V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/><path d="M13 5v2M13 17v2M13 10.5v3"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg>',
  };

  const projects = [
    {
      status: "Case study 01 · Multi-tenant SaaS",
      title: "Team Knowledge Base — RAG Chat SaaS",
      tagline:
        "Teams upload internal documents and chat with them: streamed answers grounded in their own knowledge base, with clickable citations back to the exact source excerpt.",
      hardPart:
        "Tenant isolation has to hold on every vector query and every historical citation — not just at the UI layer.",
      proof:
        "Regression-tested: seed a citation-bearing message, remove that user's workspace membership, confirm the same endpoint now 403s for them and still 200s for an unaffected member.",
      stack: ["FastAPI", "React", "TypeScript", "PostgreSQL + pgvector", "Celery", "Redis", "Claude", "Voyage AI"],
      repo: GITHUB_PROFILE,
      live: null,
      image: "assets/projects/rag-knowledge-base.png",
      icon: ICONS.rag,
      accent: "#818cf8",
      details: [
        "<strong>Tenant isolation is application-layer, not Postgres RLS.</strong> Every workspace-scoped route depends on one choke-point dependency (<code>get_current_membership</code>) that proves membership before any query runs — <code>document_chunks.workspace_id</code> is denormalized specifically so the vector search filters directly on an indexed column, both a performance and an isolation win.",
        "<strong>Citations are prompt-engineered, not the native single-document citations API.</strong> The context here is a dynamically retrieved, per-query subset of a multi-document corpus, so the model cites bracketed numbers against a numbered context block, parsed back to source chunks after the stream completes.",
        "<strong>Grounding over fluency.</strong> The system prompt requires the model to say \"I don't know\" rather than fall back on outside knowledge, and results below a 0.3 cosine-similarity threshold never reach the prompt at all.",
        "<strong>Async ingestion via Celery</strong>, not inline processing — parsing and embedding a large PDF takes real time, and ephemeral containers rule out local disk, hence R2 object storage. Failures land in a persisted <code>error_message</code>, never silently swallowed.",
      ],
    },
    {
      status: "Case study 02 · On-chain + indexer",
      title: "On-Chain Prediction Market & Analytics Platform",
      tagline:
        "A binary prediction market on Ethereum — collateral-backed outcome shares priced by a constant-product AMM, plus an off-chain indexer that turns raw chain events into queryable history.",
      hardPart:
        "Not the Solidity — the indexer that has to survive being killed mid-backfill with zero data loss and stay exactly correct against the chain.",
      proof:
        "32 Foundry tests incl. 6 fuzz properties across 6,144 runs (the AMM's k-invariant never decreases); indexer killed after 5 of ~25 backfill chunks resumed with zero duplicates and zero gaps; indexed balances matched live on-chain balanceOf() exactly.",
      stack: ["Solidity", "Foundry", "FastAPI", "Celery", "web3.py", "Next.js", "wagmi/viem"],
      repo: GITHUB_PROFILE,
      live: null,
      image: "assets/projects/prediction-market.png",
      icon: ICONS.chain,
      accent: "#f59e0b",
      details: [
        "<strong>Complete-set minting makes arbitrage do the safety work.</strong> One YES + one NO is always worth exactly one unit of collateral, so <code>split</code>/<code>merge</code> is risk-free arbitrage against the AMM price — that's what keeps the implied probability bounded to [0,1] with no oracle needed until resolution.",
        "<strong>Constant-product AMM, Uniswap-V2 shaped.</strong> First-deposit LP shares lock <code>MINIMUM_LIQUIDITY</code> to a dead address specifically to block the classic share-price donation attack.",
        "<strong>Crash-safe indexing by construction.</strong> <code>event_indexer.py</code> upserts via <code>INSERT ... ON CONFLICT DO NOTHING</code> and only ever advances its checkpoint in the same DB transaction as the events it describes — a crash mid-backfill can't leave the checkpoint ahead of committed data, and the unique constraint makes re-processing a safe no-op.",
        "<strong>SIWE gates exactly one thing</strong> — the personal positions view — via an opaque, Redis-backed session, not a JWT. Nonce replay is checked and correctly rejected end to end.",
      ],
    },
    {
      status: "Case study 03 · Marketplace + payments",
      title: "Digital Goods Marketplace",
      tagline:
        "A multi-vendor marketplace for digital goods with Stripe Connect payouts — each vendor is paid directly to their own connected account, and the platform takes its fee automatically at charge time.",
      hardPart:
        "One cart can span multiple vendors. It has to become N correctly-split charges, and the webhooks that confirm them can never be allowed to double-process.",
      proof:
        "Webhook idempotency is enforced by a database ledger, not an assumption. The demo seeder deliberately does not fake Stripe Connect Express onboarding, after that shortcut once caused real checkout failures for a seeded product.",
      stack: ["Django 5", "DRF", "Next.js", "TypeScript", "Stripe Connect", "Cloudflare R2"],
      repo: GITHUB_PROFILE,
      live: null,
      image: "assets/projects/digital-marketplace.png",
      icon: ICONS.cart,
      accent: "#10b981",
      details: [
        "<strong>Per-vendor suborder split.</strong> A multi-vendor cart becomes one <code>VendorSuborder</code> per vendor at checkout, each its own destination charge straight to that vendor's connected Stripe account with the platform fee taken automatically.",
        "<strong>Service layer over signals.</strong> Payment and order logic lives in explicit service functions, not implicit Django signal handlers, so the money path is traceable top to bottom instead of scattered across receivers.",
        "<strong>Google OAuth without a redirect URI</strong> — a deliberate simplification of the client-side flow, reasoned through in the design doc rather than defaulted into.",
        "<strong>The cross-site cookie caveat is documented, not hidden.</strong> Splitting the frontend (Vercel) and API (Railway) across registrable domains makes the refresh cookie third-party from the browser's perspective — login/logout are unaffected, but \"stay signed in\" can silently degrade, and the mitigation options are written down before they're needed.",
      ],
    },
    {
      status: "Case study 04 · Real-time / WebSockets",
      title: "Real-Time Collaborative Kanban Board",
      tagline:
        "A multi-user Kanban board on Django Channels — live drag-and-drop, presence, and cursors over WebSockets, with conflicts that resolve correctly instead of getting silently overwritten.",
      hardPart:
        "Two people drag the same card to two different columns in the same second. Exactly one write has to win, and the loser has to be told — visibly, not silently overwritten.",
      proof:
        "A per-card version counter checked under SELECT ... FOR UPDATE, exercised by a genuine multi-threaded database race test — and captured live on video with two real browser sessions racing the same card, not staged screenshots.",
      stack: ["Django Channels", "Daphne (ASGI)", "channels-redis", "PostgreSQL", "React", "TypeScript"],
      repo: GITHUB_PROFILE,
      live: null,
      image: "assets/projects/realtime-kanban.png",
      icon: ICONS.kanban,
      accent: "#38bdf8",
      media: {
        src: "assets/conflict-resolution.gif",
        alt: "Two browser sessions racing to move the same Kanban card; the losing session's card snaps back with a visible conflict toast",
        caption:
          "Two real browser sessions racing to move the same card — the loser is told, visibly. Captured live, not staged.",
      },
      details: [
        "<strong>Isolation verified at connect time.</strong> Cross-process broadcast runs through Redis-backed Channels groups scoped per board — a client connected to board A structurally cannot receive board B's traffic; it isn't a client-side filter.",
        "<strong>Presence is TTL-driven, not disconnect-driven.</strong> The naive design (increment on connect, decrement on disconnect) breaks the moment there's more than one ASGI process. A Redis key with a 30s TTL is the actual correctness mechanism — <code>disconnect()</code> is just a fast-path optimization on top of it.",
        "<strong>WebSocket auth via a single-use, 10-second ticket</strong> (<code>GETDEL</code> on read), not a JWT in the query string — browsers can't attach an <code>Authorization</code> header to a native WebSocket handshake, and a long-lived token in the URL is a standing credential exposure.",
        "<strong>Fractional-index card positions</strong> (<code>position = (prev + next) / 2</code>) — one row, one write, no renumbering cascade under concurrent drag-and-drop.",
      ],
    },
    {
      status: "Case study 05 · Concurrency + payments",
      title: "Event Ticketing Platform",
      tagline:
        "An event ticketing API with one job: prove that concurrent buyers racing for the last ticket in a tier can never oversell it.",
      hardPart:
        "Check-and-decrement under real concurrency — not a check-then-act race that only looks safe in a single-threaded demo.",
      proof:
        "20 genuinely concurrent hold requests fired at a tier seeded with 3 units → exactly 3 succeed, 17 clean 409s, Redis counter lands at exactly 0 — every run. A replayed, validly-signed Stripe webhook produces exactly one order, twice.",
      stack: ["FastAPI", "Redis + Lua", "PostgreSQL", "Stripe Checkout", "Next.js", "TypeScript"],
      repo: GITHUB_PROFILE,
      live: null,
      image: "assets/projects/event-ticketing.png",
      icon: ICONS.ticket,
      accent: "#fb7185",
      details: [
        "<strong>The race is eliminated by construction.</strong> Reserve/release/pin is one atomic Lua script (<code>reserve.lua</code>), not an application-level check-then-write — there's no window where two requests can both read the same count and both decrement it.",
        "<strong>Two independent expiry paths.</strong> A Redis keyspace-notification listener is the fast path; an APScheduler sweep every ~30s is the backstop for anything a dropped notification missed. Both verified live, independently.",
        "<strong>Fails loudly, on purpose.</strong> <code>POST /api/holds</code> returns a clean 503 on a Redis outage rather than selling without the atomicity guarantee the whole project exists to demonstrate.",
        "<strong>Found and fixed live:</strong> Redis's default persistence was silently surviving a container restart, which defeated the \"Redis is disposable, Postgres is truth\" premise the resync recovery path depends on — disabled persistence so a restart means what the design says it means.",
      ],
    },
    {
      status: "Case study 06 · LLM pipeline + review",
      title: "ListingGuard — Marketplace Counterfeit Detection",
      tagline:
        "Finds a brand's listings on Jumia and eBay, has an LLM validate what each one actually is, and routes it: dismissed, sent to a person for review, or ready to report with a drafted takedown notice.",
      hardPart:
        "A similar name is not a counterfeit. The pipeline has to tell a fake Nike from a different brand called NIKER — and never file a takedown against a legitimate seller on its own.",
      proof:
        "On a live Jumia run the first version opened 8 counterfeit cases, all for the separate brand NIKER. A validation step cut that to 1 — routed to human review, not filed — and cost per 1,000 listings fell from $1.80 to $0.83. That NIKER listing is now a regression test.",
      stack: ["FastAPI", "SQLAlchemy 2.0 (async)", "pydantic-ai", "Playwright", "Celery", "Redis", "PostgreSQL", "Langfuse"],
      repo: "https://github.com/joshyvibe/listingguard",
      live: null,
      image: "assets/projects/listingguard.png",
      icon: ICONS.shield,
      accent: "#c084fc",
      details: [
        "<strong>Validate before scoring.</strong> The LLM returns a typed <code>Verdict</code> — classification (counterfeit, look-alike, legitimate use, noise, ambiguous), confidence and product type — before any rule runs. Price floors are per product type, and price and logo evidence only count when a listing claims to be the brand: a different brand is expected to be cheaper and logo-free.",
        "<strong>People decide the hard calls.</strong> Only a clear, high-confidence counterfeit is ready to report on its own; look-alike marks and ambiguous listings go to a review queue. Cases move through a strict transition table with an audited history, and the takedown draft is a template filled from stored evidence — never LLM-written, never submitted automatically.",
        "<strong>A staged fan-out/fan-in on Celery.</strong> Platform searches run in parallel, then one analysis task per listing, then a finalize step. Tasks are idempotent with <code>acks_late</code>, so a worker killed mid-run redelivers without duplicating rows.",
        "<strong>Cost and evidence you can audit.</strong> Vision runs only where it can change the outcome; every LLM call is traced in self-hosted Langfuse with tokens, cost and prompt version; a read-only tool-calling agent answers multi-turn questions over the cases. eBay is read through its official API rather than scraped.",
      ],
    },
  ];


  function hostnameOf(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  }


  /* ============================================================
   * GitHub contribution calendar, rendered from the snapshot that
   * scripts/update-github-contributions.mjs writes.
   * ============================================================ */
  const ghCard = document.getElementById("ghCard");
  if (ghCard) {
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const parseDay = (iso) => new Date(`${iso}T00:00:00Z`);
    const prettyDay = (iso) => parseDay(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

    fetch("assets/github-contributions.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(({ total, days, generatedAt }) => {
        // Current streak counts back from the last day, allowing today to still be empty.
        let streak = 0;
        let i = days.length - 1;
        if (days[i] && days[i].count === 0) i -= 1;
        for (; i >= 0 && days[i].count > 0; i -= 1) streak += 1;
        let longest = 0;
        let run = 0;
        for (const d of days) { run = d.count > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
        const active = days.filter((d) => d.count > 0).length;

        // Columns are Sun–Sat weeks; pad the first week so day 0 lands on its weekday row.
        const lead = parseDay(days[0].date).getUTCDay();
        const cells = [...Array(lead).fill(null), ...days];
        const weeks = Math.ceil(cells.length / 7);

        const months = [];
        let lastMonth = -1;
        for (let w = 0; w < weeks; w += 1) {
          const first = cells.slice(w * 7, w * 7 + 7).find(Boolean);
          const m = first ? parseDay(first.date).getUTCMonth() : lastMonth;
          months.push(m !== lastMonth && w < weeks - 1 ? MONTHS[m] : "");
          lastMonth = m;
        }
        // A label needs ~3 columns of room; drop one that would collide with the next.
        months.forEach((m, w) => {
          if (m && months.slice(w + 1, w + 3).some(Boolean)) months[w] = "";
        });

        const cellHtml = cells
          .map((d, idx) => {
            const w = Math.floor(idx / 7);
            if (!d) return `<i class="gh-cell is-pad" style="--w: ${w}"></i>`;
            const label = `${d.count || "No"} contribution${d.count === 1 ? "" : "s"} on ${prettyDay(d.date)}`;
            return `<i class="gh-cell" data-l="${d.level}" style="--w: ${w}" title="${label}"></i>`;
          })
          .join("");

        document.getElementById("ghScroll").innerHTML = `
          <div class="gh-graph">
            <div class="gh-months" aria-hidden="true">${months.map((m) => `<span>${m}</span>`).join("")}</div>
            <div class="gh-days" aria-hidden="true"><span></span><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span></div>
            <div class="gh-weeks" role="img" aria-label="${total.toLocaleString()} contributions in the past year">${cellHtml}</div>
          </div>`;
        document.getElementById("ghTotal").innerHTML = `<strong>${total.toLocaleString()}</strong> contributions in the past year`;
        if (streak > 0) {
          const chip = document.getElementById("ghStreak");
          chip.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 1s1 3.5-1.5 6.5S7 11 7 15a5 5 0 0 0 10 0c0-2-1-3.5-1-3.5s2 1 2 4a6 6 0 1 1-12 0C6 9 13.5 7 13.5 1z"/></svg>${streak}d streak`;
          chip.hidden = false;
        }
        const updated = new Date(generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        document.getElementById("ghActive").textContent = `${active} active days · longest streak ${longest}d · updated ${updated}`;

        // Newest weeks are on the right; start narrow screens scrolled there.
        const scroller = document.getElementById("ghScroll");
        scroller.scrollLeft = scroller.scrollWidth;

        new IntersectionObserver((entries, obs) => {
          if (entries.some((e) => e.isIntersecting)) { ghCard.classList.add("is-live"); obs.disconnect(); }
        }, { threshold: 0.25 }).observe(ghCard);
      })
      .catch(() => {
        document.getElementById("ghScroll").innerHTML =
          `<p class="gh-fallback">See the full activity on <a href="https://github.com/${ghCard.dataset.user}" target="_blank" rel="noopener">GitHub ↗</a></p>`;
      });
  }

  /* ============================================================
   * Press C (or tap the hint) to copy the email address.
   * ============================================================ */
  const copyHint = document.querySelector(".copy-hint");
  const toast = document.getElementById("toast");
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-shown");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-shown"), 2200);
  }
  async function copyEmail() {
    const email = copyHint.dataset.copy;
    try {
      await navigator.clipboard.writeText(email);
      showToast("Email copied — talk soon");
    } catch {
      window.location.href = `mailto:${email}`;
    }
    copyHint.classList.add("is-pressed");
    window.setTimeout(() => copyHint.classList.remove("is-pressed"), 160);
  }
  if (copyHint && toast) {
    copyHint.addEventListener("click", copyEmail);
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() !== "c" || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const t = e.target;
      if (t.closest("input, textarea, select, [contenteditable='true']")) return;
      if (window.getSelection().toString()) return; // don't hijack a real copy
      copyEmail();
    });
  }


  /* ============================================================
   * Case files — a looping 3D carousel of folders. The centred file
   * links to its full write-up; side files just bring themselves forward.
   * ============================================================ */
  const CASE_FILES = [
    {
      slug: "estatepadi", title: "EstatePadi", accent: "#4ade80", sheet: "Live · production",
      line: "Residents, estate admins and gate security on one multi-tenant platform.",
      tags: "SaaS · Payments · Android", image: "assets/projects/estatepadi.png",
      meta: [["Type", "Multi-tenant SaaS"], ["Status", "Live · real users"], ["Role", "Sole engineer"]],
      headline: "Resident, admin and gate-security portals — one codebase, one database, live since 2022.",
      summary: "Three audiences, three very different trust levels, one database: residents pay dues and manage their household, estate admins run the books and approve service providers, and gate security verifies visitors against identity data only. I designed and built all of it — data model, permissions, payments, and the Android release — as the sole engineer.",
      facts: [["Since 2022", "Running with real residents"], ["40% faster", "Responses after a query/indexing redesign"], ["3 portals", "One codebase, one database"], ["Google Play", "Published Android app"]],
      points: [
        "<strong>Authorization at the request layer.</strong> Every role boundary lives in permission classes evaluated on the request, not the interface — a resident's session can't reach admin or security endpoints no matter what the client sends. Every sensitive action is written to an audit log.",
        "<strong>Payments that reconcile themselves.</strong> Paystack integration, webhook handling, payment-evidence submission and admin verification, closing with an automated digital receipt — manual reconciliation for estate committees is gone.",
        "<strong>Access enforced at the edge, not trusted from state.</strong> Subscription and access checks were standardized at the request layer so billing status can never quietly drift from what a user can actually do.",
        "<strong>Shipped end to end.</strong> Taken from data model to a published Android app on Google Play with push notifications, plus a PostgreSQL query/indexing redesign that cut response times by 40% under real peak traffic.",
      ],
      stack: ["Django", "DRF", "PostgreSQL", "React", "Paystack", "Android", "AWS", "Docker", "CI/CD"],
      links: [["Open", "https://estatepadi.com"]],
    },
    {
      slug: "anwrk", title: "Anwrk", accent: "#ff6b1a", sheet: "Live · production",
      line: "Find, book and pay vetted artisans nearby — on Android, iPhone and web.",
      tags: "Marketplace · Mobile", image: "assets/projects/anwrk.png",
      meta: [["Type", "Marketplace"], ["Status", "Live"], ["Platforms", "Android · iPhone · Web"]],
      headline: "Find, book and pay vetted home-service professionals near you.",
      summary: "An artisan marketplace for Nigeria from Allforms Limited: customers find skilled artisans close to the job, book in a few taps, follow the work in real time, and pay inside the app.",
      facts: [["Geolocation", "Matches the closest artisans"], ["Verified", "Professionals vetted before booking"], ["Real-time", "Job progress tracking"], ["In-app", "Secure payments"]],
      points: [
        "<strong>Geolocation matching</strong> surfaces skilled artisans closest to the job.",
        "<strong>Verified professionals</strong>, vetted for quality before they can take bookings.",
        "<strong>Book in a few taps</strong>, then track the artisan's progress in real time.",
        "<strong>Secure payments</strong> to close out each job inside the app.",
      ],
      stack: ["Marketplace", "Geolocation", "Payments", "Mobile"],
      links: [["Open", "https://anwrk.com"]],
    },
    ...[
      ["team-kb", "Team KB", "Chat with your team's documents, with a citation for every answer.", "AI · RAG · Multi-tenant"],
      ["prediction-market", "Prediction Market", "An on-chain market plus an indexer that survives being killed mid-backfill.", "Solidity · Indexer"],
      ["digital-marketplace", "Digital Marketplace", "One cart, many vendors, Stripe Connect payouts that never double-process.", "Payments · Stripe Connect"],
      ["realtime-kanban", "Realtime Kanban", "Two people move the same card at once — exactly one write wins, visibly.", "Realtime · WebSockets"],
      ["venue-ticketing", "Venue Ticketing", "Concurrent buyers racing for the last ticket can never oversell it.", "Concurrency · Payments"],
      ["listingguard", "ListingGuard", "Tells a fake Nike from a different brand called NIKER, and leaves the hard calls to a person.", "AI · LLM pipeline"],
    ].map(([slug, title, line, tags], i) => {
      const p = projects[i];
      return {
        slug, title, line, tags, sheet: "Open source", image: p.image, accent: p.accent,
        meta: [["Type", p.status.split("·").pop().trim()], ["Status", p.live ? "Live" : "Open source"], ["Built", "Solo, end to end"]],
        headline: p.tagline, summaryLabel: "The hard part", summary: p.hardPart, proof: p.proof,
        points: p.details, stack: p.stack, media: p.media,
        links: [p.live && ["Live", p.live], ["Code", p.repo]].filter(Boolean),
      };
    }),
  ];

  const filesStage = document.getElementById("filesStage");
  const filesTrack = document.getElementById("filesTrack");
  if (filesStage && filesTrack) {
    const total = CASE_FILES.length;
    const pad = (n) => String(n).padStart(2, "0");
    filesTrack.innerHTML = CASE_FILES.map((f, i) => `
      <a class="file" href="#case/${f.slug}" data-i="${i}" style="--fa: ${f.accent || "var(--accent)"}" draggable="false"
         aria-label="Case ${pad(i + 1)}: ${f.title}. ${f.line}">
        <span class="file-tab">Nº${pad(i + 1)} · ${f.title}</span>
        <span class="file-back"></span>
        <span class="file-sheet">
          <span class="file-sheet-head"><span>Sheet:: ${pad(i + 1)}/${pad(total)}</span><span>${f.sheet}</span></span>
          <img src="${f.image}" alt="" loading="lazy" draggable="false">
        </span>
        <span class="file-front">
          <span class="file-front-top"><span class="file-case">Case:: Nº${pad(i + 1)}</span><span class="file-num">${pad(i + 1)}</span></span>
          <strong class="file-title">${f.title}</strong>
          <span class="file-line">${f.line}</span>
          <span class="file-tags">${f.tags}</span>
        </span>
      </a>`).join("");

    const files = Array.from(filesTrack.querySelectorAll(".file"));
    const countEl = document.getElementById("filesCount");
    const bar = document.getElementById("filesBar");
    bar.style.width = `${100 / total}%`;
    let active = 0;

    function layout() {
      const w = files[0].offsetWidth;
      files.forEach((el, i) => {
        // Shortest signed distance around the loop, so the carousel wraps.
        let d = i - active;
        if (d > total / 2) d -= total;
        if (d < -total / 2) d += total;
        const ad = Math.abs(d);
        const x = d === 0 ? 0 : Math.sign(d) * (w * 1.04 + (ad - 1) * w * 0.72);
        el.style.transform = `translateX(calc(-50% + ${x}px)) translateZ(${-ad * 120}px) rotateY(${-d * 14}deg)`;
        el.style.zIndex = String(20 - ad);
        el.style.opacity = ad > 2 ? "0" : "1";
        el.style.filter = ad ? `brightness(${1 - ad * 0.22}) saturate(${1 - ad * 0.25})` : "none";
        el.style.pointerEvents = ad > 2 ? "none" : "";
        el.classList.toggle("is-active", d === 0);
        el.tabIndex = d === 0 ? 0 : -1;
      });
      countEl.textContent = `${pad(active + 1)} / ${pad(total)} · ${CASE_FILES[active].title}`;
      bar.style.left = `${(active * 100) / total}%`;
    }
    // Scroll-driven mode: while the section is pinned, every STEP px of page scroll is one file.
    const filesSection = document.getElementById("files");
    const pin = document.getElementById("filesPin");
    let pinned = false;
    let step = 280;
    function setupPin() {
      pinned = !prefersReducedMotion && window.innerHeight >= 560;
      filesSection.classList.toggle("is-pinned", pinned);
      step = window.innerWidth < 760 ? 210 : 280;
      pin.style.height = pinned ? `${window.innerHeight + (total - 1) * step}px` : "";
    }
    const pinTop = () => pin.getBoundingClientRect().top + window.scrollY;
    function syncFromScroll() {
      if (!pinned) return;
      const progress = (window.scrollY - pinTop()) / step;
      const i = Math.min(total - 1, Math.max(0, Math.round(progress)));
      if (i !== active) { active = i; layout(); }
    }
    let scrollTick = false;
    window.addEventListener("scroll", () => {
      if (scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(() => { scrollTick = false; syncFromScroll(); });
    }, { passive: true });

    function show(i) { active = ((i % total) + total) % total; layout(); }
    function go(i) {
      show(i);
      // Keep the page scroll in step, otherwise the next scroll would snap back to the old file.
      if (pinned) window.scrollTo({ top: pinTop() + active * step, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }

    document.getElementById("filesPrev").addEventListener("click", () => go(active - 1));
    document.getElementById("filesNext").addEventListener("click", () => go(active + 1));
    filesStage.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
    });

    // Drag / swipe. The deck follows the finger or mouse, then snaps to the nearest file.
    // A drag suppresses the click that would otherwise follow it.
    let dragged = false;
    let drag = null; // { x, y, dx, axis }
    // One swipe = one file; only a swipe longer than a whole folder skips further.
    const SWIPE_STEP = () => files[0].offsetWidth * 1.1;
    function dragTo(dx) {
      filesTrack.style.transition = "none";
      filesTrack.style.transform = `translateX(${dx * 0.85}px)`;
    }
    function endDrag() {
      if (!drag) return;
      const { dx, axis } = drag;
      drag = null;
      filesStage.classList.remove("is-dragging");
      filesTrack.style.transition = "transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)";
      filesTrack.style.transform = "";
      if (axis === "x" && Math.abs(dx) > 40) {
        dragged = true;
        go(active - Math.sign(dx) * Math.max(1, Math.floor(Math.abs(dx) / SWIPE_STEP())));
      }
    }

    // Touch: lock to the first clear direction. Sideways swipes move the deck (and stop the
    // page from scrolling); vertical swipes are left alone so the page scrolls as usual.
    filesStage.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      drag = { x: e.touches[0].clientX, y: e.touches[0].clientY, dx: 0, axis: null };
      dragged = false;
    }, { passive: true });
    filesStage.addEventListener("touchmove", (e) => {
      if (!drag) return;
      const dx = e.touches[0].clientX - drag.x;
      const dy = e.touches[0].clientY - drag.y;
      if (!drag.axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (drag.axis !== "x") return;
      e.preventDefault();
      drag.dx = dx;
      filesStage.classList.add("is-dragging");
      dragTo(dx);
    }, { passive: false });
    filesStage.addEventListener("touchend", endDrag);
    filesStage.addEventListener("touchcancel", endDrag);

    // Mouse / pen (touch is handled above).
    filesStage.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, dx: 0, axis: null };
      dragged = false;
    });
    window.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerType === "touch") return;
      drag.dx = e.clientX - drag.x;
      if (!drag.axis && Math.abs(drag.dx) > 8) drag.axis = "x";
      if (drag.axis === "x") { filesStage.classList.add("is-dragging"); dragTo(drag.dx); }
    });
    window.addEventListener("pointerup", (e) => { if (e.pointerType !== "touch") endDrag(); });

    // Sideways trackpad scroll, throttled so one swipe moves one file.
    let wheelLock = 0;
    filesStage.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 12) return;
      e.preventDefault();
      const now = Date.now();
      if (now < wheelLock) return;
      wheelLock = now + 450;
      go(active + Math.sign(e.deltaX));
    }, { passive: false });

    files.forEach((el, i) => el.addEventListener("click", (e) => {
      e.preventDefault();
      if (dragged) { dragged = false; return; }
      if (i !== active) { go(i); return; }
      // The sheet slides up out of the folder, then the case file opens from where it was.
      el.classList.add("is-pulling");
      const r = el.getBoundingClientRect();
      window.setTimeout(() => {
        el.classList.remove("is-pulling");
        openCase(CASE_FILES[i].slug, { push: true, origin: { x: r.left + r.width / 2, y: r.top + r.height / 3 } });
      }, prefersReducedMotion ? 0 : 260);
    }));
    window.__filesShow = show; // the modal syncs the carousel without scrolling the page behind it

    setupPin();
    layout();
    syncFromScroll();
    window.addEventListener("resize", () => { setupPin(); layout(); syncFromScroll(); });
  }

  /* ============================================================
   * Case-file modal. Each project opens over the page at its own
   * #case/<slug> address, so it can be linked to and Back closes it.
   * ============================================================ */
  const caseModal = document.getElementById("caseModal");
  const caseBody = document.getElementById("caseBody");
  const caseScroll = document.getElementById("caseScroll");
  const caseFileLabel = document.getElementById("caseFile");
  let openedFromPage = false;

  const esc = (str) => String(str).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const host = (url) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; } };

  function renderCase(i) {
    const f = CASE_FILES[i];
    const n = String(i + 1).padStart(2, "0");
    const prev = CASE_FILES[(i - 1 + CASE_FILES.length) % CASE_FILES.length];
    const next = CASE_FILES[(i + 1) % CASE_FILES.length];
    caseModal.style.setProperty("--fa", f.accent || "var(--accent)");
    caseFileLabel.innerHTML = `<span>Case:: <b>Nº${n}</b></span><span>File:: <b>${esc(f.title)}</b></span>`;
    const exhibits = [[f.image, `${f.title} — screenshot`], f.media && [f.media.src, f.media.caption]].filter(Boolean);
    caseBody.innerHTML = `
      <p class="cm-meta">${f.meta.map(([k, v]) => `<span>${esc(k)}:: <b>${esc(v)}</b></span>`).join("")}</p>
      <div class="cm-head">
        <h2 id="caseTitle">${esc(f.headline)}</h2>
        <ul class="cm-links">${f.links.map(([k, href]) => `<li><a href="${href}" target="_blank" rel="noopener"><span>${k}::</span> ${esc(host(href))} ↗</a></li>`).join("")}</ul>
      </div>
      <div class="cm-short"><p class="cm-label">${esc(f.summaryLabel || "In short")}::</p><p>${esc(f.summary)}</p></div>
      ${f.facts ? `<dl class="cm-facts">${f.facts.map(([v, l]) => `<div><dt>${esc(v)}</dt><dd>${esc(l)}</dd></div>`).join("")}</dl>` : ""}
      ${f.proof ? `<div class="cm-proof"><p class="cm-label">Proven by::</p><p>${esc(f.proof)}</p></div>` : ""}
      ${exhibits.map(([src, cap], k) => `
        <figure class="cm-exhibit">
          <div class="cm-exhibit-frame"><img src="${src}" alt="${esc(cap)}" loading="lazy"></div>
          <figcaption>Exhibit:: ${String.fromCharCode(65 + k)} · ${esc(cap)}</figcaption>
        </figure>`).join("")}
      <p class="cm-label cm-label-lg">Under the hood::</p>
      <ul class="cm-points">${f.points.map((pt) => `<li>${pt}</li>`).join("")}</ul>
      <div class="cm-stack">${f.stack.map((t) => `<span class="tag-sm">${esc(t)}</span>`).join("")}</div>
      <nav class="cm-pager" aria-label="Other case files">
        <button type="button" data-case="${prev.slug}"><span>← Previous file</span><b>${esc(prev.title)}</b></button>
        <button type="button" data-case="${next.slug}"><span>Next file →</span><b>${esc(next.title)}</b></button>
      </nav>`;
    caseScroll.scrollTop = 0;
  }

  function openCase(slug, { push = false, origin = null } = {}) {
    const i = CASE_FILES.findIndex((f) => f.slug === slug);
    if (i < 0 || !caseModal) return;
    renderCase(i);
    if (window.__filesShow) window.__filesShow(i);
    if (push) {
      history.pushState({ caseFile: slug }, "", `#case/${slug}`);
      openedFromPage = true;
    }
    if (!caseModal.open) {
      const o = origin || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      caseModal.style.setProperty("--ox", `${o.x}px`);
      caseModal.style.setProperty("--oy", `${o.y}px`);
      caseModal.showModal();
      document.documentElement.classList.add("modal-open");
    }
    document.title = `${CASE_FILES[i].title} · Obinna Akpulonu`;
  }

  const baseTitle = document.title;
  function closeCase({ fromHistory = false } = {}) {
    if (!caseModal || !caseModal.open) return;
    caseModal.classList.add("is-closing");
    window.setTimeout(() => {
      caseModal.classList.remove("is-closing");
      caseModal.close();
      document.documentElement.classList.remove("modal-open");
    }, prefersReducedMotion ? 0 : 220);
    document.title = baseTitle;
    if (fromHistory) return;
    if (openedFromPage) { openedFromPage = false; history.back(); }
    else history.replaceState(null, "", `${location.pathname}${location.search}#files`);
  }

  if (caseModal) {
    document.getElementById("caseClose").addEventListener("click", () => closeCase());
    caseModal.addEventListener("cancel", (e) => { e.preventDefault(); closeCase(); }); // Esc
    caseModal.addEventListener("click", (e) => { if (e.target === caseModal) closeCase(); }); // backdrop
    caseBody.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-case]");
      if (!btn) return;
      const slug = btn.dataset.case;
      history.replaceState({ caseFile: slug }, "", `#case/${slug}`);
      openCase(slug);
    });
    // In-page links like the hero's "EstatePadi" use #case/<slug> too.
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#case/"]');
      if (!a || a.classList.contains("file")) return;
      e.preventDefault();
      openCase(a.getAttribute("href").slice(6), { push: true });
    });
    window.addEventListener("popstate", () => {
      const m = location.hash.match(/^#case\/([\w-]+)/);
      if (m) openCase(m[1]);
      else { openedFromPage = false; closeCase({ fromHistory: true }); }
    });
    const initial = location.hash.match(/^#case\/([\w-]+)/);
    if (initial) openCase(initial[1]);
  }


})();
