# InKuba · Coming Soon · Pendientes pre-producción

> Checklist de tareas antes de lanzar. Trabajar en orden de prioridad.

---

## 🔴 Crítico (bloquea producción)

- [ ] **Probar form en real** — mandar un submit de prueba y confirmar que llega el email a la cuenta Web3Forms (`d7274279-6e1b-4011-a966-84647b68d8c4`)
- [ ] **OG image** — crear/exportar `assets/og.jpg` (1200×630px). Está referenciado en el `<head>` pero no existe; sin esto el link no previsualiza en WhatsApp/redes
- [ ] **QA mobile real** — cargar en teléfono físico y verificar: hero-mobile, galería, sticky CTA con safe area, modal

---

## 🟡 Importante (antes de compartir el link)

- [ ] **Deploy** — subir el proyecto a Vercel o Netlify y verificar que todos los assets cargan sin 404s
- [ ] **Dominio** — apuntar `inkuba.ar` al hosting una vez deployado
- [ ] **Lighthouse audit** — correr desde Chrome DevTools. Targets: Performance ≥ 90 · Accesibilidad 100 · SEO 100

---

## 🟢 Nice to have (puede ir después del lanzamiento)

- [ ] **Favicon definitivo** — reemplazar `assets/favicon.svg` por el logo final cuando esté disponible
- [ ] **Git** — commitear todos los cambios de la última sesión: Web3Forms key, imágenes WebP, fix modal `[hidden]`
- [ ] **Limpiar galería** — hay archivos `01b.jpg`, `03b.jpg`, `04b.jpg`, `05b.jpg`, `06b.jpg`, `07b.jpg`, `09b.jpg`, `80b.jpg` en `assets/galery/` que no están en el HTML; definir si se usan o eliminar para no subir peso al repo

---

## ✅ Completado

- [x] Estructura HTML/CSS/JS de la página
- [x] Sistema visual: tipografías, paleta, espaciado
- [x] Hero con foto full-bleed + animación fade-in
- [x] "Muy pronto" con animación SVG stroke
- [x] Galería grid 4×2 con 8 piezas
- [x] Footer con datos de contacto
- [x] Sticky CTA "Quiero un tatuaje" con IntersectionObserver
- [x] Modal de contacto con validación email/WhatsApp
- [x] Fix bug modal (form y success visibles simultáneamente)
- [x] Web3Forms configurado (`access_key` en `sticky-cta.js`)
- [x] Imágenes galería convertidas a WebP (con fallback JPG)
- [x] Hero responsive: `hero.webp` desktop / `hero-mobile.webp` mobile
- [x] Preload hero apuntando a `.webp`
- [x] SEO básico: title, description, OG tags, canonical
