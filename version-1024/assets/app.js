(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[character];
        });
    }

    var menuButton = qs("[data-menu-toggle]");
    var mobilePanel = qs("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
        });
    }

    var hero = qs("[data-hero]");

    if (hero) {
        var slides = qsa("[data-hero-slide]", hero);
        var dots = qsa("[data-hero-dot]", hero);
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    var searchInputs = qsa("[data-site-search]");
    var searchResults = qs("[data-search-results]");

    function closeSearch() {
        if (searchResults) {
            searchResults.classList.remove("is-open");
            searchResults.innerHTML = "";
        }
    }

    function renderSearch(query) {
        if (!searchResults || !window.SEARCH_INDEX) {
            return;
        }

        var keyword = query.trim().toLowerCase();

        if (keyword.length < 1) {
            closeSearch();
            return;
        }

        var items = window.SEARCH_INDEX.filter(function (item) {
            return item.searchText.indexOf(keyword) !== -1;
        }).slice(0, 12);

        if (!items.length) {
            searchResults.classList.add("is-open");
            searchResults.innerHTML = '<div class="search-result-item"><span></span><span><strong>暂无匹配影片</strong><small>换一个关键词继续搜索</small></span></div>';
            return;
        }

        searchResults.classList.add("is-open");
        searchResults.innerHTML = items.map(function (item) {
            return [
                '<a class="search-result-item" href="' + item.url + '">',
                '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">',
                '<span><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.meta) + '</small></span>',
                '</a>'
            ].join("");
        }).join("");
    }

    searchInputs.forEach(function (input) {
        input.addEventListener("input", function () {
            searchInputs.forEach(function (other) {
                if (other !== input) {
                    other.value = input.value;
                }
            });
            renderSearch(input.value);
        });

        input.addEventListener("focus", function () {
            if (input.value.trim()) {
                renderSearch(input.value);
            }
        });
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest("[data-site-search]") && !event.target.closest("[data-search-results]")) {
            closeSearch();
        }
    });

    qsa("[data-page-filter]").forEach(function (input) {
        var list = qs("[data-filter-list]");
        if (!list) {
            return;
        }

        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            qsa(".movie-card", list).forEach(function (card) {
                var text = card.textContent.toLowerCase();
                card.style.display = text.indexOf(keyword) === -1 ? "none" : "";
            });
        });
    });

    qsa("[data-sort-select]").forEach(function (select) {
        var list = qs("[data-filter-list]");
        if (!list) {
            return;
        }

        select.addEventListener("change", function () {
            var cards = qsa(".movie-card", list);
            cards.sort(function (a, b) {
                var av = a.textContent;
                var bv = b.textContent;
                if (select.value === "title") {
                    return av.localeCompare(bv, "zh-Hans-CN");
                }
                if (select.value === "score") {
                    return (Number((bv.match(/([0-9]\.[0-9])分/) || [0, 0])[1]) || 0) - (Number((av.match(/([0-9]\.[0-9])分/) || [0, 0])[1]) || 0);
                }
                return (Number((bv.match(/(19|20)\d{2}/) || [0, 0])[0]) || 0) - (Number((av.match(/(19|20)\d{2}/) || [0, 0])[0]) || 0);
            });
            cards.forEach(function (card) {
                list.appendChild(card);
            });
        });
    });

    window.initializePlayer = function (source) {
        var video = qs("#movie-player");
        var cover = qs("#player-cover");
        var button = qs("#play-button");
        var message = qs("#player-message");
        var loaded = false;
        var instance = null;

        if (!video || !cover || !button || !source) {
            return;
        }

        function showMessage() {
            if (message) {
                message.hidden = false;
            }
        }

        function bindSource() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                instance.loadSource(source);
                instance.attachMedia(video);
                instance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage();
                    }
                });
                return;
            }

            showMessage();
        }

        function startPlayback() {
            bindSource();
            cover.classList.add("hidden");
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    cover.classList.remove("hidden");
                });
            }
        }

        cover.addEventListener("click", startPlayback);
        button.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        window.addEventListener("pagehide", function () {
            if (instance) {
                instance.destroy();
                instance = null;
            }
        });
    };
})();
