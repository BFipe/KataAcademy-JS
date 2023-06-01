const debounce = (fn, debounceTime) => {
	let timeout;
	return function () {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn.apply(this, arguments), debounceTime);
	};
};

//Saving repos algorithm [Start]
let savedContainer = document.querySelector(".repo-container__saved-container");

let savedInfo = document.querySelector(".saved-container__saved-info");

let savedTemplate = document.querySelector("#saved-card");

let savedTemplateName = savedTemplate.content.querySelector(
	".saved-container__repo-name"
);

let savedTemplateOwner = savedTemplate.content.querySelector(
	".saved-container__repo-owner"
);

let savedTemplateLink = savedTemplate.content.querySelector(
	".saved-container-actions__visit"
);

let savedTemplateStars = savedTemplate.content.querySelector(
	".saved-container__stars-counter"
);

savedContainer.addEventListener("click", (event) => {
	if (event.target.className == "saved-container-actions__delete") {
		let card = event.target.closest(".saved-container__card");

		card.remove();
	}

	if (savedContainer.querySelectorAll(".saved-container__card").length == 0) {
		savedInfo.textContent =
			"You don't have any saved repos yet! Try to search something and add by clicking on it!";
	}
});

function addSavedCard(repoName, owner, starCount, lintToRepo) {
	savedTemplateName.textContent = repoName;
	savedTemplateOwner.textContent = owner;
	savedTemplateStars.textContent = starCount;
	savedTemplateLink.setAttribute("href", lintToRepo);

	let node = savedTemplate.content.cloneNode(true);
	savedContainer.appendChild(node);

	savedInfo.textContent = "";
}
//Saving repos algorithm [End]

//Searching repos algorithm [Start]
let repoContainer = document.querySelector(".repo-container__card-container");

let repoInfo = document.querySelector(".card-container__start-searching-info");

let repoTemplate = document.querySelector("#repo-card");

let repoCard = repoTemplate.content.querySelector(".card-container__card");

let repoCardText = repoTemplate.content.querySelector(
	".card-container__repo-name"
);

let repoInput = document.querySelector("#repo-input");

let debouncedSearch = debounce(searchRepos.bind(this), 500);

repoInput.addEventListener("input", debouncedSearch);

repoContainer.addEventListener("click", (event) => {
	if (
		event.target.className == "card-container__card" ||
		event.target.className == "card-container__repo-name"
	) {
		let card = event.target.closest(".card-container__card");

		let name = card.dataset.name;
		let owner = card.dataset.owner;
		let stars = card.dataset.stars;
		let link = card.dataset.link;

		addSavedCard(name, owner, stars, link);

		removeAllRepoChildren();

		repoInput.value = "";
	}
});

function removeAllRepoChildren() {
	repoContainer.querySelectorAll(".card-container__card").forEach((child) => {
		child.remove();
	});
}

function createRepoCard(repoName, dataOwner, dataStarCount, dataLink) {
	repoCardText.textContent = repoName;

	repoCard.dataset.name = repoName;
	repoCard.dataset.owner = dataOwner;
	repoCard.dataset.stars = dataStarCount;
	repoCard.dataset.link = dataLink;

	return repoTemplate.content.cloneNode(true);
}

function createRepoCardsFromData(data) {
	if (data.total_count > 0) {
		let fragment = document.createDocumentFragment();

		data.items.forEach((card) => {
			let name = card.name;
			let owner = card.owner.login;
			let stars = card.stargazers_count;
			let url = card.html_url;

			fragment.appendChild(createRepoCard(name, owner, stars, url));
		});

		repoInfo.textContent = "";
		removeAllRepoChildren();
		repoContainer.appendChild(fragment);
	} else {
		removeAllRepoChildren();
		repoInfo.textContent = "Nothing was found";
	}
}

function searchRepos() {
	let value = repoInput.value;

	if (Boolean(value.trim())) {
		fetch(
			`https://api.github.com/search/repositories?q=${value}&per_page=5&sort=popularity`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json;charset=utf-8",
					"User-Agent": "BFipe",
				},
			}
		)
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					throw new Error(
						"Cannot fetch data from api.github.com/search/repositories"
					);
				}
			})
			.then((data) => createRepoCardsFromData(data))
			.catch((err) => {
				removeAllRepoChildren();
				repoInfo.textContent =
					"Произошла ошибка во время обработки запроса. Пожалуйста, попробуйте позже.";
				console.log(err);
			});
	} else {
		removeAllRepoChildren();
	}
}
//Searching repos algorithm [End]
