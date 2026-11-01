renderNav("portfolio");

const root = document.getElementById("portfolio");
const id = Store.getId();

function safeLink(url) {
  return /^https?:\/\//i.test(url || "") ? url : "";
}

function showError(text) {
  root.innerHTML = `
    <p class="message error">${esc(text)}</p>
    <a class="btn btn-ghost" href="index.html">Create a portfolio</a>`;
}

async function load() {
  if (!id) return showError("No portfolio found yet. Create one first.");
  try {
    const p = await api(`/api/portfolio/${encodeURIComponent(id)}`);
    render(p);
  } catch (err) {
    showError(err.message);
  }
}

function initials(name) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "?"
  );
}

function section(title, body, i) {
  return `
    <section class="block reveal" style="--i:${i}">
      <h2 class="section-title">${title}</h2>
      ${body}
    </section>`;
}

function render(p) {
  document.title = `${p.name} | My Portfolio`;
  let i = 1;

  const academics = (p.academics || [])
    .map(
      (a) => `
      <div class="item">
        <h3>${esc(a.degree)}</h3>
        <p class="meta">${[a.institution, a.year, a.score].filter(Boolean).map(esc).join(" &middot; ")}</p>
      </div>`
    )
    .join("");

  const projects = (p.projects || [])
    .map((pr) => {
      const link = safeLink(pr.link);
      return `
      <article class="project">
        <h3>${esc(pr.title)}</h3>
        ${pr.description ? `<p>${esc(pr.description)}</p>` : ""}
        ${link ? `<a href="${esc(link)}" target="_blank" rel="noopener noreferrer">View project &rarr;</a>` : ""}
      </article>`;
    })
    .join("");

  const chips = (list, cls = "") =>
    `<div class="chips">${(list || []).map((s) => `<span class="chip ${cls}">${esc(s)}</span>`).join("")}</div>`;

  root.innerHTML = `
    <header class="hero reveal">
      <div class="monogram" aria-hidden="true">${esc(initials(p.name))}</div>
      <h1>${esc(p.name)}</h1>
      <p class="eyebrow">Age ${esc(p.age)}</p>
      <p class="intro">${esc(p.about)}</p>
    </header>

    ${academics ? section("Academic details", `<div class="timeline">${academics}</div>`, i++) : ""}
    ${p.skills && p.skills.length ? section("Skills", chips(p.skills), i++) : ""}
    ${projects ? section("Projects", `<div class="projects">${projects}</div>`, i++) : ""}
    ${p.hobbies && p.hobbies.length ? section("Hobbies", chips(p.hobbies, "warm"), i++) : ""}

    <div class="cta reveal" style="--i:${i}">
      <p>Want to get in touch, or tell me what you think of this site?</p>
      <a class="btn btn-primary" href="contact.html?id=${encodeURIComponent(id)}">Contact &amp; feedback</a>
    </div>
  `;
}

load();
