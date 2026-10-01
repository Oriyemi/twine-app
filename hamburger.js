const getHamburgerBtn = document.querySelector("#hamburger");
const getNavigatorDiv = document.querySelector("#navigator");
const getCloseBtn = document.querySelector("#closeBtn");

if (getHamburgerBtn && getNavigatorDiv) {
    getHamburgerBtn.addEventListener("click", () => {
        getNavigatorDiv.classList.toggle("hidden");
    });
}

if (getCloseBtn && getNavigatorDiv) {
    getCloseBtn.addEventListener("click", () => {
        getNavigatorDiv.classList.add("hidden");
    });
}

const getProductBtn = document.querySelector("#product");
const getNavigatorContent = document.querySelector("#navigatorcontent");
const getCloseNav = document.querySelector("#closenav");

if (getProductBtn && getNavigatorContent) {
    getProductBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.innerWidth >= 768) {
            getNavigatorContent.classList.toggle("hidden");
        }
    });
}

if (getCloseNav && getNavigatorContent) {
    getCloseNav.addEventListener("click", () => {
        getNavigatorContent.classList.add("hidden");
    });
}