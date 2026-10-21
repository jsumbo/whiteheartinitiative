// Counts the numbers band up from zero when it scrolls into view. Plain JavaScript, no libraries.
(function () {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var items = document.querySelectorAll("[data-count]:not([data-counted])");
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      run(entry.target);
    });
  }, { threshold: 0.4 });

  items.forEach(function (el) {
    var match = el.getAttribute("data-count").match(/^([^\d]*)([\d,.]+)(.*)$/);
    if (!match) return;
    el.setAttribute("data-counted", "");
    el._parts = { before: match[1], target: parseFloat(match[2].replace(/,/g, "")), commas: match[2].indexOf(",") > -1, after: match[3] };
    observer.observe(el);
  });

  function format(p, n) {
    var s = String(Math.round(n));
    if (p.commas) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return p.before + s + p.after;
  }

  function run(el) {
    var p = el._parts;
    var start = null;
    var duration = 1400;
    function step(t) {
      if (start === null) start = t;
      var progress = Math.min(1, (t - start) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(p, p.target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = el.getAttribute("data-count");
    }
    requestAnimationFrame(step);
  }
})();
