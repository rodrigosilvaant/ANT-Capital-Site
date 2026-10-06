/* ANT Capital — Blog: comportamento compartilhado */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Formigas no fundo (mais discretas nas páginas de artigo) */
  var canvas = document.getElementById('ants');
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var isPost = document.body.getAttribute('data-page') === 'post';
    var W, H;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    var N = isPost ? 14 : 24;
    var dim = isPost ? 0.5 : 1;
    var ants = [];
    for (var i = 0; i < N; i++) {
      ants.push({
        x: Math.random() * W, y: Math.random() * H,
        angle: Math.random() * Math.PI * 2,
        speed: 0.35 + Math.random() * 0.5,
        turn: 0.04 + Math.random() * 0.06,
        trail: [], trailMax: 50 + Math.floor(Math.random() * 35),
        size: 1 + Math.random() * 1.1,
        alpha: (0.16 + Math.random() * 0.2) * dim
      });
    }
    (function step() {
      ctx.clearRect(0, 0, W, H);
      ants.forEach(function (a) {
        a.angle += (Math.random() - 0.5) * a.turn * 2;
        a.x += Math.cos(a.angle) * a.speed;
        a.y += Math.sin(a.angle) * a.speed;
        if (a.x < 0) a.x = W; if (a.x > W) a.x = 0;
        if (a.y < 0) a.y = H; if (a.y > H) a.y = 0;
        a.trail.push({ x: a.x, y: a.y });
        if (a.trail.length > a.trailMax) a.trail.shift();
        if (a.trail.length < 2) return;
        for (var k = 1; k < a.trail.length; k++) {
          if (Math.abs(a.trail[k].x - a.trail[k - 1].x) > 50 || Math.abs(a.trail[k].y - a.trail[k - 1].y) > 50) { a.trail = a.trail.slice(k); break; }
        }
        if (a.trail.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(a.trail[0].x, a.trail[0].y);
        for (var j = 1; j < a.trail.length; j++) ctx.lineTo(a.trail[j].x, a.trail[j].y);
        var t0 = a.trail[0], t1 = a.trail[a.trail.length - 1];
        var g = ctx.createLinearGradient(t0.x, t0.y, t1.x, t1.y);
        g.addColorStop(0, 'rgba(47,203,138,0)');
        g.addColorStop(1, 'rgba(47,203,138,' + a.alpha + ')');
        ctx.strokeStyle = g; ctx.lineWidth = a.size; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
        ctx.beginPath(); ctx.arc(a.x, a.y, a.size * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(47,203,138,' + (a.alpha + 0.12) + ')'; ctx.fill();
      });
      requestAnimationFrame(step);
    })();
  }

  /* Menu mobile */
  var burger = document.getElementById('hamburger');
  var menu = document.getElementById('mobileMenu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); document.body.style.overflow = ''; });
    });
  }

  /* Revelação ao rolar */
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('visible'); });
  }

  /* Filtro por categoria (página de listagem) */
  var filters = document.querySelectorAll('.filter');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-cat');
      filters.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      document.querySelectorAll('.post-card').forEach(function (card) {
        card.hidden = !(cat === 'todos' || card.getAttribute('data-cat') === cat);
      });
    });
  });

  /* Sumário automático do artigo */
  var toc = document.getElementById('toc');
  var heads = document.querySelectorAll('.article h2[id]');
  if (toc && heads.length) {
    heads.forEach(function (h) {
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      toc.appendChild(a);
    });
    if ('IntersectionObserver' in window) {
      var links = toc.querySelectorAll('a');
      var hio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            links.forEach(function (l) { l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id); });
          }
        });
      }, { rootMargin: '0px 0px -70% 0px' });
      heads.forEach(function (h) { hio.observe(h); });
    }
  }

  /* Compartilhar */
  var url = window.location.href.split('#')[0];
  var title = document.title;
  document.querySelectorAll('[data-share="whatsapp"]').forEach(function (a) {
    a.href = 'https://wa.me/?text=' + encodeURIComponent(title + ' — ' + url);
  });
  document.querySelectorAll('[data-share="linkedin"]').forEach(function (a) {
    a.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
  });
  document.querySelectorAll('[data-share="copy"]').forEach(function (b) {
    b.addEventListener('click', function () {
      var done = function () { var t = b.querySelector('span'); var old = t.textContent; t.textContent = 'Link copiado!'; setTimeout(function () { t.textContent = old; }, 1800); };
      if (navigator.clipboard) { navigator.clipboard.writeText(url).then(done, done); } else { done(); }
    });
  });
})();
