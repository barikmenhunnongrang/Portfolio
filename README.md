# My Portfolio

A simple, elegant portfolio website with three pages, all data stored in MongoDB.

1. **Create** (`index.html`): enter your name, age, about me, contact details, academic details, skills, projects and hobbies.
2. **Portfolio** (`portfolio.html`): a clean, attractive page built from those details.
3. **Contact** (`contact.html`): your phone number and email, plus a feedback form (star rating and message) about the website.

**Stack:** HTML, CSS, JavaScript, Node.js (Express), MongoDB (Mongoose)

## Project structure

```
portfolio-website/
├── package.json
├── server.js            # Express server, MongoDB models, API routes
└── public/
    ├── index.html       # Page 1: details form
    ├── form.js
    ├── portfolio.html   # Page 2: portfolio display
    ├── portfolio.js
    ├── contact.html     # Page 3: contact + feedback
    ├── contact.js
    ├── common.js        # Shared navigation and helpers
    └── style.css
```

## Run it from the Command Prompt (Windows)

1. Install [Node.js](https://nodejs.org) and [MongoDB Community Server](https://www.mongodb.com/try/download/community). If you chose "Install as a Service", MongoDB is already running. Otherwise start it in a separate Command Prompt window:
   ```
   mongod
   ```
2. Open a Command Prompt in the project folder and install the dependencies (first time only):
   ```
   cd path\to\portfolio-website
   npm install
   ```
3. Start the website:
   ```
   npm start
   ```
4. Open http://localhost:3000 in your browser.

To use a different database (for example MongoDB Atlas), set the connection string before starting:
```
set MONGO_URI=your-connection-string
npm start
```

On macOS/Linux, use `MONGO_URI="your-connection-string" npm start`.

## Viewing the data in MongoDB

In a new Command Prompt:
```
mongosh
use portfolio
db.portfolios.find().pretty()
db.feedbacks.find().pretty()
```

| Collection   | Contents                                                          |
|--------------|-------------------------------------------------------------------|
| `portfolios` | name, age, about, phone, email, academics, skills, projects, hobbies |
| `feedbacks`  | portfolioId, name, rating (1-5), message                          |

## API

| Method | Route                | Description                     |
|--------|----------------------|---------------------------------|
| POST   | `/api/portfolio`     | Save a portfolio, returns its id |
| GET    | `/api/portfolio/:id` | Fetch a portfolio by id         |
| POST   | `/api/feedback`      | Save website feedback           |
