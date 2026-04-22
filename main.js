(() => {
  "use strict";

  // ——— Countdown to ceremony (Europe/Minsk = UTC+3, no DST) ———
  const CEREMONY_UTC = Date.UTC(2026, 4, 23, 8, 0, 0); // 11:00 Minsk = 08:00 UTC
  const DAY_END_UTC  = Date.UTC(2026, 4, 23, 21, 0, 0); // 00:00 next day Minsk

  const cdRoot  = document.getElementById("countdown");
  const cdCells = cdRoot ? {
    d: cdRoot.querySelector('[data-cd="d"]'),
    h: cdRoot.querySelector('[data-cd="h"]'),
    m: cdRoot.querySelector('[data-cd="m"]'),
  } : null;

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function renderCountdown() {
    if (!cdRoot) return;
    const now = Date.now();
    const diff = CEREMONY_UTC - now;

    if (diff <= 0) {
      const stillToday = now < DAY_END_UTC;
      const label = stillToday ? "уже сегодня" : "уже поженились";
      cdRoot.outerHTML = `<p class="cd-done">${label} <span aria-hidden="true">🤍</span></p>`;
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000)  / 60000);

    cdCells.d.textContent = String(days);
    cdCells.h.textContent = pad(hours);
    cdCells.m.textContent = pad(minutes);
  }

  renderCountdown();
  setInterval(renderCountdown, 60_000);

  // ——— Scroll reveal ———
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (reduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(el => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

    revealEls.forEach(el => io.observe(el));
  }
})();
