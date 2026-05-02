// Scroll spy: highlight active nav link
var sections = document.querySelectorAll(".section[id]");
var navLinks = document.querySelectorAll('.toc a[href^="#"]');
var progressBar = document.getElementById("tocProgress");

function updateNav() {
  // Progress bar
  var scrollTop = window.scrollY;
  var docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (scrollTop / docHeight) * 100 + "%";

  // Active link
  var currentId = "";
  sections.forEach(function (section) {
    var top = section.offsetTop - 90;
    if (scrollTop >= top) currentId = section.id;
  });

  navLinks.forEach(function (link) {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === "#" + currentId,
    );
  });

  // Auto-scroll active link into view in the nav bar
  var activeLink = document.querySelector(".toc a.active");
  if (activeLink) {
    var linksEl = document.getElementById("tocLinks");
    var linkLeft = activeLink.offsetLeft;
    var linkWidth = activeLink.offsetWidth;
    var containerWidth = linksEl.offsetWidth;
    var scrollLeft = linksEl.scrollLeft;
    if (
      linkLeft < scrollLeft + 20 ||
      linkLeft + linkWidth > scrollLeft + containerWidth - 20
    ) {
      linksEl.scrollTo({
        left: linkLeft - containerWidth / 2 + linkWidth / 2,
        behavior: "smooth",
      });
    }
  }
}

window.addEventListener("scroll", updateNav, { passive: true });
updateNav();

// Hamburger menu toggle
var hamburger = document.querySelector(".site-navbar-hamburger");
if (hamburger) {
  hamburger.addEventListener("click", function () {
    document.querySelector(".site-navbar-overlay").classList.toggle("open");
  });
}
