/* =========================================================
   Report chart animation engine — shared by every chart in
   src/components/charts/. Each chart renders its FINAL, visible state in
   the markup (so the no-JS / SSR view is correct and accessible). This
   script, only when motion is allowed, "arms" each chart (snaps it to its
   pre-animation state via the .chart-armed class) and then plays it in on
   scroll-enter by adding .is-in. Number counters are driven here directly.

   Mirrors the site-wide [data-reveal] pattern in BaseLayout: JS adds the
   initial-hidden class, so without JS everything stays fully rendered.

   Imported once per page via a <script> tag in any chart component; Astro
   dedupes the module, so multiple charts share a single observer.
   ========================================================= */

function fmtNumber(value, decimals, prefix, suffix) {
  const n = Number(value).toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${prefix}${n}${suffix}`;
}

function readCounter(node) {
  return {
    to: parseFloat(node.dataset.countTo || "0"),
    decimals: parseInt(node.dataset.countDecimals || "0", 10),
    prefix: node.dataset.countPrefix || "",
    suffix: node.dataset.countSuffix || "",
  };
}

function setCountersFinal(root) {
  root.querySelectorAll("[data-count-to]").forEach((node) => {
    const c = readCounter(node);
    node.textContent = fmtNumber(c.to, c.decimals, c.prefix, c.suffix);
  });
}

function setCountersStart(root) {
  root.querySelectorAll("[data-count-to]").forEach((node) => {
    const c = readCounter(node);
    node.textContent = fmtNumber(0, c.decimals, c.prefix, c.suffix);
  });
}

function runCounters(root) {
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  root.querySelectorAll("[data-count-to]").forEach((node) => {
    const c = readCounter(node);
    const duration = parseFloat(node.dataset.countDuration || "1100");
    let start = null;
    const tick = (now) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      node.textContent = fmtNumber(c.to * easeOutCubic(t), c.decimals, c.prefix, c.suffix);
      if (t < 1) requestAnimationFrame(tick);
      else node.textContent = fmtNumber(c.to, c.decimals, c.prefix, c.suffix);
    };
    requestAnimationFrame(tick);
  });
}

function initCharts() {
  const charts = document.querySelectorAll("[data-chart]:not([data-chart-ready])");
  if (!charts.length) return;

  const reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canObserve = "IntersectionObserver" in window;

  if (reduce || !canObserve) {
    // Static path: leave the rendered final state in place, just settle numbers.
    charts.forEach((el) => {
      el.setAttribute("data-chart-ready", "");
      setCountersFinal(el);
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        runCounters(el);
        // Next frame so the browser registers the armed (initial) state first.
        requestAnimationFrame(() => el.classList.add("is-in"));
        io.unobserve(el);
      }
    },
    { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
  );

  charts.forEach((el) => {
    el.setAttribute("data-chart-ready", "");
    el.classList.add("chart-armed"); // snap to pre-animation state (CSS)
    setCountersStart(el);
    io.observe(el);
  });
}

if (document.readyState !== "loading") initCharts();
else document.addEventListener("DOMContentLoaded", initCharts);
// Re-run after client-side navigation (prefetch/view transitions, if enabled).
document.addEventListener("astro:page-load", initCharts);
