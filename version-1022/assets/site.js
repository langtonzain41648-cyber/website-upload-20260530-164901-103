(() => {
    const nav = document.querySelector('[data-site-nav]');
    const menuButton = document.querySelector('[data-menu-toggle]');

    if (nav && menuButton) {
        menuButton.addEventListener('click', () => {
            nav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach((hero) => {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        const show = (target) => {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
        };

        const restart = () => {
            window.clearInterval(timer);
            timer = window.setInterval(() => show(index + 1), 5200);
        };

        prev?.addEventListener('click', () => {
            show(index - 1);
            restart();
        });

        next?.addEventListener('click', () => {
            show(index + 1);
            restart();
        });

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                show(Number(dot.dataset.heroDot || 0));
                restart();
            });
        });

        show(0);
        restart();
    });

    document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
        const scope = panel.parentElement;
        const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
        const input = panel.querySelector('[data-filter-input]');
        const year = panel.querySelector('[data-year-filter]');
        const region = panel.querySelector('[data-region-filter]');
        const empty = scope.querySelector('[data-empty-state]');

        const apply = () => {
            const q = (input?.value || '').trim().toLowerCase();
            const y = year?.value || '';
            const r = region?.value || '';
            let visible = 0;

            cards.forEach((card) => {
                const haystack = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.tags,
                ].join(' ').toLowerCase();
                const matchQuery = !q || haystack.includes(q);
                const matchYear = !y || card.dataset.year === y;
                const matchRegion = !r || card.dataset.region === r;
                const show = matchQuery && matchYear && matchRegion;
                card.classList.toggle('is-hidden', !show);
                if (show) {
                    visible += 1;
                }
            });

            empty?.classList.toggle('is-visible', visible === 0);
        };

        input?.addEventListener('input', apply);
        year?.addEventListener('change', apply);
        region?.addEventListener('change', apply);
    });

    document.querySelectorAll('[data-player]').forEach((shell) => {
        const video = shell.querySelector('video');
        const button = shell.querySelector('[data-play-button]');
        const src = shell.dataset.videoSrc;
        let ready = false;

        const start = () => {
            if (!video || !src) {
                return;
            }

            button?.classList.add('is-hidden');

            if (!ready) {
                ready = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
            }

            const playback = video.play();
            if (playback && typeof playback.catch === 'function') {
                playback.catch(() => {});
            }
        };

        button?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            start();
        });

        shell.addEventListener('click', (event) => {
            if (event.target === video && ready) {
                return;
            }
            start();
        });
    });
})();
