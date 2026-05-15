/* =====================================================================
   Interacción #03 · "muy pronto" trazado a mano
   ---------------------------------------------------------------------
   Calcula el stroke-dasharray real del <text> Caveat para que el efecto
   "handwriting reveal" se vea consistente independientemente del tamaño.
   La animación CSS ya hace el loop; este script sólo ajusta dasharray.
   ===================================================================== */

(function strokeIn() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const recompute = () => {
    const el = document.querySelector(".muy-pronto__text");
    if (!el) return;

    if (reduceMotion) {
      el.style.strokeDashoffset = "0";
      el.style.strokeDasharray = "0";
      el.style.fillOpacity = "1";
      el.style.animation = "none";
      return;
    }

    // Para SVG <text>, getComputedTextLength devuelve el ancho del texto.
    // El "perímetro" real para el trazo se aproxima multiplicando por un
    // factor empírico que cubre las curvas de cada glifo cursivo.
    let textLength = 0;
    try {
      textLength = el.getComputedTextLength();
    } catch (_) {
      textLength = 320; // fallback razonable
    }

    const dash = Math.ceil(textLength * 3.2);

    // Reescribimos las @keyframes? No: aplicamos la longitud como dasharray
    // y dejamos que el keyframe interpole de dash → 0.
    el.style.strokeDasharray  = String(dash);
    el.style.strokeDashoffset = String(dash);

    // Necesitamos actualizar el keyframe inicial dinámicamente. Truco:
    // sobreescribimos via animation-name reset.
    el.style.animation = "none";
    // forzar reflow
    void el.getBoundingClientRect();
    el.style.removeProperty("animation");

    // Inyectamos una keyframe ad-hoc específica de esta longitud para
    // asegurar que el frame 0 tenga el dashoffset correcto.
    let styleTag = document.getElementById("muy-pronto-keyframes");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "muy-pronto-keyframes";
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      @keyframes muy-pronto-draw {
        0%   { stroke-dashoffset: ${dash}; fill-opacity: 0;    opacity: 1; }
        50%  { stroke-dashoffset: 0;       fill-opacity: 0.4;  opacity: 1; }
        60%  { stroke-dashoffset: 0;       fill-opacity: 1;    opacity: 1; }
        85%  { stroke-dashoffset: 0;       fill-opacity: 1;    opacity: 1; }
        100% { stroke-dashoffset: 0;       fill-opacity: 1;    opacity: 0; }
      }
    `;
  };

  // Esperamos a que la fuente Caveat termine de cargar (sino la medición es incorrecta).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(recompute);
  } else {
    window.addEventListener("load", recompute);
  }

  // Recalcular en resize (afecta font-size del SVG)
  let raf;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(recompute);
  });
})();
