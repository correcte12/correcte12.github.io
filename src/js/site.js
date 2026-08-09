(function () {
  var sidebar = document.getElementById("sidebar");
  var menuToggle = document.getElementById("menu-toggle");
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.toggle("open");
    });
  }

  var themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      var next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("tema", next);
    });
  }

  var buscador = document.getElementById("buscador");
  if (buscador) {
    buscador.addEventListener("input", function () {
      var term = buscador.value.trim().toLowerCase();
      document.querySelectorAll(".card").forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        card.classList.toggle("is-hidden", term.length > 0 && haystack.indexOf(term) === -1);
      });
      document.querySelectorAll(".grupo").forEach(function (grupo) {
        var visibleCards = grupo.querySelectorAll(".card:not(.is-hidden)");
        grupo.style.display = term.length > 0 && visibleCards.length === 0 ? "none" : "";
      });
    });
  }
})();
