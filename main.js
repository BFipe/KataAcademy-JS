const debounce = (fn, debounceTime) => {
	let timeout;
	return function () {
		clearTimeout(timeout);
		timeout = setTimeout(() => fn.apply(this, arguments), debounceTime);
	};
};

class SavedContainerCards {
	constructor() {
		//Init container [Start]
		this.container = document.querySelector(
			".repo-container__saved-container"
		);

		this.savedInfo = document.querySelector(".saved-container__saved-info");
		//Init container [End]

		//Init template [Start]

		this.template = document.querySelector("#saved-card");

		this.templateName = this.template.content.querySelector(
			".saved-container__repo-name"
		);

		this.templateOwner = this.template.content.querySelector(
			".saved-container__repo-owner"
		);

		this.templateLink = this.template.content.querySelector(
			".saved-container-actions__visit"
		);

		this.templateStars = this.template.content.querySelector(
			".saved-container__stars-counter"
		);

		//Init template [End]

		//Delete button eventListener [Start]
		this.container.addEventListener("click", (event) => {
			if (event.target.className == "saved-container-actions__delete") {
				let card = event.target.closest(".saved-container__card");

				card.remove();
			}

			if (
				this.container.querySelectorAll(".saved-container__card")
					.length == 0
			) {
				this.savedInfo.textContent =
					"You don't have any saved repos yet! Try to search something and add by clicking on it!";
			}
		});
		//Delete button eventListener [End]
	}

	addCard(repoName, owner, starCount, lintToRepo) {
		this.templateName.textContent = repoName;
		this.templateOwner.textContent = owner;
		this.templateStars.textContent = starCount;
		this.templateLink.setAttribute("href", lintToRepo);

		let node = this.template.content.cloneNode(true);
		this.container.appendChild(node);

		this.savedInfo.textContent = "";
	}
}

const savedContainerCards = new SavedContainerCards();

class RepoContainerCards {
	constructor() {
		//Init container [Start]
		this.container = document.querySelector(
			".repo-container__card-container"
		);

		this.info = document.querySelector(
			".card-container__start-searching-info"
		);
		//Init container [End]

		//Init template [Start]
		this.template = document.querySelector("#repo-card");

		this.card = this.template.content.querySelector(
			".card-container__card"
		);

		this.cardText = this.template.content.querySelector(
			".card-container__repo-name"
		);
		//Init template [End]

		//Input event listener [Start]
		this.input = document.querySelector("#repo-input");

		let debouncedSearch = debounce(this.searchRepos.bind(this), 500);

		this.input.addEventListener("input", debouncedSearch);
		//Input event listener [End]

		//Add card eventListener [Start]
		this.container.addEventListener("click", (event) => {
			if (
				event.target.className == "card-container__card" ||
				event.target.className == "card-container__repo-name"
			) {
				let card = event.target.closest(".card-container__card");

				let name = card.dataset.name;
				let owner = card.dataset.owner;
				let stars = card.dataset.stars;
				let link = card.dataset.link;

				savedContainerCards.addCard(name, owner, stars, link);

				this.removeAllChildren();

				this.input.value = "";
			}
		});
		//Add card eventListener [End]
	}

	removeAllChildren() {
		this.container
			.querySelectorAll(".card-container__card")
			.forEach((child) => {
				child.remove();
			});
	}

	createCard(repoName, dataOwner, dataStarCount, dataLink) {
		this.cardText.textContent = repoName;

		this.card.dataset.name = repoName;
		this.card.dataset.owner = dataOwner;
		this.card.dataset.stars = dataStarCount;
		this.card.dataset.link = dataLink;

		return this.template.content.cloneNode(true);
	}

	createCardsFromData(data) {
		if (data.total_count > 0) {
			this.info.textContent = "";

			let fragment = document.createDocumentFragment();

			data.items.forEach((card) => {
				let name = card.name;
				let owner = card.owner.login;
				let stars = card.stargazers_count;
				let url = card.html_url;

				fragment.appendChild(this.createCard(name, owner, stars, url));
			});

			this.removeAllChildren();
			this.container.appendChild(fragment);
		} else {
			this.info.textContent = "Nothing was found";
		}
	}

	searchRepos() {
		let value = this.input.value;

		this.info.textContent = "";
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
				.then((response) => response.json())
				.then((data) => this.createCardsFromData(data))
				.catch((err) => {
					this.info.textContent =
						"Произошла ошибка во время обработки запроса. Пожалуйста, попробуйте позже.";
					console.log(err);
				});
		} else {
			this.removeAllChildren();
		}
	}
}

const repoContainerCards = new RepoContainerCards();

// repoContainerCards.removeAllChildren();
// savedContainerCards.addCard("my", "little", "https://myfin.by/", 123);
// savedContainerCards.addCard("our", "little", "https://myfin.by/", 123);
// savedContainerCards.addCard("your", "little", "https://myfin.by/", 123);
// savedContainerCards.addCard("their", "little", "https://myfin.by/", 123);
