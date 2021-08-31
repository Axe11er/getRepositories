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
   const result = [];
   try {
      const repositories = await response.json();
      for (let i = 0; i < 5; i++) {
         if (repositories.items[i]) result.push(repositories.items[i]);
      }
      return result;
   } catch (error) {
      throw error;
   }
};

const createCard = repository => {
   const card = document.createElement('div');
   const cardText = document.createElement('a');
   const close = document.createElement('button');
   const name = document.createElement('p');
   const owner = document.createElement('p');
   const stars = document.createElement('p');
   card.classList.add('card');
   cardText.href = repository.html_url;
   cardText.classList.add('link');
   cardText.target = '_blank';
   name.textContent = `Name: ${repository.name}`;
   owner.textContent = `Owner: ${repository.owner.login}`;
   stars.textContent = `Stars: ${repository.stargazers_count}`;
   close.textContent = 'X';
   close.classList.add('close');
   cardText.appendChild(name);
   cardText.appendChild(owner);
   cardText.appendChild(stars);
   card.appendChild(cardText);
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
