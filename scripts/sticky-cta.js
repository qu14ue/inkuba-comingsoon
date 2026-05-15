/* =====================================================================
   Interacción #09 · Sticky CTA "Avisame cuando abra" + Modal
   ---------------------------------------------------------------------
   - Aparece cuando el usuario pasa el hero (IntersectionObserver sobre
     #hero-sentinel, más performante que scroll listener).
   - Modal con un único input que acepta email O WhatsApp.
   - Validación client-side. Submit envía a backend (a configurar al
     final — ver TODO en submitNotify()).
   - localStorage "inkuba_subscribed=true" → no volver a mostrar el pill.
   ===================================================================== */

(function stickyCta() {
  const STORAGE_KEY = "inkuba_subscribed";

  const cta       = document.getElementById("stickyCta");
  const modal     = document.getElementById("notifyModal");
  const form      = document.getElementById("notifyForm");
  const input     = document.getElementById("notifyInput");
  const hint      = modal?.querySelector("[data-hint]");
  const success   = modal?.querySelector("[data-success]");
  const sentinel  = document.getElementById("hero-sentinel");
  const closeBtns = modal?.querySelectorAll("[data-close]");

  if (!cta || !modal || !form || !input || !sentinel) return;

  // Si el usuario ya se anotó, no mostramos nada
  let alreadySubscribed = false;
  try {
    alreadySubscribed = localStorage.getItem(STORAGE_KEY) === "true";
  } catch (_) { /* private mode, etc. */ }

  if (alreadySubscribed) return;

  // Mostramos el botón en el DOM (estaba con `hidden`) — visibilidad real
  // se controla con la clase .is-visible
  cta.removeAttribute("hidden");

  // ---------- Mostrar/ocultar pill ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      // Cuando el sentinel sale del viewport hacia arriba => usuario pasó el hero
      if (!e.isIntersecting && e.boundingClientRect.top < 0) {
        cta.classList.add("is-visible");
      } else if (e.isIntersecting) {
        cta.classList.remove("is-visible");
      }
    });
  }, { threshold: 0 });
  io.observe(sentinel);

  // ---------- Abrir modal ----------
  cta.addEventListener("click", openModal);

  function openModal() {
    if (typeof modal.showModal === "function") {
      modal.showModal();
    } else {
      // Fallback navegadores muy viejos
      modal.setAttribute("open", "");
    }
    // Reset de estado
    form.hidden = false;
    if (success) success.hidden = true;
    if (hint) hint.textContent = "";
    input.classList.remove("is-invalid");
    input.value = "";
    setTimeout(() => input.focus(), 50);
  }

  function closeModal() {
    if (typeof modal.close === "function") modal.close();
    else modal.removeAttribute("open");
  }

  closeBtns?.forEach(b => b.addEventListener("click", closeModal));

  // Cerrar con click en backdrop
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // ---------- Validación ----------
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // Acepta cualquier número con 8-15 dígitos, ignorando espacios, +, -, ()
  const PHONE_RE = /^\+?[\d\s\-().]{8,20}$/;

  function classify(value) {
    const v = value.trim();
    if (EMAIL_RE.test(v)) return { type: "email",    value: v };
    if (PHONE_RE.test(v) && (v.match(/\d/g) || []).length >= 8) {
      return { type: "whatsapp", value: v.replace(/[^\d+]/g, "") };
    }
    return null;
  }

  // ---------- Submit ----------
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const parsed = classify(input.value);

    if (!parsed) {
      input.classList.add("is-invalid");
      hint.textContent = "Ingresá un email válido o un WhatsApp con código de país.";
      input.focus();
      return;
    }

    input.classList.remove("is-invalid");
    hint.textContent = "";

    const submitBtn = form.querySelector(".modal__submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando…";

    try {
      await submitNotify(parsed);

      try { localStorage.setItem(STORAGE_KEY, "true"); } catch (_) {}

      // Mostrar success
      form.hidden = true;
      if (success) success.hidden = false;

      // Auto-cierre tras 2.5s
      setTimeout(() => {
        closeModal();
        cta.classList.remove("is-visible");
      }, 2500);

    } catch (err) {
      console.error("[InKuba notify] submit error:", err);
      hint.textContent = "Hubo un error. Probá de nuevo en un minuto.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Avisame";
    }
  });

  /**
   * Envía el contacto al backend.
   *
   * TODO · Backend del formulario (configurar al final).
   * ---------------------------------------------------------------------
   * Recomendación: Web3Forms. Pasos:
   *   1. Crear access_key gratis en https://web3forms.com
   *   2. Reemplazar WEB3FORMS_KEY abajo
   *   3. Listo: los avisos llegan al email asociado
   *
   * Mientras tanto, este stub simula el envío con un delay para que
   * el flujo se pueda probar end-to-end.
   */
  async function submitNotify({ type, value }) {
    const WEB3FORMS_KEY = "d7274279-6e1b-4011-a966-84647b68d8c4";

    if (!WEB3FORMS_KEY) {
      // Stub provisional
      console.info("[InKuba notify · stub]", { type, value });
      await new Promise(r => setTimeout(r, 700));
      return { ok: true, stub: true };
    }

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `Coming soon · nuevo aviso (${type})`,
        from_name: "InKuba Coming Soon",
        contact_type: type,
        contact_value: value,
        page: window.location.href,
        timestamp: new Date().toISOString()
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
})();
