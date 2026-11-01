renderNav("contact");

const id = Store.getId();
const contactInfo = document.getElementById("contactInfo");
const feedbackCard = document.getElementById("feedbackCard");
const feedbackForm = document.getElementById("feedbackForm");
const fbStatus = document.getElementById("fbStatus");
const fbSubmit = document.getElementById("fbSubmit");

function noPortfolio() {
  contactInfo.innerHTML = `
    <div class="card">
      <p class="muted">No portfolio found yet. Create one first to see contact details.</p>
      <a class="btn btn-ghost" href="index.html">Create a portfolio</a>
    </div>`;
  feedbackCard.hidden = true;
}

async function loadContact() {
  if (!id) return noPortfolio();
  try {
    const p = await api(`/api/portfolio/${encodeURIComponent(id)}`);
    const tel = String(p.phone || "").replace(/[^\d+]/g, "");
    contactInfo.innerHTML = `
      <a class="contact-card reveal" style="--i:1" href="tel:${esc(tel)}">
        <span class="label">Phone</span>
        <span class="value">${esc(p.phone)}</span>
      </a>
      <a class="contact-card reveal" style="--i:2" href="mailto:${esc(p.email)}">
        <span class="label">Email</span>
        <span class="value">${esc(p.email)}</span>
      </a>`;
    document.title = `Contact ${p.name} | My Portfolio`;
  } catch (err) {
    noPortfolio();
  }
}

function setStatus(text, type) {
  fbStatus.textContent = text;
  fbStatus.className = `message ${type || ""}`;
}

feedbackForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("");

  const checked = feedbackForm.querySelector('input[name="rating"]:checked');
  const message = document.getElementById("fbMessage").value.trim();

  if (!checked) return setStatus("Please choose a star rating.", "error");
  if (!message) return setStatus("Please write a short message.", "error");

  fbSubmit.disabled = true;
  fbSubmit.textContent = "Sending...";

  try {
    await api("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        portfolioId: id,
        rating: Number(checked.value),
        name: document.getElementById("fbName").value.trim(),
        message,
      }),
    });
    feedbackCard.innerHTML = `
      <div class="thanks">
        <h2>Thank you</h2>
        <p class="muted">Your feedback has been saved. It means a lot.</p>
        <a class="btn btn-ghost" href="portfolio.html?id=${encodeURIComponent(id)}">Back to portfolio</a>
      </div>`;
  } catch (err) {
    setStatus(err.message, "error");
    fbSubmit.disabled = false;
    fbSubmit.textContent = "Send feedback";
  }
});

loadContact();
