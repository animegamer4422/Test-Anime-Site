document.addEventListener('DOMContentLoaded', async () => {
  let animeId;
  const selectedAnime = JSON.parse(sessionStorage.getItem('selectedAnime'));

  if (selectedAnime) {
    animeId = selectedAnime.id;
  } else {
    const urlParams = new URLSearchParams(window.location.search);
    animeId = urlParams.get('animeId');
  }

  if (animeId) {
    const primaryApiUrl = `https://animetrix-api.vercel.app/anime/gogoanime/info/${animeId}`;
    const fallbackUrl = `https://api.consumet.org/anime/gogoanime/info/${animeId}`;

    console.log(primaryApiUrl)
    try {
      const response = await fetch(primaryApiUrl);

      if (!response.ok) {
        throw new Error('Error fetching data from primary API:', response.statusText);
      }

      const data = await response.json();
      await displayDetails(data);
    } catch (primaryApiError) {
      console.error('Error:', primaryApiError);
      
      // Fallback API
      console.log('Fetching data from fallback API...');
      try {
        const fallbackResponse = await fetch(fallbackUrl);

        if (!fallbackResponse.ok) {
          throw new Error('Error fetching data from fallback API:', fallbackResponse.statusText);
        }

        const fallbackData = await fallbackResponse.json();
        await displayDetails(fallbackData);
      } catch (fallbackApiError) {
        console.error('Error:', fallbackApiError);
      }
    }
  } else {
    // Redirect to the main page if there's no animeId in the URL parameters or sessionStorage
    window.location.href = 'index.html';
  }
});



async function displayDetails(anime) {
  const title = document.getElementById('anime-title');
  const image = document.getElementById('anime-image');
  const description = document.getElementById('anime-description');
  const episodes = document.getElementById('anime-episodes');

  title.textContent = anime.title;
  image.src = anime.image;
  image.alt = anime.title;
  description.textContent = anime.description;

  // Display the list of episodes
  for (const episode of anime.episodes) {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.textContent = `Episode ${episode.number}`;

    // Add data attributes for episode number and any other required parameters
    link.dataset.episodeNumber = episode.number;
    link.dataset.episodeId = episode.id;

    link.classList.add('episode');

    listItem.appendChild(link);
    episodes.appendChild(listItem);
  }

  // Add the click event listener to the dynamically created episode elements
  document.querySelectorAll('.episode').forEach(episodeLink => {
    episodeLink.addEventListener('click', async (event) => {
      const episodeNumber = event.target.dataset.episodeNumber;
      const episodeId = event.target.dataset.episodeId;
      

      // Now navigate to the video-player.html page and pass the necessary parameters
      window.location.href = `video-player.html?episodeNumber=${episodeNumber}&episodeId=${episodeId}`;
    });
  });
}
