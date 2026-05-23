/* Hallmark · script.js
 * scoped behaviours: HP3 cursor-spotlight (hero only) · countdown · form silent-success
 */

(() => {
  "use strict";

  const reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── HP3 cursor spotlight · scoped to hero only ────────── */
  const hero = document.querySelector(".hero");
  if (hero && !reduced) {
    let raf = 0;
    let pendingX = 0;
    let pendingY = 0;
    const apply = () => {
      raf = 0;
      hero.style.setProperty("--mx", `${pendingX}px`);
      hero.style.setProperty("--my", `${pendingY}px`);
    };
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      pendingX = e.clientX - r.left;
      pendingY = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(apply);
    });
  }

  /* ── live countdown to event start ─────────────────────── */
  const cd = document.getElementById("countdown");
  if (cd && cd.dataset.target) {
    const target = new Date(cd.dataset.target).getTime();
    if (!Number.isNaN(target)) {
      const tick = () => {
        let diff = target - Date.now();
        if (diff <= 0) {
          cd.textContent = "live";
          return false;
        }
        const d = Math.floor(diff / 86_400_000); diff -= d * 86_400_000;
        const h = Math.floor(diff / 3_600_000);  diff -= h * 3_600_000;
        const m = Math.floor(diff / 60_000);     diff -= m * 60_000;
        const s = Math.floor(diff / 1000);
        cd.textContent =
          `${d}d ${String(h).padStart(2, "0")}h ` +
          `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
        return true;
      };
      tick();
      setInterval(() => { tick(); }, 1000);
    }
  }

  /* ── nav state on scroll (sticky pill polish) ──────────── */
  const nav = document.querySelector(".nav");
  if (nav) {
    let lastState = "rest";
    const onScroll = () => {
      const next = window.scrollY > 24 ? "scrolled" : "rest";
      if (next !== lastState) {
        nav.dataset.state = next;
        lastState = next;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ── form silent-success (optimistic, no toast) ────────── */
  const form = document.getElementById("rsvp-form");
  if (form) {
    const button = form.querySelector("button[type='submit']");
    const success = form.querySelector(".rsvp__success");
    const input = form.querySelector("input[type='email']");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!input || !input.value || !input.checkValidity()) {
        input?.focus();
        return;
      }
      if (button) {
        button.dataset.state = "loading";
        button.querySelector(".cta__label").textContent = "Joining…";
      }
      // simulated; wire to real endpoint when available
      setTimeout(() => {
        if (button) {
          button.dataset.state = "success";
          button.querySelector(".cta__label").textContent = "On the list";
          button.querySelector(".cta__arrow").textContent = "✓";
        }
        if (success) {
          success.dataset.state = "ok";
          success.textContent = `You're on the list, ${input.value}. Wave 01 opens 09 Sep — we'll write first.`;
        }
        input.disabled = true;
      }, 480);
    });
  }
})();
