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
      cdRoot.outerHTML = `<p class="cd-done">${stillToday ? "уже сегодня 🤍" : "уже поженились 🤍"}</p>`;
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
  setInterval(renderCountdown, 30_000);

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

  // ——— Add to calendar (.ics) ———
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sonya & Anton//Wedding 2026//RU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:ceremony-sa-20260523@wedding.invite",
    "DTSTAMP:20260101T000000Z",
    "DTSTART:20260523T080000Z",
    "DTEND:20260523T090000Z",
    "SUMMARY:Свадьба Сони и Антона — церемония",
    "LOCATION:ЗАГС Центрального района, Минск",
    "DESCRIPTION:Приезжать к 10:40. Церемония + Зал шампанского ≈ 1 час.",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "UID:reception-sa-20260523@wedding.invite",
    "DTSTAMP:20260101T000000Z",
    "DTSTART:20260523T150000Z",
    "DTEND:20260523T210000Z",
    "SUMMARY:Свадьба Сони и Антона — вечер",
    "LOCATION:bar Babe, Кальварийская 21, Минск",
    "DESCRIPTION:Не позже 18:10. До 00:00.",
    "END:VEVENT",
    "END:VCALENDAR",
    ""
  ].join("\r\n");

  const btn = document.getElementById("add-to-calendar");
  if (btn) {
    btn.addEventListener("click", () => {
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sonya-anton-wedding.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    });
  }
})();
