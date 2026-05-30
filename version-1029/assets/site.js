(function() {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function() {
      menu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const next = hero.querySelector('[data-hero-next]');
    const prev = hero.querySelector('[data-hero-prev]');
    let current = 0;
    let timer = null;

    const showSlide = function(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const startTimer = function() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    };

    if (next) {
      next.addEventListener('click', function() {
        showSlide(current + 1);
        startTimer();
      });
    }

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(current - 1);
        startTimer();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    startTimer();
  }

  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  const panel = document.querySelector('[data-search-panel]');

  if (form && input && panel && Array.isArray(window.MOVIE_SEARCH_DATA)) {
    const closePanel = function() {
      panel.classList.remove('is-open');
      panel.innerHTML = '';
    };

    const renderResults = function(query) {
      const keyword = query.trim().toLowerCase();
      if (!keyword) {
        closePanel();
        return [];
      }

      const results = window.MOVIE_SEARCH_DATA.filter(function(item) {
        return item.searchText.includes(keyword);
      }).slice(0, 8);

      panel.innerHTML = '';

      results.forEach(function(item) {
        const link = document.createElement('a');
        link.className = 'search-result';
        link.href = item.url;

        const image = document.createElement('img');
        image.src = item.cover;
        image.alt = item.title;
        image.loading = 'lazy';

        const text = document.createElement('span');
        const title = document.createElement('strong');
        title.textContent = item.title;
        const meta = document.createElement('span');
        meta.textContent = item.region + ' · ' + item.year + ' · ' + item.type;

        text.appendChild(title);
        text.appendChild(meta);
        link.appendChild(image);
        link.appendChild(text);
        panel.appendChild(link);
      });

      panel.classList.toggle('is-open', results.length > 0);
      return results;
    };

    input.addEventListener('input', function() {
      renderResults(input.value);
    });

    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const results = renderResults(input.value);
      if (results.length > 0) {
        window.location.href = results[0].url;
      }
    });

    document.addEventListener('click', function(event) {
      if (!form.contains(event.target)) {
        closePanel();
      }
    });
  }

  const cardSearch = document.querySelector('[data-card-search]');
  const typeFilter = document.querySelector('[data-type-filter]');
  const cardList = document.querySelector('[data-card-list]');

  if (cardList && (cardSearch || typeFilter)) {
    const cards = Array.from(cardList.querySelectorAll('.movie-card'));
    const applyFilters = function() {
      const keyword = cardSearch ? cardSearch.value.trim().toLowerCase() : '';
      const type = typeFilter ? typeFilter.value : '';

      cards.forEach(function(card) {
        const haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        const cardType = card.getAttribute('data-type') || '';
        const matchedText = !keyword || haystack.includes(keyword);
        const matchedType = !type || cardType === type;
        card.classList.toggle('is-hidden', !(matchedText && matchedType));
      });
    };

    if (cardSearch) {
      cardSearch.addEventListener('input', applyFilters);
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilters);
    }
  }
})();

function initMoviePlayer(videoUrl) {
  const video = document.getElementById('movieVideo');
  const button = document.getElementById('playButton');
  const frame = document.getElementById('playerFrame');
  let attached = false;

  if (!video || !button || !frame || !videoUrl) {
    return;
  }

  const attach = function() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
    } else {
      video.src = videoUrl;
    }
  };

  const start = function() {
    attach();
    frame.classList.add('is-playing');
    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function() {});
    }
  };

  button.addEventListener('click', start);
  video.addEventListener('click', function() {
    if (!attached) {
      start();
    }
  });
}
