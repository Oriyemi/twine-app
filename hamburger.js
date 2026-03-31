const getHamburgerBtn = document.querySelector("#hamburger");
const getNavigatorDiv = document.querySelector("#navigator");
const getCloseBtn = document.querySelector("#closeBtn");

getHamburgerBtn.addEventListener("click", () => {
    getNavigatorDiv.classList.toggle("hidden"); 
});


getCloseBtn.addEventListener("click", () => {
    getNavigatorDiv.classList.add("hidden");
});