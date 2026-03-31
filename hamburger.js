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
const getNavigatorContent = document.querySelector("#navigatorcontent"); // Use correct ID here
const getCloseNav = document.querySelector("#closenav"); // Use correct ID for the close button

// Toggle the visibility of the navigator when the product link is clicked
getProductBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default anchor link behavior
    getNavigatorContent.classList.toggle("hidden"); // Toggles the hidden class on #navigatorcontent
});

// Close the navigator when the close button (X) is clicked
getCloseNav.addEventListener("click", () => {
    getNavigatorContent.classList.add("hidden"); // Hides the #navigatorcontent when the close button is clicked
});