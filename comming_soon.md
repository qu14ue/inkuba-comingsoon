# InKuba · Coming Soon · Spec de implementación

> Documento de handoff para construir la landing page de **inkuba_tattoo_studio** en Claude Code (o entorno equivalente).
> Versión 0.1 · 14 may 2026

---

## 1 · Contexto del proyecto

- **Cliente:** InKuba Tatto & Art Studio
- **Tipo de página:** Coming soon (1 sola página, ~2 viewports verticales)
- **Idioma:** Español únicamente
- **Dispositivos:** Desktop y mobile importan por igual
- **Objetivo principal:** Mostrar **presencia de marca** mientras se construye el sitio definitivo
- **Datos clave:**
  - Estudio privado de tatuajes en Rauch 3974, CABA (Caballito-Almagro)
  - Artistas: **Armi** (fundador) y **Lyvan**
  - Especialización: realismo, blackwork, mangas alegóricas de gran formato
  - 4.9★ Google (41 reseñas), 5.668 seguidores en IG
  - Instagram: `@inkuba_tattoo_studio`
  - WhatsApp: `+54 11 33328666`

---

## 2 · Dirección visual elegida

**Cinema Scroll** — una página con dos viewports apilados, fondo negro absoluto, fotografía como protagonista.

```
┌────────────────────────────────────┐
│                                    │
│         VIEWPORT 1 — HERO          │  ← póster cinematográfico
│   (1 foto + INKUBA + claim + CTAs) │
│                                    │
├────────────────────────────────────┤
│                                    │
│      VIEWPORT 2 — GALERÍA          │  ← cinema scroll horizontal
│   (1 foto destacada a la vez,      │
│    fotos vecinas asomadas, scrub)  │
│                                    │
└────────────────────────────────────┘
```

---

## 3 · Estructura de la página

### 3.1 · Viewport 1 — Hero

**Layout:** full-bleed. Una foto domina todo. Contenido superpuesto.

| Posición | Contenido |
|---|---|
| Top-left | Logo INKUBA (subtítulo "tatto & art") |
| Top-right | `RAUCH 3974 · CABA` (tracking 2px, opacity 0.7) |
| Centro vertical | `muy pronto` (handwritten, animado · ver §4.1) + **INKUBA** (display serif, ~150px desktop / ~60px mobile) + claim `ARTE · TÉCNICA · CRITERIO` |
| Bottom-left | `POR / Armi · Lyvan` |
| Bottom-right | Botones Instagram + WhatsApp |
| Bottom-center | Pista sutil `scroll ↓` (opacity 0.45) |

### 3.2 · Viewport 2 — Galería (Cinema Scroll)

**Layout:** una pieza destacada centrada (proporción 8:11 vertical), 2 vecinas a cada lado con opacidad reducida (0.55 cercanas, 0.25 lejanas) — efecto coverflow.

| Elemento | Spec |
|---|---|
| Foto destacada | 480px ancho desktop (~36% del ancho), proporción 8:11 |
| Vecinas | 320px ancho, opacity escalonada (0.55 → 0.25) |
| Flechas nav | `‹` / `›` laterales, opacity 0.4 |
| Counter | `03 / 30` debajo de la foto destacada |
| Scrub bar | barra horizontal sutil debajo del counter |
| Caption | bajo la foto destacada: `MANGA ALEGÓRICA · ARMI · 14 SESIONES` |

**Interacción principal:** ver §4.2 (pin-and-scrub).

---

## 4 · Interacciones a implementar

### 4.1 · Interacción #03 — «muy pronto» trazado a mano

> Refuerza el ángulo artesanal (vs corporativo). El trazo es metáfora de la aguja entrando en la piel.

| Aspecto | Spec |
|---|---|
| **Elemento** | El texto "muy pronto" del hero, sobre la foto dominante |
| **Trigger** | Al cargar la página (después de que la foto del hero haga fade-in) |
| **Comportamiento** | El texto se dibuja con SVG `stroke-dasharray` + `stroke-dashoffset` animado, como si lo escribieran en tiempo real |
| **Duración** | 4.5s (3s de trazo + 1s mantener + 0.5s fade) |
| **Loop** | Sí, cada ~10s (después de quedar visible un rato) |
| **Easing** | `ease-in-out` |
| **Color** | `#f4f1ec` |
| **Fallback** | Si `prefers-reduced-motion`, mostrar el texto estático sin animar |

