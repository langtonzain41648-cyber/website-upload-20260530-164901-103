(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    ready(function () {
        var button = document.querySelector("[data-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (button && menu) {
            button.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }

        function autoPlay() {
            if (slides.length < 2) {
                return;
            }

            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                autoPlay();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
                autoPlay();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
                autoPlay();
            });
        }

        showSlide(0);
        autoPlay();

        var searchInput = document.querySelector("[data-card-search]");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty-state]");
        var currentFilter = "all";

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function filterCards() {
            var keyword = normalize(searchInput ? searchInput.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre")
                ].join(" "));
                var type = normalize(card.getAttribute("data-type"));
                var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
                var filterMatched = currentFilter === "all" || type.indexOf(currentFilter) !== -1 || text.indexOf(currentFilter) !== -1;
                var matched = keywordMatched && filterMatched;

                card.style.display = matched ? "flex" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", filterCards);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                currentFilter = normalize(chip.getAttribute("data-filter-chip"));
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                filterCards();
            });
        });

        filterCards();
    });
})();
