(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.vod-player'));

  function attach(video, overlay) {
    var url = video.getAttribute('data-vod');

    if (!url) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      video.addEventListener('ended', function () {
        hls.destroy();
      }, { once: true });
      return;
    }

    video.src = url;
    video.play().catch(function () {});
  }

  players.forEach(function (video) {
    var frame = video.closest('.video-frame');
    var overlay = frame ? frame.querySelector('.play-overlay') : null;
    var started = false;

    function start() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      attach(video, overlay);
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  });
})();