**Approach técnico:**
- Hacer "muy pronto" como **SVG path** (no fuente). Sugerencia: trazar a mano en Figma con Pen tool sobre Caveat 80px como referencia, exportar como SVG.
- Animar `stroke-dashoffset` con CSS keyframes (no requiere librería).

```css
@keyframes draw-mp {
  0%   { stroke-dashoffset: 1800; opacity: 1 }
  60%  { stroke-dashoffset: 0;    opacity: 1 }
  90%  { stroke-dashoffset: 0;    opacity: 1 }
  100% { stroke-dashoffset: 0;    opacity: 0 }
}
```

---

### 4.2 · Interacción #04 — Pin-and-scrub (signature)

> Convierte el scroll en una experiencia narrada. El usuario no se pierde fotos: las consume una por una a su ritmo.

| Aspecto | Spec |
|---|---|
| **Elemento** | La sección galería (viewport 2) |
| **Trigger** | Cuando la sección galería llega al top del viewport |
| **Comportamiento** | La sección se "pinea" (position fija). El scroll vertical del usuario se traduce en avance horizontal de las fotos. Cuando se han mostrado las N fotos (ej. 30), la sección se "des-pinea" y el scroll continúa normal hacia el footer |
| **Duración total del pin** | `30 fotos × 60vh` ≈ 18 viewports de scroll. Probar y ajustar |
| **Avance entre fotos** | suave, con interpolación · cada foto debería estar visible ~0.6 viewports de scroll |
| **Mobile** | Reemplazar por **scroll horizontal nativo** con snap (`scroll-snap-type: x mandatory`). El pin-and-scrub en mobile es problemático para UX y accesibilidad |
| **Fallback** | Si `prefers-reduced-motion`, usar grid vertical simple (sin pin) |

**Approach técnico:**

**Opción A · GSAP ScrollTrigger** (recomendado para esta interacción):
```js
gsap.to(".cinema-track", {
  x: () => -(scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: ".cinema-section",
    pin: true,
    scrub: 0.5,
    end: () => `+=${scrollWidth - window.innerWidth}`,
  }
});
```
- Librería: `gsap@3.12.x` + `gsap/ScrollTrigger` (~70kb min+gzip).

**Opción B · vanilla con `position: sticky`** (sin dependencia):
- Wrapper alto (ej. `height: 600vh`)
- Inner con `position: sticky; top: 0; height: 100vh`
- Listener de scroll calcula progreso y aplica `transform: translateX()` al track de fotos.
- Más liviano pero más laborioso. Si querés evitar GSAP, esta es la vía.

---

### 4.3 · Interacción #09 — «Avisame cuando abra» sticky

> La única forma de convertir esta coming soon en algo útil además de presencia: una lista de gente esperando que avises del lanzamiento.

| Aspecto | Spec |
|---|---|
| **Elemento** | Botón pill flotante, fixed bottom-right |
| **Trigger** | El usuario hizo scroll más allá del hero (`scrollY > window.innerHeight × 0.5`) |
| **Aparición** | Slide-up desde fuera + fade-in. 0.4s, easing `cubic-bezier(.2,.7,.3,1)` |
| **Estilo** | Pill blanco `#fff`, texto negro `#0a0a0a`, sombra `0 8px 24px rgba(0,0,0,0.5)` · Texto: `AVISAME CUANDO ABRA →` (letter-spacing 2px, uppercase, 11px) |
| **Mobile** | Igual, pero respetar safe area bottom (`env(safe-area-inset-bottom)`) |
| **Click** | Abre modal con un input: email **o** WhatsApp (1 solo campo, ambos válidos). Botón "Avisame". Tras submit → confirmación + cerrar |
| **Backend** | A definir. Opciones simples: Formspree, Netlify Forms, Google Forms embebido. **Recomendado:** un endpoint propio que escriba a una Google Sheet o Airtable |
| **Storage local** | Una vez que el usuario se anotó, guardar `inkuba_subscribed=true` en localStorage para no volver a mostrar el modal en visitas futuras |

