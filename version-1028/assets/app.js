(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 6000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  var globalSearch = document.getElementById('globalSearch');
  var searchPanel = document.getElementById('searchPanel');
  var searchIndex = window.MOVIE_SEARCH_INDEX || [];

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function renderSearchResults(query) {
    if (!globalSearch || !searchPanel) {
      return;
    }

    var term = normalize(query);
    if (term.length < 1) {
      searchPanel.hidden = true;
      searchPanel.innerHTML = '';
      return;
    }

    var results = searchIndex.filter(function (item) {
      return normalize(item.title + ' ' + item.region + ' ' + item.year + ' ' + item.genre + ' ' + item.type + ' ' + item.tags).indexOf(term) !== -1;
    }).slice(0, 12);

    if (!results.length) {
      searchPanel.hidden = false;
      searchPanel.innerHTML = '<div class="search-result"><span class="rank-info"><strong>暂无匹配内容</strong><span>换一个关键词试试</span></span></div>';
      return;
    }

    searchPanel.hidden = false;
    searchPanel.innerHTML = results.map(function (item) {
      return [
        '<a class="search-result" href="./' + item.url + '">',
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">',
        '<span><strong>' + item.title + '</strong><span>' + item.region + ' · ' + item.year + ' · ' + item.genre + '</span></span>',
        '</a>'
      ].join('');
    }).join('');
  }

  if (globalSearch && searchPanel) {
    globalSearch.addEventListener('input', function () {
      renderSearchResults(globalSearch.value);
    });

    document.addEventListener('click', function (event) {
      if (!searchPanel.contains(event.target) && event.target !== globalSearch) {
        searchPanel.hidden = true;
      }
    });
  }

  var librarySearch = document.querySelector('.library-search');
  var libraryFilter = document.querySelector('.library-filter');
  var libraryCards = Array.prototype.slice.call(document.querySelectorAll('.library-grid [data-card]'));

  function applyLibraryFilter() {
    var term = normalize(librarySearch && librarySearch.value);
    var year = libraryFilter && libraryFilter.value;

    libraryCards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-type')
      ].join(' '));
      var matchedTerm = !term || text.indexOf(term) !== -1;
      var matchedYear = !year || card.getAttribute('data-year') === year;
      card.classList.toggle('hidden-card', !(matchedTerm && matchedYear));
    });
  }

  if (librarySearch) {
    librarySearch.addEventListener('input', applyLibraryFilter);
  }

  if (libraryFilter) {
    libraryFilter.addEventListener('change', applyLibraryFilter);
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var source = player.getAttribute('data-video');
    var hlsInstance = null;
    var attached = false;

    function attachSource() {
      if (!video || !source || attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            player.classList.add('player-error');
          }
        });
      } else {
        player.classList.add('player-error');
      }
    }

    function playVideo() {
      attachSource();
      if (!video || player.classList.contains('player-error')) {
        return;
      }
      video.controls = true;
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          if (overlay) {
            overlay.classList.remove('hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!attached || video.paused) {
          playVideo();
        }
      });

      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
