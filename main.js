/* INKD Studio — shared page behavior (links, gallery, menu) */
(function () {
  var C = window.INKD_CONFIG || {};
  var isSet = function (v) { return v && String(v).indexOf('PASTE_') !== 0; };
  var digits = String(C.PHONE || '').replace(/\D/g, '');

  document.querySelectorAll('[data-link]').forEach(function (a) {
    var kind = a.getAttribute('data-link');
    if (kind === 'inquiry') {
      if (isSet(C.INQUIRY_FORM_URL)) { a.href = C.INQUIRY_FORM_URL; a.target = '_blank'; a.rel = 'noopener'; }
      else { a.href = 'sms:' + digits; }
    }
    if (kind === 'sms') a.href = 'sms:' + digits;
    if (kind === 'photos') {
      if (isSet(C.PHOTO_UPLOAD_URL)) { a.href = C.PHOTO_UPLOAD_URL; a.target = '_blank'; a.rel = 'noopener'; }
      else a.classList.add('hide');
    }
    if (kind === 'instagram' && isSet(C.INSTAGRAM_URL)) { a.href = C.INSTAGRAM_URL; a.target = '_blank'; a.classList.remove('hide'); }
    if (kind === 'tiktok' && isSet(C.TIKTOK_URL)) { a.href = C.TIKTOK_URL; a.target = '_blank'; a.classList.remove('hide'); }
  });

  document.querySelectorAll('[data-handle]').forEach(function (el) { el.textContent = C.HANDLE || ''; });
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
  }

  // Gallery
  var items = Array.isArray(C.GALLERY) ? C.GALLERY.filter(function (g) { return g && g.src; }) : [];
  var section = document.getElementById('work');
  var grid = document.getElementById('gallery');
  if (section && grid) {
    if (!items.length) {
      document.querySelectorAll('[data-needs-gallery]').forEach(function (el) { el.classList.add('hide'); });
    } else {
      section.classList.remove('hide');
      items.forEach(function (g) {
        var fig = document.createElement('figure');
        var img = document.createElement('img');
        img.src = g.src; img.alt = g.title || 'Tattoo by INKD Studio'; img.loading = 'lazy';
        fig.appendChild(img);
        if (g.healed) { var t = document.createElement('span'); t.className = 'tag-healed'; t.textContent = 'Healed'; fig.appendChild(t); }
        if (g.title || g.detail) {
          var cap = document.createElement('figcaption');
          if (g.title) { var b = document.createElement('b'); b.textContent = g.title; cap.appendChild(b); }
          if (g.detail) { var s = document.createElement('span'); s.textContent = g.detail; cap.appendChild(s); }
          fig.appendChild(cap);
        }
        fig.addEventListener('click', function () { openLightbox(g.src, img.alt); });
        grid.appendChild(fig);
      });
    }
  }

  var lb = document.getElementById('lightbox');
  function openLightbox(src, alt) {
    if (!lb) return;
    var im = lb.querySelector('img'); im.src = src; im.alt = alt; lb.classList.add('open');
  }
  if (lb) {
    lb.addEventListener('click', function () { lb.classList.remove('open'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('open'); });
  }
})();
