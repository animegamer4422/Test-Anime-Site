document.addEventListener("DOMContentLoaded", () => {
  async function main() {
    const prevEpisodeButton = document.getElementById("prev-episode");
    const nextEpisodeButton = document.getElementById("next-episode");
    let videoStarted = true;

    function getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
      const results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return "";
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    const episodeNumber = parseInt(getParameterByName("episodeNumber"));
    episodeId = getParameterByName("episodeId");
    const baseAnimeId = episodeId.substring(0, episodeId.lastIndexOf("-"));

    function updateEpisodeButtons() {
      prevEpisodeButton.disabled = episodeNumber <= 1;
    }

    updateEpisodeButtons();

    prevEpisodeButton.addEventListener("click", () => {
      const prevEpisodeNumber = episodeNumber - 1;
      const prevEpisodeId = `${baseAnimeId}-${prevEpisodeNumber}`;
      window.location.href = `video-player.html?episodeNumber=${prevEpisodeNumber}&episodeId=${prevEpisodeId}`;
    });

    nextEpisodeButton.addEventListener("click", () => {
      const nextEpisodeNumber = episodeNumber + 1;
      const nextEpisodeId = `${baseAnimeId}-${nextEpisodeNumber}`;
      window.location.href = `video-player.html?episodeNumber=${nextEpisodeNumber}&episodeId=${nextEpisodeId}`;
    });

    async function fetchAnimeDetails(animeId) {
      const primaryApiUrl = `https://api-consumet-org-six.vercel.app/anime/gogoanime/${animeId}`;
      const fallbackUrl = `https://api.consumet.org/anime/gogoanime/${animeId}`;

      try {
        const response = await fetch(primaryApiUrl);
        if (!response.ok)
          throw new Error(`Error fetching anime details from primary API: ${response.statusText}`);
        return response.json();
      } catch (primaryApiError) {
        console.error("Error:", primaryApiError);

        // Fallback API
        console.log("Fetching data from fallback API...");
        const fallbackResponse = await fetch(fallbackUrl);
        if (!fallbackResponse.ok)
          throw new Error(`Error fetching anime details from fallback API: ${fallbackResponse.statusText}`);
        return fallbackResponse.json();
      }
    }

    function displayAnimeDetails(anime, episodeNumber) {
      const currentEpisodeElement = document.getElementById("current-episode");
      currentEpisodeElement.textContent = `Currently Playing: Episode ${episodeNumber}`;
    }

    try {
      const anime = await fetchAnimeDetails(baseAnimeId);
      displayAnimeDetails(anime, episodeNumber);

      const apiUrl = `https://api.amvstr.me/api/v2/stream/${episodeId}`;
      console.log(apiUrl);

      const data = await fetch(apiUrl);
      if (data.ok) {
        const jsonResponse = await data.json();

        if (jsonResponse && jsonResponse.stream && jsonResponse.stream.multi && jsonResponse.stream.multi.main && jsonResponse.stream.multi.main.url) {
          const mainUrl = jsonResponse.stream.multi.main.url;

          const video = document.querySelector("#player");
          const player = new Plyr(video, {
            controls: [
              "play-large",
              "rewind",
              "play",
              "fast-forward",
              "progress",
              "current-time",
              "duration",
              "mute",
              "volume",
              "captions",
              "settings",
              "pip",
              "airplay",
              "fullscreen",
            ],
          });

          function throttle(func, delay) {
            let lastCall = 0;
            return function(...args) {
              const now = new Date().getTime();
              if (now - lastCall < delay) {
                return;
              }
              lastCall = now;
              return func(...args);
            };
          }

          function storeVideoProgress(currentTime) {
            localStorage.setItem(episodeId, currentTime.toString());
            console.log("Storing time: ", currentTime);
          }

          const throttledStoreVideoProgress = throttle(storeVideoProgress, 10000);

          player.on("timeupdate", function() {
            throttledStoreVideoProgress(player.currentTime);
          });

          player.on("pause", function() {
            storeVideoProgress(player.currentTime);
            console.log("Pause event fired. Current time:", player.currentTime);
          });

          player.on("ended", function() {
            storeVideoProgress(player.currentTime);
            console.log("Video ended. Final time:", player.currentTime);
          });

          video.addEventListener("canplaythrough", function() {
            const savedTime = parseFloat(localStorage.getItem(episodeId)) || 0;
            if (player.playing !== true && player.currentTime !== savedTime) {
              player.currentTime = savedTime;
            }
            video.play();
          });

          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(mainUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
              video.addEventListener("canplaythrough", function() {
                const savedTime = parseFloat(localStorage.getItem(episodeId)) || 0;
                if (player.playing !== true && player.currentTime !== savedTime) {
                  player.currentTime = savedTime;
                }
                video.play();
              });
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = mainUrl;
            video.addEventListener("canplaythrough", function() {
              const savedTime = parseFloat(localStorage.getItem(episodeId)) || 0;
              if (player.playing !== true && player.currentTime !== savedTime) {
                player.currentTime = savedTime;
              }
              video.play();
            });
          } else {
            console.error("This is a legacy browser that does not support HLS.");
          }
        } else {
          console.error("JSON response does not have the expected structure.");
        }
      } else {
        console.error("Error fetching server URL:", data.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  main();
});
