/* ============================================================
   PADEL — общий скрипт
   1) Кнопка поддержки в подвале: плавная смена иконки и надписи
      и фиксированная ширина по самой широкой фразе (как на референсе).
   2) Видео-карточки: YouTube-iframe создаётся только по клику,
      чтобы страница не тянула плееры при загрузке.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 1. Кнопка поддержки ---------- */

  var btn = document.getElementById('supportBtn');
  var icon = document.getElementById('supportIcon');
  var label = document.getElementById('supportLabel');

  if (btn && icon && label) {
    var phrases = [
      { icon: '❤️', text: 'Сказать спасибо' },
      { icon: '☕', text: 'Угостить кофе' }
    ];
    var FADE_MS = 300;
    var INTERVAL_MS = 3000;
    var current = 0;
    var animating = false;

    // Ширина кнопки = самая широкая из фраз, чтобы при смене текста
    // кнопка не «дёргалась». Считаем по невидимым слепкам.
    var fitWidth = function () {
      var probe = document.createElement('span');
      probe.style.cssText =
        'position:absolute;left:-9999px;top:-9999px;visibility:hidden;' +
        'display:inline-flex;align-items:center;gap:7px;' +
        'white-space:nowrap;pointer-events:none;';
      probe.className = 'support-btn';
      probe.style.minWidth = '0';
      probe.style.transform = 'none';
      probe.style.boxShadow = 'none';

      var max = 0;
      phrases.forEach(function (item) {
        probe.innerHTML =
          '<span>' + item.icon + '</span><span>' + item.text + '</span>';
        document.body.appendChild(probe);
        // offsetWidth включает паддинги и рамку, вычитаем рамку (2px),
        // чтобы min-width по content-box совпал с реальной шириной
        max = Math.max(max, probe.offsetWidth - 2);
        probe.remove();
      });

      if (max > 0) btn.style.minWidth = max + 'px';
    };

    fitWidth();
    window.addEventListener('resize', fitWidth);
    window.addEventListener('load', fitWidth);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(fitWidth);
    }

    var reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!reduceMotion) {
      setInterval(function () {
        if (animating) return;
        animating = true;

        icon.classList.add('is-fading');
        label.classList.add('is-fading');

        setTimeout(function () {
          current = (current + 1) % phrases.length;
          icon.textContent = phrases[current].icon;
          label.textContent = phrases[current].text;
          icon.classList.remove('is-fading');
          label.classList.remove('is-fading');
          animating = false;
        }, FADE_MS);
      }, INTERVAL_MS);
    }
  }

  /* ---------- 2. Ленивое YouTube-видео ---------- */

  var frames = document.querySelectorAll('.video-frame[data-video]');

  Array.prototype.forEach.call(frames, function (frame) {
    frame.addEventListener('click', function () {
      var id = frame.getAttribute('data-video');
      var title =
        frame.getAttribute('data-title') || 'Обучающее видео о паделе';
      if (!id || frame.querySelector('iframe')) return;

      var iframe = document.createElement('iframe');
      iframe.src =
        'https://www.youtube-nocookie.com/embed/' +
        encodeURIComponent(id) +
        '?autoplay=1&rel=0';
      iframe.title = title;
      iframe.loading = 'lazy';
      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; ' +
        'gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;

      frame.innerHTML = '';
      frame.appendChild(iframe);
      frame.setAttribute('aria-label', title);
    });
  });
})();
