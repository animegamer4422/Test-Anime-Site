document.addEventListener('DOMContentLoaded', () => {
  async function main() {
    const prevEpisodeButton = document.getElementById('prev-episode');
    const nextEpisodeButton = document.getElementById('next-episode');

    function getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, '\\$&');
      const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
      const results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    const episodeNumber = parseInt(getParameterByName('episodeNumber'));
    const episodeId = getParameterByName('episodeId');
    const baseAnimeId = episodeId.substring(0, episodeId.lastIndexOf('-'));

    function updateEpisodeButtons() {
      prevEpisodeButton.disabled = episodeNumber <= 1;
    }

    updateEpisodeButtons();

    prevEpisodeButton.addEventListener('click', () => {
      const prevEpisodeNumber = episodeNumber - 1;
      const prevEpisodeId = `${baseAnimeId}-${prevEpisodeNumber}`;
      window.location.href = `video-player.html?episodeNumber=${prevEpisodeNumber}&episodeId=${prevEpisodeId}`;
    });

    nextEpisodeButton.addEventListener('click', () => {
      const nextEpisodeNumber = episodeNumber + 1;
      const nextEpisodeId = `${baseAnimeId}-${nextEpisodeNumber}`;
      window.location.href = `video-player.html?episodeNumber=${nextEpisodeNumber}&episodeId=${nextEpisodeId}`;
    });

    async function fetchAnimeDetails(animeId) {
      const apiUrl = `https://animetrix-api.vercel.app/anime/gogoanime/${animeId}`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`Error fetching anime details: ${response.statusText}`);
      return response.json();
    }

    function displayAnimeDetails(anime, episodeNumber) {
      const currentEpisodeElement = document.getElementById('current-episode');
      currentEpisodeElement.textContent = `Currently Playing: Episode ${episodeNumber}`;
    }

    const anime = await fetchAnimeDetails(baseAnimeId);
    displayAnimeDetails(anime, episodeNumber);
    
    const apiUrl = `https://api.amvstr.ml/api/v2/stream/${episodeId}`;
    console.log(apiUrl); 


    try {
      const data = await fetch(apiUrl);
      if (data.ok) {
        const jsonResponse = await data.json();
        const mainUrl = jsonResponse.data.stream.multi.main.url;
    
        const video = document.querySelector('#player');
        const player = new Plyr(video, {
          controls: [
            'play-large',
            'rewind',
            'play',
            'fast-forward',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'captions',
            'settings',
            'pip',
            'airplay',
            'fullscreen',
          ],
        });

                // Function to throttle
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

                // Function to store video progress
                function storeVideoProgress(currentTime) {
                  localStorage.setItem(episodeId, currentTime.toString());
                }
        
                // Throttle function for timeupdate
                const handleTimeUpdate = throttle((event) => {
                  storeVideoProgress(player.currentTime);
                }, 15000);
        
                player.on("timeupdate", handleTimeUpdate);
        
                // Listen for 'play' event and restore time
                player.on('play', function() {
                  const savedTime = localStorage.getItem(episodeId);
                  if (savedTime) {
                    player.currentTime = parseFloat(savedTime);
                  }
                });
        
    
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(mainUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = mainUrl;
          video.addEventListener('loadedmetadata', function () {
            video.play();
          });
        } else {
          console.error('This is a legacy browser that does not support HLS.');
        }
      } else {
        console.error('Error fetching server URL:', data.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
}
main();
});
