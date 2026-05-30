(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  var timer = null;

  function setHero(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function nextHero() {
    setHero(current + 1);
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    stopHero();
    timer = window.setInterval(nextHero, 5200);
  }

  function stopHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  var nextButton = document.querySelector('.hero-next');
  var prevButton = document.querySelector('.hero-prev');

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      nextHero();
      startHero();
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      setHero(current - 1);
      startHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setHero(index);
      startHero();
    });
  });

  startHero();

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));
  var yearSelects = Array.prototype.slice.call(document.querySelectorAll('.movie-year-filter'));
  var typeSelects = Array.prototype.slice.call(document.querySelectorAll('.movie-type-filter'));
  var regionSelects = Array.prototype.slice.call(document.querySelectorAll('.movie-region-filter'));

  if (cards.length) {
    var years = Array.from(new Set(cards.map(function (card) {
      return card.dataset.year || '';
    }).filter(Boolean))).sort(function (a, b) {
      return Number(b) - Number(a);
    });
    var types = Array.from(new Set(cards.map(function (card) {
      return card.dataset.type || '';
    }).filter(Boolean))).sort();
    var regions = Array.from(new Set(cards.map(function (card) {
      return card.dataset.region || '';
    }).filter(Boolean))).sort();

    yearSelects.forEach(function (select) {
      fillSelect(select, years);
    });
    typeSelects.forEach(function (select) {
      fillSelect(select, types);
    });
    regionSelects.forEach(function (select) {
      fillSelect(select, regions);
    });
  }

  function activeValue(list) {
    for (var i = 0; i < list.length; i += 1) {
      if (list[i].value) {
        return list[i].value;
      }
    }
    return '';
  }

  function searchValue() {
    for (var i = 0; i < searchInputs.length; i += 1) {
      if (searchInputs[i].value.trim()) {
        return searchInputs[i].value.trim().toLowerCase();
      }
    }
    return '';
  }

  function applyFilters() {
    var keyword = searchValue();
    var year = activeValue(yearSelects);
    var type = activeValue(typeSelects);
    var region = activeValue(regionSelects);

    cards.forEach(function (card) {
      var haystack = [
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type,
        card.dataset.genre,
        card.textContent
      ].join(' ').toLowerCase();
      var ok = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        ok = false;
      }
      if (year && card.dataset.year !== year) {
        ok = false;
      }
      if (type && card.dataset.type !== type) {
        ok = false;
      }
      if (region && card.dataset.region !== region) {
        ok = false;
      }

      card.classList.toggle('is-filtered-out', !ok);
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      searchInputs.forEach(function (other) {
        if (other !== input) {
          other.value = input.value;
        }
      });
      applyFilters();
    });
  });

  yearSelects.concat(typeSelects).concat(regionSelects).forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });
})();
