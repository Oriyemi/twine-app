const getHamburgerBtn = document.querySelector("#hamburger");
const getNavigatorDiv = document.querySelector("#navigator");
const getCloseBtn = document.querySelector("#closeBtn");

getHamburgerBtn.addEventListener("click", () => {
    getNavigatorDiv.classList.toggle("hidden"); 
});


getCloseBtn.addEventListener("click", () => {
    getNavigatorDiv.classList.add("hidden");
});


const getProductBtn = document.querySelector("#product");
const getNavigatorContent = document.querySelector("#navigatorcontent"); 
const getCloseNav = document.querySelector("#closenav"); 


getProductBtn.addEventListener("click", (e) => {
    e.preventDefault(); 
    
      if (window.innerWidth >= 768) {
        getNavigatorContent.classList.toggle("hidden");
      }
});


getCloseNav.addEventListener("click", () => {
    getNavigatorContent.classList.add("hidden"); 
});