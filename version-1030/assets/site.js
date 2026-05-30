(function () {
    var navToggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === activeSlide);
        });
    }

    if (slides.length) {
        showSlide(0);
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var searchButton = document.querySelector('[data-search-button]');
    var searchItems = Array.prototype.slice.call(document.querySelectorAll('.search-item'));
    var noResult = document.querySelector('[data-no-result]');

    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function runSearch() {
        if (!searchInput || !searchItems.length) {
            return;
        }
        var keyword = normalize(searchInput.value);
        var visibleCount = 0;
        searchItems.forEach(function (item) {
            var haystack = normalize([
                item.getAttribute('data-title'),
                item.getAttribute('data-genre'),
                item.getAttribute('data-tags'),
                item.getAttribute('data-year'),
                item.getAttribute('data-region')
            ].join(' '));
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            item.style.display = matched ? '' : 'none';
            if (matched) {
                visibleCount += 1;
            }
        });
        if (noResult) {
            noResult.style.display = visibleCount ? 'none' : 'block';
        }
    }

    if (searchInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            searchInput.value = query;
        }
        searchInput.addEventListener('input', runSearch);
        searchInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                runSearch();
            }
        });
        if (searchButton) {
            searchButton.addEventListener('click', runSearch);
        }
        runSearch();
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById('movie-player');
        var layer = document.querySelector('[data-play-layer]');
        var hasStarted = false;
        var hlsInstance = null;

        function start() {
            if (!video || !streamUrl) {
                return;
            }
            if (layer) {
                layer.style.display = 'none';
            }
            if (!hasStarted) {
                hasStarted = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    return;
                }
                video.src = streamUrl;
            }
            video.play().catch(function () {});
        }

        if (layer) {
            layer.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
