// Shared helpers used by every page

const Store = {
  setId(id) {
    try { localStorage.setItem("portfolioId", id); } catch {}
  },
  getId() {
    const fromUrl = new URLSearchParams(window.location.search).get("id");
    if (fromUrl) {
      Store.setId(fromUrl);
      return fromUrl;
    }
    try { return localStorage.getItem("portfolioId"); } catch { return null; }
  },
};

// Escape user text before inserting it into HTML
function esc(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}

// Top navigation bar
function renderNav(active) {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const id = Store.getId();
  const q = id ? `?id=${encodeURIComponent(id)}` : "";
  const links = [
    { key: "create", label: "Create", href: "index.html", show: true },
    { key: "portfolio", label: "Portfolio", href: `portfolio.html${q}`, show: !!id },
    { key: "contact", label: "Contact", href: `contact.html${q}`, show: !!id },
  ];
  nav.innerHTML = `
    <div class="nav-inner">
      <a class="brand" href="index.html">My Portfolio</a>
      <ul>
        ${links
          .filter((l) => l.show)
          .map(
            (l) =>
              `<li><a href="${l.href}" class="${l.key === active ? "active" : ""}"${
                l.key === active ? ' aria-current="page"' : ""
              }>${l.label}</a></li>`
          )
          .join("")}
      </ul>
    </div>`;
}

// fetch wrapper that throws a readable error
async function api(url, options) {
  const res = await fetch(url, options);
  let data = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

// Footer year
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
