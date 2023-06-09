document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchResults = document.getElementById('search-results');
  const prevPageButton = document.getElementById('prev-page');
  const nextPageButton = document.getElementById('next-page');
  const toggleSwitch = document.querySelector('.switch input[type="checkbox"]');
  const toggleState = document.getElementById('toggle-state');

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

  window.onload = function() {
    const savedToggleState = JSON.parse(localStorage.getItem('toggleState'));
  
    toggleSwitch.checked = savedToggleState;
    
    if (toggleSwitch.checked) {
      toggleState.textContent = 'Sub';
    } else {
      toggleState.textContent = 'Dub';
    }
  };
  
  
  toggleSwitch.addEventListener('change', function () {
    // Save the state of the switch to localStorage
    localStorage.setItem('toggleState', JSON.stringify(this.checked));
    
    if (this.checked) {
      toggleState.textContent = 'Sub';
    } else {
      toggleState.textContent = 'Dub';
    }
  
    // Redo the search with the new filter
    searchForm.dispatchEvent(new Event('submit', { cancelable: true }));
  });
  
  
    // Redo the search with the new filter
    searchForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      query = event.target.search.value;
      pageNumber = 1;
      await fetchAndDisplayData(query, pageNumber);
    });

  function filterResults(results) {
    if (toggleSwitch.checked) {
      return results.filter(result => !result.title.toLowerCase().includes('(dub)'));
    } else {
      return results.filter(result => result.title.toLowerCase().includes('(dub)'));
    }
  }
  

  function showLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'block';
  }
  
  function hideLoadingSpinner() {
    document.getElementById('loading-spinner').style.display = 'none';
  }
  
  // Include these functions in your existing fetchAndDisplayData function
  async function fetchAndDisplayData(query, pageNumber) {
    if (!query.trim()) { // Check if the query is empty
      searchResults.innerHTML = ''; // Clear search results
      togglePaginationVisibility(false); // Hide pagination
      hideLoadingSpinner(); // Hide the loading spinner
      return;
    }
  
    const primaryApiUrl = `https://animetrix-api.vercel.app/anime/gogoanime/${query}?page=${pageNumber}&limit=21`;
    const fallbackUrl = `https://api.consumet.org/anime/gogoanime/${query}?page=${pageNumber}&limit=21`;
  
    console.log(primaryApiUrl)
    showLoadingSpinner(); // Show the loading spinner
  
    try {
      const response = await fetch(primaryApiUrl);
  
      if (!response.ok) {
        throw new Error('Error fetching data from primary API:', response.statusText);
      }
  
      const data = await response.json();
      const filteredResults = filterResults(data.results.slice(0, 20));
  
      displayImages(filteredResults);
      updateNextPageButton(data.results.length);
      
      return data.total_pages;
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
        const fallbackFilteredResults = filterResults(fallbackData.results.slice(0, 20));
  
        displayImages(fallbackFilteredResults);
        updateNextPageButton(fallbackData.results.length);
  
        return fallbackData.total_pages;
      } catch (fallbackApiError) {
        console.error('Error:', fallbackApiError);
      }
    } finally {
      hideLoadingSpinner(); // Hide the loading spinner
    }
  }
  
  function updateNextPageButton(resultsCount) {
    nextPageButton.disabled = resultsCount <= 19;
    prevPageButton.disabled = pageNumber <= 1;
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
        img.tabIndex = 0; // Make the image focusable
        img.addEventListener('click', () => {
          sessionStorage.setItem('selectedAnime', JSON.stringify(item));
          window.location.href = `anime-details.html?animeId=${item.id}`;
        });
        img.addEventListener('keydown', function(event) {
          // Check if the key pressed was Enter (key code 13)
          if (event.keyCode === 13) {
            sessionStorage.setItem('selectedAnime', JSON.stringify(item));
            window.location.href = `anime-details.html?animeId=${item.id}`;
          }
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