**Approach técnico:**
- Detección con `IntersectionObserver` sobre un sentinela al final del hero (más performante que listener de scroll).
- Modal: dialog `<dialog>` HTML nativo o un componente custom. Backdrop con `backdrop-filter: blur(8px)`.

---

## 5 · Sistema visual

### 5.1 · Tipografía

| Uso | Familia | Peso | Notas |
|---|---|---|---|
| Display (INKUBA, titulares) | **Cormorant Garamond** | 500 / 700 | Italic disponible para acentos. Alternativa: Playfair Display |
| UI / cuerpo | **Inter Tight** | 400 / 500 / 600 | Para CTAs, captions, metadata |
| Handwritten ("muy pronto") | **Caveat** | 600 | Sólo para este uso. SVG path en versión final |
| Mono (counters, "01/30") | **JetBrains Mono** | 400 / 500 | Solo para metadata técnica |

**Excepciones:**
- Evitar Inter "a secas", Roboto, system fonts en titulares (anti-tropo).
- No usar Bebas Neue, Oswald — sobre-usadas.

### 5.1.bis · Wordmark provisional (sin logo definitivo)

> Mientras no exista el logo final de InKuba, el wordmark se compone tipográficamente. Lo que viste en el wireframe del hero usaba `font-family: serif` (default del navegador, típicamente Times New Roman). Para evitar inconsistencias entre sistemas operativos, **fijar a Cormorant Garamond vía Google Fonts**.

**Import:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&display=swap" rel="stylesheet">
```

#### Variante A · Wordmark hero (centerpiece grande)

> El "INKUBA" gigante del centro del primer viewport.

| Propiedad | Desktop | Mobile | Notas |
|---|---|---|---|
| `font-family` | `"Cormorant Garamond", "Times New Roman", serif` | idem | Fallback Times consistente con lo del wireframe |
| `font-size` | `150px` | `60px` | Tablet `~100px` (clamp recomendado) |
| `font-weight` | `700` | `700` | Bold |
| `letter-spacing` | `14px` | `5px` | ~9.3% del font-size |
| `line-height` | `1` | `1` | |
| `text-transform` | `uppercase` (ya en source) | idem | |
| `color` | `#f4f1ec` | idem | |
| `text-rendering` | `optimizeLegibility` | idem | |

**CSS sugerido (con `clamp` para que escale fluido):**
```css
.wordmark-hero {
  font-family: "Cormorant Garamond", "Times New Roman", serif;
  font-size: clamp(60px, 11vw, 150px);
  font-weight: 700;
  letter-spacing: clamp(5px, 1vw, 14px);
  line-height: 1;
  color: #f4f1ec;
  text-rendering: optimizeLegibility;
  /* sutilísimo glow opcional sobre la foto para mejorar legibilidad */
  text-shadow: 0 2px 24px rgba(0,0,0,0.5);
}
```

#### Variante B · Wordmark navegación (top-left chico)

> El "INKUBA tatto&art" pequeñito en el top-left de hero, galería y footer.

Compuesto por dos partes en una misma línea:

```html
<span class="wordmark-nav">
  INKUBA<span class="wordmark-nav__sub">tatto&amp;art</span>
</span>
```

| Propiedad | Parte principal `INKUBA` | Sub `tatto&art` |
|---|---|---|
| `font-family` | `"Cormorant Garamond", serif` | idem |
| `font-size` (desktop) | `18px` | `8px` |
| `font-size` (mobile) | `13px` | `6px` |
| `font-weight` | `600` | `600` |
| `letter-spacing` | `~3.2px` (= 0.18× size) | `1px` |
| `text-transform` | `uppercase` | `uppercase` |
| `color` | `#f4f1ec` | `#f4f1ec` |
| `opacity` | `1` | `0.5` |
| Spacing entre partes | — | `margin-left: 4px` |
| Alineación vertical sub | — | `vertical-align: baseline` (queda en baseline) o `text-bottom` si se prefiere alinear al pie |

