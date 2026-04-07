// Scroll reveal
var observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach(function (el, i) {
  el.style.transitionDelay = (i % 4) * 0.06 + "s";
  observer.observe(el);
});

// Hamburger menu toggle
var hamburger = document.querySelector(".site-navbar-hamburger");
if (hamburger) {
  hamburger.addEventListener("click", function () {
    document.querySelector(".site-navbar-overlay").classList.toggle("open");
  });
}
