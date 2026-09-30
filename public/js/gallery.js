// Gallery filter and lightbox. Plain JavaScript, no libraries.
(function () {
  var grid = document.getElementById("gallery-grid");
  if (!grid) return;
  var items = Array.prototype.slice.call(grid.children);

  // Filter by program
  var filter = document.getElementById("gallery-filter");
  var status = document.getElementById("filter-status");
  if (filter) {
    filter.classList.remove("invisible");
    filter.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-filter]");
      if (!btn) return;
      var value = btn.getAttribute("data-filter");
      filter.querySelectorAll("[data-filter]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      var shown = 0;
      items.forEach(function (li) {
        var match = value === "all" || li.getAttribute("data-program") === value;
        li.hidden = !match;
        if (match) shown++;
      });
      if (status) status.textContent = shown + (shown === 1 ? " photo" : " photos") + " shown";
    });
  }

  // Lightbox
  var dialog = document.getElementById("lightbox");
  if (!dialog || typeof dialog.showModal !== "function") return;
  var img = dialog.querySelector("img");
  var current = -1;
  var opener = null;

  function visibleLinks() {
    return items.filter(function (li) { return !li.hidden; }).map(function (li) {
      return li.querySelector("[data-lightbox]");
    });
  }

  function show(index) {
    var links = visibleLinks();
    if (!links.length) return;
    current = (index + links.length) % links.length;
    var a = links[current];
    img.removeAttribute("src");
    img.srcset = a.getAttribute("data-srcset") || "";
    img.sizes = "100vw";
    img.src = a.getAttribute("href");
    img.alt = a.getAttribute("data-alt") || "";
    var single = links.length < 2;
    dialog.querySelector("[data-prev]").hidden = single;
    dialog.querySelector("[data-next]").hidden = single;
  }

  grid.addEventListener("click", function (e) {
    var a = e.target.closest("[data-lightbox]");
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    opener = a;
    show(visibleLinks().indexOf(a));
    dialog.showModal();
  });

  dialog.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) dialog.close();
    else if (e.target.closest("[data-prev]")) show(current - 1);
    else if (e.target.closest("[data-next]")) show(current + 1);
    else if (e.target === dialog || e.target.hasAttribute("data-stage")) dialog.close();
  });

  dialog.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });

  dialog.addEventListener("close", function () {
    img.removeAttribute("src");
    img.removeAttribute("srcset");
    if (opener) opener.focus();
  });
})();
