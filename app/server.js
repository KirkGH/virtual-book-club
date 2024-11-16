const pg = require("pg");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.use(express.json());


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

  pool.query("INSERT INTO threads(book_id, created, user_account_id, book_club_id, title, comment) VALUES($1, CURRENT_TIMESTAMP, $2, $3, $4, $5) RETURNING id", [book_id, user_account_id, book_club_id, title, comment])
  .then(result => {
    res.status(200);
    return res.json({thread_id: result.rows[0].id }); 
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

app.post("/posts", async (req, res) => {
  const { thread_id, user_account_id, content } = req.body;
  
  pool.query(
    `INSERT INTO posts (thread_id, user_account_id, content)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [thread_id, user_account_id, content]
  )
    .then((result) => {
      res.json({ reply_id: result.rows[0].id, message: "Post added successfully" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Failed to add post." });
    });
});

app.delete("/threads/:id", (req, res) => {
  const threadId = req.params.id;

  pool.query("DELETE FROM threads WHERE id = $1", [threadId])
    .then((result) => {
      res.status(200).json({ message: "Thread deleted successfully" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Failed to delete thread." });
    });
});

app.put("/threads/:id", (req, res) => {
  const comment = req.body.content;
  const threadId = req.params.id;

  pool.query(
    `UPDATE threads
     SET comment = $1
     WHERE id = $2`,
    [comment, threadId]
  )
    .then((result) => {
      res.status(200).json({ message: "Thread updated successfully" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Failed to update thread." });
    });
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
