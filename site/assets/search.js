(function () {
  var input = document.getElementById("site-search-input");
  var box = document.getElementById("site-search-results");
  if (!input || !box || !window.SITE_SEARCH_INDEX) return;

  var index = window.SITE_SEARCH_INDEX.map(function (entry) {
    return {
      entry: entry,
      haystackTitle: entry.title.toLowerCase(),
      haystackAll: (entry.title + " " + (entry.section || "") + " " + (entry.keywords || "")).toLowerCase()
    };
  });

  var activeIndex = -1;
  var currentResults = [];

  function score(item, words) {
    var s = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (item.haystackTitle.indexOf(w) !== -1) s += 3;
      else if (item.haystackAll.indexOf(w) !== -1) s += 1;
      else return -1;
    }
    return s;
  }

  function search(query) {
    var words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    var scored = [];
    for (var i = 0; i < index.length; i++) {
      var s = score(index[i], words);
      if (s > 0) scored.push({ entry: index[i].entry, s: s });
    }
    scored.sort(function (a, b) { return b.s - a.s; });
    return scored.slice(0, 8).map(function (r) { return r.entry; });
  }

  function render(results) {
    box.innerHTML = "";
    activeIndex = -1;
    currentResults = results;

    if (!results.length) {
      var empty = document.createElement("div");
      empty.className = "search-empty";
      empty.textContent = "Ничего не найдено";
      box.appendChild(empty);
      box.hidden = false;
      return;
    }

    results.forEach(function (entry, i) {
      var a = document.createElement("a");
      a.className = "search-item";
      a.href = entry.page + (entry.anchor ? "#" + entry.anchor : "");
      a.setAttribute("role", "option");
      a.dataset.index = i;

      var t = document.createElement("span");
      t.className = "t";
      t.textContent = entry.title;
      a.appendChild(t);

      var p = document.createElement("span");
      p.className = "p";
      p.textContent = entry.section;
      a.appendChild(p);

      box.appendChild(a);
    });

    box.hidden = false;
  }

  function close() {
    box.hidden = true;
    box.innerHTML = "";
    activeIndex = -1;
    currentResults = [];
  }

  function setActive(i) {
    var items = box.querySelectorAll(".search-item");
    items.forEach(function (el) { el.classList.remove("active"); });
    if (i >= 0 && i < items.length) {
      items[i].classList.add("active");
      items[i].scrollIntoView({ block: "nearest" });
    }
    activeIndex = i;
  }

  input.addEventListener("input", function () {
    var q = input.value;
    if (q.trim().length < 2) { close(); return; }
    render(search(q));
  });

  input.addEventListener("keydown", function (e) {
    var items = box.querySelectorAll(".search-item");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!items.length) return;
      setActive((activeIndex + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!items.length) return;
      setActive((activeIndex - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && currentResults[activeIndex]) {
        e.preventDefault();
        window.location.href = items[activeIndex].getAttribute("href");
      } else if (currentResults.length) {
        e.preventDefault();
        window.location.href = items[0].getAttribute("href");
      }
    } else if (e.key === "Escape") {
      input.value = "";
      close();
      input.blur();
    }
  });

  document.addEventListener("click", function (e) {
    if (e.target !== input && !box.contains(e.target)) close();
  });
})();
