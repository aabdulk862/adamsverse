var reveals = document.querySelectorAll(".reveal");
function checkReveal() {
  for (var i = 0; i < reveals.length; i++) {
    var top = reveals[i].getBoundingClientRect().top;
    if (top < window.innerHeight - 60) reveals[i].classList.add("visible");
  }
}
window.addEventListener("scroll", checkReveal);
window.addEventListener("load", checkReveal);

// Hamburger menu toggle
var hamburger = document.querySelector(".site-navbar-hamburger");
if (hamburger) {
  hamburger.addEventListener("click", function () {
    document.querySelector(".site-navbar-overlay").classList.toggle("open");
  });
}
