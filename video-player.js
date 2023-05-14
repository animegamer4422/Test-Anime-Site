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
      // Update this line with the maximum number of episodes for the anime if it is available
      // nextEpisodeButton.disabled = episodeNumber >= maxNumberOfEpisodes;
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
      const apiUrl = `https://api.consumet.org/anime/gogoanime/${animeId}`;
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

    const serverName = 'vidstreaming';
    const apiUrl = `https://api.consumet.org/anime/gogoanime/watch/${episodeId}?server=${serverName}`;

    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const data = await response.json();
        const highestQualityStream = data.sources.reduce((prev, curr) => {
          if (prev.quality === 'auto') return curr;
          if (curr.quality === 'auto') return prev;
          return parseInt(prev.quality) > parseInt(curr.quality) ? prev : curr;
        });
        const serverUrl = highestQualityStream.url;

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
          quality: {
            default: 720,
            options: [1080, 720, 480, 360],
            forced: true,
            onChange: (e) => console.log(e),
          },
        });

        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(serverUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = serverUrl;
          video.addEventListener('loadedmetadata', function () {
            video.play();
          });
        } else {
          console.error('This is a legacy browser that does not support HLS.');
        }
      } else {
        console.error('Error fetching server URL:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  main();
});

