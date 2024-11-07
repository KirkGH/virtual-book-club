const pg = require("pg");
const express = require("express");
const app = express();
const path = require("path");
const axios = require("axios");

const port = 3000;
const hostname = "localhost";

const apiFile = require("../env.json");
const apiKey = apiFile["api_key"];
const baseUrl = "https://www.googleapis.com/books/v1/volumes";

const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.use(express.json());


// Route to serve the static HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "books", "index.html"));
});

// Route to handle book search requests with maxResults
app.get("/search", (req, res) => {
  const query = req.query.q;
  const maxResults = 40; // Set max results to the Google API limit of 40 items

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  axios
    .get(`${baseUrl}?q=${query}&key=${apiKey}&maxResults=${maxResults}`)
    .then(response => {
      res.status(200).json(response.data); // Send book data to the client
    })
    .catch(error => {
      if (error.response) {
        res.status(error.response.status).json({ error: error.response.data.error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    });
});


app.post("/threads", (req, res) => {
  // Title refers to title of the thread
  // For now we can make up book_id and user_account_id to just see if this works
  let book_id = req.body.book_id;
  let title = req.body.title;
  let book_club_id = req.body.book_club_id;
  let user_account_id = req.body.user_account_id;
  let comment = req.body.comment;

  if(typeof title !== 'string' || title.length > 15 || title.length < 1){
    res.status(400);
    return res.json({});
  }

  pool.query("INSERT INTO threads(book_id, created, user_account_id, book_club_id, title, comment) VALUES($1, CURRENT_TIMESTAMP, $2, $3, $4, $5)", [book_id, user_account_id, book_club_id, title, comment])
  .then(result => {
    res.status(200);
    return res.json({}); 
  })
  .catch(error => {
    console.error(error);
    res.status(500);
    res.json({}); 
  });
  
});

app.get("/threads", (req, res) => {
    // This is just a search of threads by book_id for now
    // we can use book_id 2 for this specifc check for now
  let book_id = req.query.book_id;

  if(book_id != "2"){
    pool.query("SELECT * FROM threads").then(result => {
      const row = result.rows.map(thread => ({
        book_id: thread.book_id,
        created: thread.created,
        user_id: thread.user_account_id,
        book_club_id: thread.book_club_id,
        title: thread.title,
        comment: thread.comment
      }));

      res.status(200);
      res.json({rows: row});
    })
    .catch(error => {
      res.status(500)
      res.json({});
    });

  } else {
    pool.query("SELECT * FROM threads WHERE book_id = $1", [book_id])
    .then(result => {
      const row = result.rows.map(thread => ({
        book_id: thread.book_id,
        created: thread.created,
        user_id: thread.user_account_id,
        book_club_id: thread.book_club_id,
        title: thread.title,
        comment: thread.comment
      }));

      res.status(200);
      res.json({rows: row});
    })
    .catch(error => {
      res.status(500)
      res.json({});
    });
  }
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
