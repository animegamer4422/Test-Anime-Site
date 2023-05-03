document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchResults = document.getElementById('search-results');
  
    searchForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const query = event.target.search.value;
      const pageNumber = 1; // Update this value if you want to handle pagination.
      const apiUrl = `https://api.consumet.org/anime/zoro/${query}?page=${pageNumber}`;
  
      try {
        const response = await fetch(apiUrl);
  
        if (response.ok) {
          const data = await response.json();
          displayImages(data.results);
        } else {
          console.error('Error fetching data:', response.statusText);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  
    function displayImages(results) {
        searchResults.innerHTML = ''; // Clear previous results
      
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
      }        
    });

  

  