**CSS sugerido:**
```css
.wordmark-nav {
  font-family: "Cormorant Garamond", "Times New Roman", serif;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 3.2px;
  color: #f4f1ec;
  text-transform: uppercase;
  white-space: nowrap;
}
.wordmark-nav__sub {
  font-size: 8px;
  letter-spacing: 1px;
  opacity: 0.5;
  margin-left: 4px;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .wordmark-nav      { font-size: 13px; letter-spacing: 2.3px; }
  .wordmark-nav__sub { font-size: 6px;  letter-spacing: 0.8px; }
}
```

#### Por qué Cormorant Garamond

- **Editorial / clásica** — refuerza la gravitas del tatuaje como arte permanente, no como producto rápido.
- **Italic precioso** — útil cuando el sitio definitivo necesite acentos en titulares.
- **Familia amplia** (300 → 700) — escala bien de wordmark a body.
- **Gratuita en Google Fonts**.
- **Contraste con el handwritten** "muy pronto" (Caveat) — clásico + a mano = la dupla que comunica oficio.

#### Alternativas válidas (si Cormorant no convence)

| Familia | Carácter | Cuándo |
|---|---|---|
| **Playfair Display** | Más dramática, contraste alto entre trazos | Si querés más teatralidad |
| **EB Garamond** | Más sobria, libresca | Si querés bajar volumen |
| **Cardo** | Académica, más estrecha | Si querés densidad |
| **Times New Roman** (system) | Lo que ves hoy en el wireframe | Si querés cero dependencias |

#### Cuando llegue el logo real

Reemplazar **ambas variantes** (hero + nav) por el SVG del logo. Hasta entonces, este wordmark tipográfico es production-ready: usalo sin culpa.

### 5.2 · Paleta

| Token | Valor | Uso |
|---|---|---|
| `--ink-black` | `#050505` | Fondo principal |
| `--ink-near-black` | `#0a0a0a` | Cards, modales |
| `--ink-paper` | `#f4f1ec` | Texto principal (no `#ffffff` puro — se siente cálido) |
| `--ink-line` | `rgba(255,255,255,0.12)` | Bordes sutiles |
| `--ink-muted` | `rgba(255,255,255,0.55)` | Texto secundario |
| `--ink-faint` | `rgba(255,255,255,0.35)` | Captions, metadata |

**Importante:** **no** usar gradientes coloridos. El acento, si es necesario, viene del color natural de las fotos.

### 5.3 · Espaciado y tamaños

- Grid base: **8px**
- Padding lateral página: `8%` desktop / `24px` mobile
- Gaps de grid: `20-32px`
- Tipografías mínimas:
  - Mobile body: 14px
  - Desktop body: 15px
  - Captions: 11–12px

### 5.4 · Bordes y radios

- Radios: **2–4px** máximo. La estética es editorial/foto, no app moderna con cards redondeadas.
- Bordes: **1px** sólidos sobre `rgba(255,255,255,0.08-0.15)`.

---

## 6 · Contenido obligatorio

| Tipo | Contenido |
|---|---|
| Logo | `INKUBA` con subtítulo `tatto & art` |
| Claim | `ARTE · TÉCNICA · CRITERIO` |
| Anuncio | `muy pronto` (no usar countdown — fecha indefinida) |
| Artistas | `Armi · Lyvan` |
| Dirección | `Rauch 3974 · CABA` |
| Instagram | `@inkuba_tattoo_studio` → link a `https://instagram.com/inkuba_tattoo_studio` |
| WhatsApp | `+54 11 33328666` → link `https://wa.me/541133328666` |

---

## 7 · Assets que vas a tener que proveer

- [ ] **Logo** InKuba (SVG preferido, o PNG transparente alta resolución)
- [ ] **Foto del hero** (1 sola, la más impactante, formato vertical u horizontal según se elija) — alta resolución, retocada
- [ ] **30 fotos verticales** para la galería · **800 × 1100 px** · ya retocadas en Photoshop
- [ ] (opcional) **SVG del "muy pronto" trazado a mano** — si no, se hace en implementación
- [ ] (opcional) **Favicon** y **OG image** para compartir en redes

