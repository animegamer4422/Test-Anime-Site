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

    // Update the disabled state of the prev and next buttons based on the current episode number
    function updateEpisodeButtons() {
      prevEpisodeButton.disabled = episodeNumber <= 1;
      // Update this line with the maximum number of episodes for the anime if it is available
      // nextEpisodeButton.disabled = episodeNumber >= maxNumberOfEpisodes;
    }

    updateEpisodeButtons();

    prevEpisodeButton.addEventListener('click', () => {
      const prevEpisodeNumber = episodeNumber - 1;
      const prevEpisodeId = parseInt(episodeId) - 1;
      window.location.href = `video-player.html?episodeNumber=${prevEpisodeNumber}&episodeId=${prevEpisodeId}`;
    });

    nextEpisodeButton.addEventListener('click', () => {
      const nextEpisodeNumber = episodeNumber + 1;
      const nextEpisodeId = parseInt(episodeId) + 1;
      window.location.href = `video-player.html?episodeNumber=${nextEpisodeNumber}&episodeId=${nextEpisodeId}`;
    });

    // Fetch the server URL for the episode
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
        console.log(`Fetched stream URL for Episode ${episodeNumber}:`, serverUrl);

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
            'quality',
            'captions',
            'settings',
            'pip',
            'airplay',
            'fullscreen',
          ],
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
          console.error('This is a legacy browser that does not support.');
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
  