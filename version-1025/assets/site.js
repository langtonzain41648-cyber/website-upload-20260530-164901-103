(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var menu = document.querySelector('.mobile-menu');

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var open = menu.hasAttribute('hidden');
        if (open) {
          menu.removeAttribute('hidden');
        } else {
          menu.setAttribute('hidden', '');
        }
        toggle.setAttribute('aria-expanded', String(open));
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var heroIndex = 0;
    var heroTimer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('is-active', current === heroIndex);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('is-active', current === heroIndex);
      });
    }

    function startHero() {
      if (slides.length < 2) {
        return;
      }
      clearInterval(heroTimer);
      heroTimer = setInterval(function () {
        showHero(heroIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-index') || 0);
        showHero(next);
        startHero();
      });
    });
    startHero();

    var heroSearch = document.querySelector('[data-hero-search]');
    if (heroSearch) {
      heroSearch.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = heroSearch.querySelector('input').value || '';
        var targetInput = document.querySelector('#home-library [data-search]');
        var target = document.querySelector('#home-library');
        if (targetInput) {
          targetInput.value = value;
          targetInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    document.querySelectorAll('[data-search]').forEach(function (input) {
      input.addEventListener('input', function () {
        var scope = document.querySelector(input.getAttribute('data-target')) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-item'));
        var value = normalize(input.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-category'),
            card.textContent
          ].join(' '));
          var matched = !value || text.indexOf(value) !== -1;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        var empty = scope.querySelector('.no-results');
        if (empty) {
          empty.hidden = visible !== 0;
        }
      });
    });

    document.querySelectorAll('[data-sort]').forEach(function (button) {
      button.addEventListener('click', function () {
        var grid = document.querySelector(button.getAttribute('data-grid'));
        if (!grid) {
          return;
        }
        var sortKey = button.getAttribute('data-sort');
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        cards.sort(function (a, b) {
          if (sortKey === 'title') {
            return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
          }
          var left = Number(a.getAttribute('data-' + sortKey) || 0);
          var right = Number(b.getAttribute('data-' + sortKey) || 0);
          return right - left;
        });
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
        var scope = button.closest('.content-section');
        if (scope) {
          scope.querySelectorAll('[data-sort]').forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
        }
      });
    });

    document.querySelectorAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var stream = shell.getAttribute('data-stream');
      var attached = false;
      var hlsInstance = null;

      function attach() {
        if (!video || !stream || attached) {
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function start() {
        if (!video) {
          return;
        }
        attach();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (!attached || video.paused) {
            start();
          }
        });
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        });
        video.addEventListener('emptied', function () {
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
            attached = false;
          }
        });
      }
    });
  });
})();
