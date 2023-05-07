document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchResults = document.getElementById('search-results');
  const prevPageButton = document.getElementById('prev-page');
  const nextPageButton = document.getElementById('next-page');

  let query = '';
  let pageNumber = 1;

  searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    query = event.target.search.value;
    pageNumber = 1;
    await fetchAndDisplayData(query, pageNumber);
  });

  prevPageButton.addEventListener('click', async () => {
    pageNumber--;
    await fetchAndDisplayData(query, pageNumber);
  });

  nextPageButton.addEventListener('click', async () => {
    pageNumber++;
    await fetchAndDisplayData(query, pageNumber);
  });

  async function fetchAndDisplayData(query, pageNumber) {
    const apiUrl = `https://api.consumet.org/anime/gogoanime/${query}?page=${pageNumber}`;

    try {
      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        displayImages(data.results);
        updatePaginationButtons(); // Call the function here
      } else {
        console.error('Error fetching data:', response.statusText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const pagination = document.getElementById('pagination');

  function displayImages(results) {
    searchResults.innerHTML = '';
  
    if (results.length > 0) {
      results.forEach((item) => {
        const imgContainer = document.createElement('div'); // Create a container for the image and name
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title;
        img.title = item.title;
        img.classList.add('search-result-image'); // Add a class for styling
        img.addEventListener('click', () => {
          sessionStorage.setItem('selectedAnime', JSON.stringify(item));
          window.location.href = 'anime-details.html';
        });
  
        const name = document.createElement('span'); // Create an element for the name
        name.textContent = item.title;
        name.classList.add('search-result-name'); // Add a class for styling
  
        imgContainer.appendChild(img); // Append the image and name to the container
        imgContainer.appendChild(name);
  
        searchResults.appendChild(imgContainer); // Append the container to the searchResults container
      });

      togglePaginationVisibility(true);
    } else {
      const noResultsMessage = document.createElement('p');
      noResultsMessage.textContent = 'No results found. Please try a different search term.';
      searchResults.appendChild(noResultsMessage);
      togglePaginationVisibility(false);
    }
  }

  function togglePaginationVisibility(visible) {
    if (visible) {
      pagination.classList.remove('hidden');
    } else {
      pagination.classList.add('hidden');
    }
  }

  function updatePaginationButtons() {
    prevPageButton.disabled = pageNumber <= 1;
  }
});