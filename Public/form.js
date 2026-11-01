renderNav("create");

const academicList = document.getElementById("academicList");
const projectList = document.getElementById("projectList");
const message = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");

function addAcademicRow() {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `
    <div class="grid">
      <label class="field">Degree / course <input type="text" class="degree" maxlength="120" placeholder="B.Tech Computer Science" /></label>
      <label class="field">Institution <input type="text" class="institution" maxlength="120" placeholder="University / school" /></label>
      <label class="field">Year <input type="text" class="year" maxlength="40" placeholder="2022 - 2026" /></label>
      <label class="field">Score <input type="text" class="score" maxlength="40" placeholder="8.5 CGPA" /></label>
    </div>
    <button type="button" class="btn-remove">Remove</button>`;
  academicList.appendChild(row);
}

function addProjectRow() {
  const row = document.createElement("div");
  row.className = "row";
  row.innerHTML = `
    <div class="grid">
      <label class="field">Title <input type="text" class="title" maxlength="100" placeholder="Project name" /></label>
      <label class="field">Link (optional) <input type="url" class="link" maxlength="300" placeholder="https://github.com/..." /></label>
    </div>
    <label class="field">Description <textarea class="description" rows="2" maxlength="600" placeholder="What does it do?"></textarea></label>
    <button type="button" class="btn-remove">Remove</button>`;
  projectList.appendChild(row);
}

document.getElementById("addAcademic").addEventListener("click", addAcademicRow);
document.getElementById("addProject").addEventListener("click", addProjectRow);

// Remove buttons (event delegation)
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-remove")) {
    e.target.closest(".row").remove();
  }
});

// Start with one row of each
addAcademicRow();
addProjectRow();

const splitList = (value) => value.split(",").map((s) => s.trim()).filter(Boolean);

function showError(text) {
  message.textContent = text;
  message.className = "message error";
}

document.getElementById("portfolioForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  message.textContent = "";
  message.className = "message";

  const name = document.getElementById("name").value.trim();
  const age = Number(document.getElementById("age").value);
  const about = document.getElementById("about").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !age || !about) return showError("Please fill in your name, age and about me.");
  if (!phone || !email) return showError("Please add your phone number and email.");

  const academics = [...academicList.querySelectorAll(".row")]
    .map((r) => ({
      degree: r.querySelector(".degree").value.trim(),
      institution: r.querySelector(".institution").value.trim(),
      year: r.querySelector(".year").value.trim(),
      score: r.querySelector(".score").value.trim(),
    }))
    .filter((a) => a.degree || a.institution);

  const projects = [...projectList.querySelectorAll(".row")]
    .map((r) => ({
      title: r.querySelector(".title").value.trim(),
      link: r.querySelector(".link").value.trim(),
      description: r.querySelector(".description").value.trim(),
    }))
    .filter((p) => p.title);

  const payload = {
    name,
    age,
    about,
    phone,
    email,
    academics,
    skills: splitList(document.getElementById("skills").value),
    projects,
    hobbies: splitList(document.getElementById("hobbies").value),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";

  try {
    const data = await api("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    Store.setId(data.id);
    window.location.href = `portfolio.html?id=${encodeURIComponent(data.id)}`;
  } catch (err) {
    showError(err.message);
    submitBtn.disabled = false;
    submitBtn.textContent = "Create my portfolio";
  }
});
