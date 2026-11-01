const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/portfolio";

app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "public")));

// ---------- Helpers ----------
const text = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v, maxItems, maxLen) =>
  Array.isArray(v) ? v.map((x) => text(x, maxLen)).filter(Boolean).slice(0, maxItems) : [];

const ID_RE = /^[a-f\d]{24}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

// ---------- Schemas ----------
const portfolioSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    about: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    academics: [
      {
        degree: String,
        institution: String,
        year: String,
        score: String,
      },
    ],
    skills: [String],
    projects: [
      {
        title: String,
        description: String,
        link: String,
      },
    ],
    hobbies: [String],
  },
  { timestamps: true }
);

const feedbackSchema = new mongoose.Schema(
  {
    portfolioId: { type: mongoose.Schema.Types.ObjectId, ref: "Portfolio", required: true },
    name: { type: String, trim: true, default: "Anonymous" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Portfolio = mongoose.model("Portfolio", portfolioSchema); // collection: portfolios
const Feedback = mongoose.model("Feedback", feedbackSchema); // collection: feedbacks

// ---------- Routes ----------
// Save the details entered on page 1
app.post("/api/portfolio", async (req, res, next) => {
  try {
    const b = req.body || {};
    const age = Number(b.age);

    const data = {
      name: text(b.name, 80),
      age,
      about: text(b.about, 1500),
      phone: text(b.phone, 20),
      email: text(b.email, 120).toLowerCase(),
      academics: (Array.isArray(b.academics) ? b.academics : [])
        .slice(0, 10)
        .map((a) => ({
          degree: text(a && a.degree, 120),
          institution: text(a && a.institution, 120),
          year: text(a && a.year, 40),
          score: text(a && a.score, 40),
        }))
        .filter((a) => a.degree || a.institution),
      skills: list(b.skills, 40, 50),
      projects: (Array.isArray(b.projects) ? b.projects : [])
        .slice(0, 10)
        .map((p) => {
          const link = text(p && p.link, 300);
          return {
            title: text(p && p.title, 100),
            description: text(p && p.description, 600),
            link: /^https?:\/\//i.test(link) ? link : "",
          };
        })
        .filter((p) => p.title),
      hobbies: list(b.hobbies, 30, 50),
    };

    if (!data.name) return res.status(400).json({ error: "Please enter your name." });
    if (!Number.isInteger(age) || age < 1 || age > 120)
      return res.status(400).json({ error: "Please enter a valid age." });
    if (!data.about) return res.status(400).json({ error: "Please write a short about me." });
    if (!PHONE_RE.test(data.phone))
      return res.status(400).json({ error: "Please enter a valid phone number." });
    if (!EMAIL_RE.test(data.email))
      return res.status(400).json({ error: "Please enter a valid email address." });

    const doc = await Portfolio.create(data);
    res.status(201).json({ id: doc._id });
  } catch (err) {
    next(err);
  }
});

// Fetch a portfolio (used by the portfolio page and the contact page)
app.get("/api/portfolio/:id", async (req, res, next) => {
  try {
    if (!ID_RE.test(req.params.id))
      return res.status(400).json({ error: "Invalid portfolio id." });
    const doc = await Portfolio.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Portfolio not found." });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

// Save feedback about the website (page 3)
app.post("/api/feedback", async (req, res, next) => {
  try {
    const b = req.body || {};
    const rating = Number(b.rating);
    const data = {
      portfolioId: text(b.portfolioId, 24),
      name: text(b.name, 80) || "Anonymous",
      rating,
      message: text(b.message, 1000),
    };

    if (!ID_RE.test(data.portfolioId))
      return res.status(400).json({ error: "Please create a portfolio first." });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return res.status(400).json({ error: "Please choose a star rating." });
    if (!data.message)
      return res.status(400).json({ error: "Please write a short message." });

    const exists = await Portfolio.exists({ _id: data.portfolioId });
    if (!exists) return res.status(404).json({ error: "Portfolio not found." });

    await Feedback.create(data);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- Error handling ----------
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed")
    return res.status(400).json({ error: "Invalid request." });
  if (err.name === "ValidationError") return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: "Server error. Please try again." });
});

// ---------- Start ----------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`My Portfolio is running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    console.error("Is MongoDB running? Start it, or set MONGO_URI to your connection string.");
    process.exit(1);
  });
