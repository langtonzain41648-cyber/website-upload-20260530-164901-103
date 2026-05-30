(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var button = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.nav-links');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var root = document.querySelector('.hero-carousel');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5800);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    start();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
      var input = panel.querySelector('.filter-input');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(document.querySelectorAll(panel.getAttribute('data-filter-panel')));
      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var cardType = card.getAttribute('data-type') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var match = (!q || haystack.indexOf(q) > -1) && (!typeValue || cardType === typeValue) && (!yearValue || cardYear === yearValue);
          card.style.display = match ? '' : 'none';
        });
      }
      [input, type, year].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });
    });
  }

  function setupPlayer() {
    Array.prototype.slice.call(document.querySelectorAll('video[data-src]')).forEach(function (video) {
      var src = video.getAttribute('data-src');
      var shell = video.closest('.player-shell');
      var button = shell ? shell.querySelector('.play-overlay') : null;
      var attached = false;
      function attach() {
        if (attached || !src) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }
      function play() {
        attach();
        if (button) {
          button.classList.add('is-hidden');
        }
        var result = video.play();
        if (result && result.catch) {
          result.catch(function () {});
        }
      }
      if (button) {
        button.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('click', function () {
        attach();
      }, { once: true });
    });
  }

  function safeText(value) {
    return String(value).replace(/[&<>\"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '\"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  function setupSearchPage() {
    var root = document.getElementById('searchResults');
    if (!root || !window.SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim().toLowerCase();
    var input = document.querySelector('input[name="q"]');
    if (input) {
      input.value = params.get('q') || '';
    }
    var data = window.SEARCH_DATA;
    var results = q ? data.filter(function (item) {
      return item.search.indexOf(q) > -1;
    }).slice(0, 120) : data.slice(0, 60);
    if (!results.length) {
      root.innerHTML = '<div class="empty-state">没有找到匹配的影片，可以尝试更短的关键词。</div>';
      return;
    }
    root.innerHTML = results.map(function (item) {
      return '<a class="search-result" href="./' + item.file + '">' +
        '<span class="mini-poster" style="--poster-img: url(\'./' + item.cover + '.jpg\')"></span>' +
        '<span class="rank-info"><h3>' + safeText(item.title) + '</h3><p>' + safeText(item.line) + '</p><span class="pill">' + safeText(item.year) + ' · ' + safeText(item.type) + '</span></span>' +
        '</a>';
    }).join('');
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
    setupSearchPage();
  });
})();
