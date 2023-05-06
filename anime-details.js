document.addEventListener('DOMContentLoaded', async () => {
  const selectedAnime = JSON.parse(sessionStorage.getItem('selectedAnime'));

  if (selectedAnime) {
    const apiUrl = `https://api.consumet.org/anime/gogoanime/info/${selectedAnime.id}`;

    try {
      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        await displayDetails(data); // Add the 'await' keyword here
      } else {
        console.error('Error fetching data:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  } else {
    // Redirect to the main page if there's no selected anime in the sessionStorage
    window.location.href = 'index.html';
  }
});

async function displayDetails(anime) {
  const title = document.getElementById('anime-title');
  const image = document.getElementById('anime-image');
  const description = document.getElementById('anime-description');
  const episodes = document.getElementById('anime-episodes');
  const href = document.getElementById('anime-url');

  title.textContent = anime.title;
  image.src = anime.image;
  image.alt = anime.title;
  description.textContent = anime.description;

  // Display the list of episodes
  for (const episode of anime.episodes) {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.textContent = `Episode ${episode.number}`;

    // Fetch the server URL for the episode
    const episodeId = episode.id;
    const serverName = 'vidstreaming'; // You can change this to any of the available server names
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
        link.setAttribute('href', serverUrl);
        console.log(`Fetched stream URL for Episode ${episode.number}:`, serverUrl);
      } else {
        console.error('Error fetching server URL:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }

    // Modify the click event listener for the episode link
    link.addEventListener('click', (event) => {
      event.preventDefault();
      sessionStorage.setItem('selectedEpisodeUrl', link.getAttribute('href'));
      window.location.href = 'video-player.html';
    });

    listItem.appendChild(link);
    episodes.appendChild(listItem);
  }
}
