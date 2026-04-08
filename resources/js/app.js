import Swiper from "swiper/bundle";
import "swiper/css/bundle";

// Make Swiper available globally for Alpine.js $refs
window.Swiper = Swiper;

window.addEventListener("scroll", function () {
    const btn = document.querySelector(".fixed.bottom-6.right-6");
    if (window.scrollY > 300) {
        btn.style.display = "block";
    } else {
        // Optional: hide it when at the very top
        // btn.style.display = 'none';
    }
});
