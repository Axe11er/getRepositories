const search = document.querySelector('.search');
const container = document.querySelector('.container');

const debounce = (cb, debounceTime) => {
   let timeout;
   return function () {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
         cb.apply(this, arguments);
      }, debounceTime);
   };
};

const eventHandler = debounce(e => {
   hideAutocomplete();
   if (e.target.value) {
      sendRequest(e.target.value)
         .then(repositories => {
            hideAutocomplete();
            repositories.forEach(repository => {
               createAutocomplete(repository);
            });
         })
         .catch(error => console.log(error));
   }
}, 700);

const hideAutocomplete = () => {
   container.textContent = null;
   container.style.display = 'none';
};

search.addEventListener('keydown', eventHandler);
search.addEventListener('search', hideAutocomplete);

const sendRequest = async request => {
   try {
      const response = await fetch(
         `https://api.github.com/search/repositories?q=${request}`
      );
      const repositories = await response.json();
      return repositories.items.slice(0, 5);
   } catch (error) {
      throw error;
   }
};

const createCard = repository => {
   const card = document.createElement('div');
   card.classList.add('card');
   card.innerHTML = `
   <a href = ${repository.html_url} class='link' target='_blank'>
   <p>Name: ${repository.name}</p>
   <p>Owner: ${repository.owner.login}</p>
   <p>Stars: ${repository.stargazers_count}</p>
   </a>
   <button class='close'>X</button>`;
   card.addEventListener('click', e => {
      if (e.target === card.querySelector('.close')) {
         card.remove();
      }
   });
   return card;
};

const createAutocomplete = repository => {
   const autocomplete = document.createElement('p');
   autocomplete.textContent = repository.name;
   container.appendChild(autocomplete);
   container.style.display = 'flex';
   autocomplete.addEventListener('click', () => {
      hideAutocomplete();
      search.insertAdjacentElement('afterend', createCard(repository));
      search.value = null;
   });
};
