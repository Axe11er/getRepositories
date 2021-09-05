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
   const response = await fetch(
      `https://api.github.com/search/repositories?q=${request}`
   );
   try {
      const repositories = await response.json();
      return repositories.items.slice(0, 5);
   } catch (error) {
      throw error;
   }
};

const createCard = repository => {
   const card = document.createElement('div');
   const close = document.createElement('button');
   card.classList.add('card');
   close.textContent = 'X';
   close.classList.add('close');
   card.innerHTML = `
   <a href = ${repository.html_url} class='link' target='_blank'>
   <p>Name: ${repository.name}</p>
   <p>Owner: ${repository.owner.login}</p>
   <p>Stars: ${repository.stargazers_count}</p>
   </a>`;
   card.appendChild(close);
   close.addEventListener('click', () => {
      card.remove();
   });
   return card;
};

const createAutocomplete = repository => {
   const autocomplete = document.createElement('p');
   autocomplete.textContent = repository.name;
   container.appendChild(autocomplete);
   container.style.display = 'flex';
   autocomplete.addEventListener('click', () => {
      container.style.display = 'none';
      search.insertAdjacentElement('afterend', createCard(repository));
      search.value = null;
   });
};