**Nota sobre las fotos:**
- Idealmente exportar también versiones **WebP** (50–70% menos peso) para performance.
- Sugerido: 3 tamaños — `400w`, `800w`, `1200w` — para `srcset` responsivo.

---

## 8 · Stack recomendado

**Mínimo viable (vanilla):**
- HTML + CSS + JS plano
- GSAP + ScrollTrigger (solo para #04 si se elige esa vía)
- Sin frameworks pesados — la página es chica

**Si se prefiere framework:**
- **Astro** — encaja perfecto para una landing estática con islas de interactividad
- **Next.js** App Router — overkill, pero si ya hay infra…
- **Evitar:** CRA, Vite + React puro sin razón

**Hosting:** Vercel, Netlify, Cloudflare Pages (todos free tier suficiente)

**Form backend (#09):** Formspree free tier (50 envíos/mes) o Web3Forms.

---

## 9 · Estructura de archivos sugerida

```
inkuba-coming-soon/
├── index.html
├── styles/
│   ├── tokens.css        # variables CSS
│   ├── base.css          # reset + tipografía
│   ├── hero.css
│   ├── gallery.css
│   └── sticky-cta.css
├── scripts/
│   ├── stroke-in.js      # interacción #03
│   ├── pin-scrub.js      # interacción #04
│   └── sticky-cta.js     # interacción #09
├── assets/
│   ├── logo.svg
│   ├── muy-pronto.svg
│   ├── photos/
│   │   ├── hero.webp
│   │   ├── 01.webp ... 30.webp
│   │   └── 01@2x.webp ... (si usás srcset)
│   └── favicon.svg
└── README.md
```

---

## 10 · Notas de performance

- **Lazy-load** todas las fotos de la galería excepto las primeras 3.
- **`<link rel="preload">`** la foto del hero — es la única crítica.
- **`<picture>` + WebP** con fallback JPG para Safari viejo.
- Lighthouse target: **Performance ≥ 90, Accessibility 100, SEO 100**.

## 11 · Accesibilidad

- `prefers-reduced-motion`: deshabilitar las 3 interacciones, fallback a estados estáticos.
- Foto del hero con `alt` descriptivo. Galería con `alt` por pieza si es posible.
- Contraste: texto `#f4f1ec` sobre `#050505` = ratio 18.5 (AAA).
- Foco visible en CTAs (no remover outline sin reemplazarlo).
- Botones IG/WA y "avisame" con `aria-label` claros.

## 12 · SEO básico

```html
<title>InKuba · Tatto & Art Studio · Próximamente</title>
<meta name="description" content="Estudio privado de tatuajes en Buenos Aires. Realismo, blackwork y mangas alegóricas. Armi · Lyvan · Rauch 3974, CABA.">
<meta property="og:title" content="InKuba · Muy pronto">
<meta property="og:image" content="/assets/og.jpg">
<meta property="og:type" content="website">
<link rel="canonical" href="https://inkuba.ar/">
```

---

## 13 · Decisiones descartadas (explícitas)

Para evitar revisitar discusiones cerradas:

- ❌ **No countdown** — la fecha de lanzamiento es indefinida.
- ❌ **No captura de email obligatoria** — la captura va por el sticky CTA opcional (#09), no es un gate.
- ❌ **No Healed vs Fresh slider** (interacción #05) — no hay aún fotos de cicatrización pareadas. Queda pendiente para iteración 2.
- ❌ **No Ken Burns / mouse-tilt / film grain / custom cursor / ink-scroll** (interacciones #01, #02, #06, #07, #08) — quedan como pool para iteración 2.
- ❌ **No multi-idioma** — solo español.
- ❌ **No videos** — solo fotografía estática.

---

## 14 · Próximos pasos

1. **Subir assets** (logo + las 30 fotos retocadas).
2. **Decidir backend del form** (#09): Formspree es lo más rápido para empezar.
3. **Implementar** siguiendo este spec.
4. **QA en mobile real** — la #04 requiere fallback de scroll horizontal.
5. **Deploy** y conectar dominio.

---

*Documento producido a partir del proceso de wireframes y la propuesta de interacciones para InKuba. Cualquier cambio mayor amerita una nueva versión del spec.*
