require('dotenv').config({ path: '../.env' }); // Provide the correct path to .env file

const express = require('express');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const pg = require('pg');
const path = require('path'); // Add this import to resolve path
const session = require('express-session'); // We still need express-session to manage sessions

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

// Auth0 configuration for Passport.js
passport.use(
  new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN, 
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET, 
      callbackURL: 'http://localhost:3000/homePageLoggedIn', 
    },
    (accessToken, refreshToken, extraParams, profile, done) => {
      return done(null, profile);
    }
  )
);

// Passport session setup
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Express session configuration to maintain login sessions
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/login', passport.authenticate('auth0'));

// Callback route for Auth0 to redirect after successful authentication
app.get('/callback', passport.authenticate('auth0', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/homePageLoggedIn');
});

app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`
      <h1>Welcome, ${req.user.name}</h1>
      <p>Your email: ${req.user.email}</p>
      <a href="/logout">Logout</a>
    `);
  } else {
    res.redirect('/login');
  }
});

app.get("/homepage", (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, "public", "homePage", "homePageLoggedIn.html"));
  } else {
    res.sendFile(path.join(__dirname, "public", "homePage", "homePage.html"));
  }
});

// New route for '/homePageLoggedIn' after Auth0 login
app.get('/homePageLoggedIn', (req, res) => {
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'public', 'homePage', 'homePageLoggedIn.html'));
  } else {
    res.redirect('/login'); 
  }
});

// Logout route - logs the user out using Passport.js
app.get('/logout', (req, res) => {
  req.logout((err) => {
    res.redirect('/homepage'); 
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
