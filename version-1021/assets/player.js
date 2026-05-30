function initPlayer(url) {
    var video = document.querySelector("[data-video-player]");
    var overlay = document.querySelector("[data-player-overlay]");
    var attached = false;
    var hlsInstance = null;

    if (!video || !overlay || !url) {
        return;
    }

    function attachVideo() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = url;
    }

    function startPlayback() {
        attachVideo();
        overlay.classList.add("is-hidden");

        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {
                video.controls = true;
            });
        }
    }

    overlay.addEventListener("click", startPlayback);

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });

    video.addEventListener("ended", function () {
        overlay.classList.remove("is-hidden");
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
