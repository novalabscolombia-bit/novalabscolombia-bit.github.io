/* NITRA — sitio público: la red que crece al bajar, reproductor, enlaces a cada tutorial, filtros, menú y WhatsApp. */
(() => {
  "use strict";

  // El número de WhatsApp de NITRA: cambiarlo aquí cambia todos los botones del sitio.
  const WHATSAPP = "573248874403";
  const wa = (texto) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = wa(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const progreso = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
  };

  // Títulos de cada video (el id es el nombre del archivo en /videos)
  const TITULOS = {
    "axon-en-60s": "AXON en 60 s",
    "demo-pedido": "Un pedido de principio a fin",
    "tutorial-panel": "Tutorial completo del panel",
    "aprobar-pago": "Aprobar un pago",
    "asignar-repartidor": "Asignar el repartidor",
    "excel-ventas": "Excel de ventas del día",
    "que-esperas": "¿Tú qué esperas?",
    "presentacion": "Conoce NITRA",
  };

  const enlaceDe = (id) => `${location.origin}${location.pathname}#t-${id}`;
  const esVertical = () => window.matchMedia("(max-width: 760px) and (orientation: portrait)").matches;

  // ── reproductor ──
  const modal = document.getElementById("modal");
  const video = document.getElementById("modal-video");
  const titulo = document.getElementById("modal-titulo");
  const copiarModal = document.getElementById("modal-copiar");
  let actual = null;
  let foco = null;

  function abrir(id) {
    if (!TITULOS[id]) return;
    actual = id;
    foco = document.activeElement;
    const v = esVertical();
    const suf = v ? "v" : "h";
    modal.classList.toggle("vertical", v);
    video.poster = `videos/${id}-${suf}.jpg`;
    video.src = `videos/${id}-${suf}.mp4`;
    titulo.textContent = TITULOS[id];
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    history.replaceState(null, "", `#t-${id}`);
    document.getElementById("modal-cerrar").focus();
    // Desde un enlace (sin clic) el navegador puede bloquear la reproducción con sonido: queda el botón de play.
    const p = video.play();
    if (p) p.catch(() => {});
  }

  function cerrar() {
    if (modal.hidden) return;
    video.pause();
    video.removeAttribute("src");
    video.load();
    modal.hidden = true;
    document.body.style.overflow = "";
    history.replaceState(null, "", location.pathname + location.search);
    if (foco && foco.focus) foco.focus();
    actual = null;
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-video]");
    if (b) { e.preventDefault(); abrir(b.dataset.video); }
  });
  document.getElementById("modal-cerrar").addEventListener("click", cerrar);
  modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });

  // Enlace directo a un video: …/#t-aprobar-pago abre ese tutorial
  function desdeHash() {
    const m = location.hash.match(/^#t-([a-z0-9-]+)$/);
    if (m && TITULOS[m[1]] && actual !== m[1]) {
      const tarjeta = document.getElementById(`t-${m[1]}`);
      if (tarjeta) tarjeta.scrollIntoView({ block: "center" });
      abrir(m[1]);
    }
  }
  window.addEventListener("hashchange", desdeHash);
  desdeHash();

  // ── copiar enlace ──
  async function copiar(id, boton) {
    const texto = enlaceDe(id);
    try { await navigator.clipboard.writeText(texto); }
    catch {
      const t = document.createElement("textarea");
      t.value = texto; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); } catch { /* sin portapapeles */ }
      t.remove();
    }
    const s = boton.querySelector("span");
    const antes = s.textContent;
    s.textContent = "¡Enlace copiado!";
    setTimeout(() => { s.textContent = antes; }, 1800);
  }
  document.querySelectorAll("[data-copiar]").forEach((b) => b.addEventListener("click", () => copiar(b.dataset.copiar, b)));
  copiarModal.addEventListener("click", () => actual && copiar(actual, copiarModal));

  // ── filtros de tutoriales ──
  const filtros = document.querySelectorAll("[data-filtro]");
  filtros.forEach((f) => f.addEventListener("click", () => {
    filtros.forEach((g) => { g.classList.toggle("activo", g === f); g.setAttribute("aria-pressed", g === f); });
    document.querySelectorAll(".tut").forEach((t) => {
      t.hidden = f.dataset.filtro !== "todos" && t.dataset.cat !== f.dataset.filtro;
    });
  }));

  // ── menú del celular ──
  const ham = document.getElementById("hamburguesa");
  const links = document.getElementById("links");
  ham.addEventListener("click", () => {
    const abierto = links.classList.toggle("abierto");
    ham.setAttribute("aria-expanded", abierto);
    ham.setAttribute("aria-label", abierto ? "Cerrar el menú" : "Abrir el menú");
  });
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) { links.classList.remove("abierto"); ham.setAttribute("aria-expanded", "false"); }
  });

  // ── al bajar: borde del menú, barra de avance y la N de la portada ──
  const menu = document.getElementById("menu");
  const barra = document.getElementById("progreso");
  const heroN = document.getElementById("hero-n");
  let pendiente = 0;
  function alBajar() {
    pendiente = 0;
    const y = window.scrollY;
    menu.classList.toggle("con-borde", y > 10);
    if (barra) barra.style.transform = `scaleX(${progreso().toFixed(4)})`;
    // como en la página anterior: la N baja, gira y se desvanece al empezar a bajar
    if (heroN && !reduce) {
      heroN.style.setProperty("--y", (Math.min(y, 900) * 0.25).toFixed(1));
      heroN.style.setProperty("--q", Math.min(1, y / 650).toFixed(3));
    }
  }
  window.addEventListener("scroll", () => { if (!pendiente) pendiente = requestAnimationFrame(alBajar); }, { passive: true });
  window.addEventListener("resize", alBajar);
  alBajar();

  // ── las cifras: el 88 % sube desde el 78 % y la cuadrícula de 100 restaurantes ──
  document.querySelectorAll(".viz-cien").forEach((c) => {
    const on = Number(c.dataset.on) || 0;
    c.innerHTML = Array.from({ length: 100 }, (_, i) => (i < on ? `<i class="on" style="--k:${i}"></i>` : "<i></i>")).join("");
  });
  function contar(el) {
    const de = Number(el.dataset.de), a = Number(el.dataset.a);
    if (reduce || !(a > de)) { el.textContent = a; return; }
    const t0 = performance.now(), dur = 1500;
    const paso = (t) => {
      const u = clamp((t - t0) / dur, 0, 1);
      el.textContent = Math.round(de + (a - de) * (1 - Math.pow(1 - u, 3)));
      if (u < 1) requestAnimationFrame(paso);
    };
    el.textContent = de;
    requestAnimationFrame(paso);
  }

  // ── aparición al bajar ──
  const revs = document.querySelectorAll(".rev");
  const mostrar = (el) => {
    el.classList.add("in");
    el.querySelectorAll("[data-a]").forEach((n) => setTimeout(() => contar(n), 350));
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => { if (en.isIntersecting) { mostrar(en.target); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revs.forEach((r) => io.observe(r));
  } else {
    revs.forEach(mostrar);
  }

  // ── la red: puntos que se van conectando a medida que bajas ──
  // Arriba casi todo está suelto; al llegar al final, la red está completa y por ella viajan mensajes.
  (function red() {
    const lienzo = document.getElementById("red");
    const ctx = lienzo && lienzo.getContext && lienzo.getContext("2d");
    if (!ctx) return;
    const ALTO = 1.45;                 // la red mide 1,45 pantallas y sube despacio al bajar (paralaje)
    const TEAL = "14, 159, 142";
    let W = 0, H = 0, movil = false;
    let nodos = [], enlaces = [], salen = [], pulsos = [], ultimo = 0;

    // brillo de cada mensaje, dibujado una sola vez
    const brillo = document.createElement("canvas");
    brillo.width = brillo.height = 24;
    const bctx = brillo.getContext("2d");
    const grad = bctx.createRadialGradient(12, 12, 0, 12, 12, 12);
    grad.addColorStop(0, `rgba(${TEAL}, .32)`);
    grad.addColorStop(1, `rgba(${TEAL}, 0)`);
    bctx.fillStyle = grad;
    bctx.fillRect(0, 0, 24, 24);

    function crear() {
      movil = W < 760;
      let s = 11;                      // azar con semilla: la red es siempre la misma
      const azar = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
      const total = movil ? 30 : 60, minimo = movil ? 0.1 : 0.085, asp = W / H;
      nodos = [];
      for (let i = 0; nodos.length < total && i < 8000; i++) {
        const x = azar() * 1.04 - 0.02, y = azar() * ALTO;
        if (Math.abs(x - 0.5) < 0.2 && azar() < 0.6) continue;   // menos puntos donde va el texto
        if (nodos.some((o) => Math.hypot((o.x - x) * asp, o.y - y) < minimo)) continue;
        nodos.push({ x, y });
      }
      const vistos = new Set();
      enlaces = [];
      nodos.forEach((a, i) => {
        nodos.map((b, j) => [j, Math.hypot((a.x - b.x) * asp, a.y - b.y)])
          .filter(([j]) => j !== i)
          .sort((u, v) => u[1] - v[1])
          .slice(0, 3)
          .forEach(([j, d]) => {
            const k = i < j ? `${i}-${j}` : `${j}-${i}`;
            if (vistos.has(k) || d > minimo * 3.4) return;
            vistos.add(k);
            const b = nodos[j];
            const [p, q] = a.y <= b.y ? [i, j] : [j, i];   // cada línea crece desde el punto más alto
            // cuándo se conecta: arriba ya hay algo conectado; al 90 % de la página, todo
            enlaces.push({ a: p, b: q, t: ((a.y + b.y) / 2 / ALTO) * 0.95 - 0.2 + azar() * 0.2 });
          });
      });
      salen = nodos.map(() => []);
      enlaces.forEach((e, i) => { salen[e.a].push(i); salen[e.b].push(i); });
      pulsos = [];
    }

    function medir() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = window.innerWidth, h = window.innerHeight;
      const nuevoAncho = w !== W;
      W = w; H = h;
      lienzo.width = Math.round(W * dpr);
      lienzo.height = Math.round(H * dpr);
      lienzo.style.width = `${W}px`;
      lienzo.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nuevoAncho) crear();        // en el celular la barra del navegador cambia el alto: no rehacer la red
      dibujar(performance.now());
    }

    function dibujar(ahora) {
      const p = progreso();
      const sube = reduce ? 0 : p * (ALTO - 1) * H;
      const X = (n) => n.x * W, Y = (n) => n.y * H - sube;
      const lleno = enlaces.map((e) => clamp((p - e.t) / 0.07, 0, 1));
      ctx.clearRect(0, 0, W, H);

      // 1) la red que todavía no se conecta: trazo muy suave
      ctx.beginPath();
      enlaces.forEach((e) => { const a = nodos[e.a], b = nodos[e.b]; ctx.moveTo(X(a), Y(a)); ctx.lineTo(X(b), Y(b)); });
      ctx.strokeStyle = "rgba(16, 22, 20, .06)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 2) lo que ya se conectó, en verde azulado: cada línea se dibuja de arriba hacia abajo
      ctx.beginPath();
      enlaces.forEach((e, i) => {
        const f = lleno[i];
        if (!f) return;
        const a = nodos[e.a], b = nodos[e.b];
        ctx.moveTo(X(a), Y(a));
        ctx.lineTo(X(a) + (X(b) - X(a)) * f, Y(a) + (Y(b) - Y(a)) * f);
      });
      ctx.strokeStyle = `rgba(${TEAL}, .27)`;
      ctx.lineWidth = 1.25;
      ctx.stroke();

      // 3) los puntos: grises si siguen solos, verdes cuando ya están conectados
      nodos.forEach((n, i) => {
        const y = Y(n);
        if (y < -12 || y > H + 12) return;
        const on = salen[i].some((k) => lleno[k] >= 1);
        ctx.fillStyle = on ? `rgba(${TEAL}, .8)` : "rgba(16, 22, 20, .2)";
        ctx.beginPath();
        ctx.arc(X(n), y, on ? 2.8 : 2.1, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4) mensajes que viajan por la red: cada vez más, a medida que se conecta
      if (reduce) return;
      const dt = ultimo ? Math.min(0.05, (ahora - ultimo) / 1000) : 0;
      ultimo = ahora;
      const listos = [];
      lleno.forEach((f, i) => { if (f >= 1) listos.push(i); });
      const meta = listos.length ? Math.round(2 + p * (movil ? 9 : 20)) : 0;
      const nuevo = () => ({ e: listos[(Math.random() * listos.length) | 0], d: Math.random() < 0.5 ? 1 : -1, u: 0, v: 55 + Math.random() * 60 });
      while (pulsos.length < meta) pulsos.push(nuevo());
      if (pulsos.length > meta) pulsos.length = meta;
      pulsos.forEach((m, idx) => {
        let e = enlaces[m.e];
        if (!e || lleno[m.e] < 1) { pulsos[idx] = nuevo(); return; }
        const a = nodos[m.d > 0 ? e.a : e.b], b = nodos[m.d > 0 ? e.b : e.a];
        const largo = Math.hypot(X(b) - X(a), Y(b) - Y(a)) || 1;
        m.u += (dt * m.v) / largo;
        if (m.u >= 1) {
          // llega al punto y sigue por otra línea ya conectada
          const fin = m.d > 0 ? e.b : e.a;
          const opciones = salen[fin].filter((k) => k !== m.e && lleno[k] >= 1);
          if (!opciones.length) { pulsos[idx] = nuevo(); return; }
          m.e = opciones[(Math.random() * opciones.length) | 0];
          m.d = enlaces[m.e].a === fin ? 1 : -1;
          m.u = 0;
          return;
        }
        const x = X(a) + (X(b) - X(a)) * m.u, y = Y(a) + (Y(b) - Y(a)) * m.u;
        if (y < -20 || y > H + 20) return;
        ctx.drawImage(brillo, x - 12, y - 12);
        ctx.fillStyle = `rgb(${TEAL})`;
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    window.addEventListener("resize", medir);
    medir();
    if (reduce) {
      window.addEventListener("scroll", () => requestAnimationFrame(dibujar), { passive: true });
    } else {
      const bucle = (t) => {
        if (modal.hidden) dibujar(t); else ultimo = 0;   // con un video abierto no se dibuja
        requestAnimationFrame(bucle);
      };
      requestAnimationFrame(bucle);
    }
  })();

  // ── el cierre: la red completa, como la de la página anterior ──
  (function redFinal() {
    const svg = document.getElementById("red-final");
    if (!svg) return;
    const N = [[8, 2], [24, 1], [40, 3.5], [56, 1.5], [72, 3], [88, 1], [95, 4], [12, 18], [32, 26], [50, 21], [68, 28], [85, 20],
      [20, 46], [44, 52], [64, 47], [90, 54], [10, 70], [36, 76], [58, 71], [80, 78], [28, 92], [52, 95], [74, 90]];
    const L = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [0, 7], [1, 8], [2, 9], [4, 10], [5, 11], [7, 8], [9, 10], [7, 12],
      [8, 13], [9, 13], [10, 14], [11, 15], [12, 13], [14, 15], [12, 16], [13, 17], [14, 18], [15, 19], [16, 17], [18, 19],
      [16, 20], [17, 20], [18, 21], [19, 22], [20, 21], [21, 22]];
    let h = "";
    L.forEach(([a, b], i) => {
      const [p, q] = N[a][1] <= N[b][1] ? [a, b] : [b, a];   // el flujo siempre baja
      const c = `x1="${N[p][0]}%" y1="${N[p][1]}%" x2="${N[q][0]}%" y2="${N[q][1]}%"`;
      h += `<line class="base" ${c}/><line class="flujo" ${c} style="animation-duration:${7 + (i % 6) * 1.5}s;animation-delay:${-(i % 9) * 1.3}s"/>`;
    });
    N.forEach(([x, y], i) => {
      h += `<circle class="nodo" cx="${x}%" cy="${y}%" r="2.6" style="animation-delay:${(i % 7) * 0.6}s;animation-duration:${3 + (i % 5)}s"/>`;
    });
    svg.innerHTML = h;
  })();
})();
