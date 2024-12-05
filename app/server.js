require('dotenv').config({ path: '../.env' }); 

const axios = require("axios");
const express = require('express');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const pg = require('pg');
const path = require('path'); 
const session = require('express-session'); 

const app = express();

const port = 3000;
const hostname = "localhost";

const env = require("../env.json");
const apiKey = env["api_key"];
const baseUrl = "https://www.googleapis.com/books/v1/volumes";


const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.use(express.json());


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "searchBooks", "index.html"));
});

// Route to handle book search requests with genre filtering
app.get("/search", async (req, res) => {
  const { q, author, genre } = req.query;
  const maxResults = 40;

  // Build the query string
  let query = "";

  if (q) query += `${q}`;
  if (author) query += `+inauthor:${author}`;
  if (!q && !author && genre) query += `${genre}`; // Handle searching by genre only.

  if (!query) {
    return res.status(400).json({ error: "At least one search query (title, author, or genre) is required." });
  }

  try {
    const response = await axios.get(`${baseUrl}?q=${query}&key=${apiKey}&maxResults=${maxResults}`);
    let books = response.data.items || [];

    // Log fetched books for debugging
    console.log("Fetched Books:", books);

    // Filter books by genre if provided and the query includes title/author
    if (genre && (q || author)) {
      books = books.filter(book => {
        const categories = book.volumeInfo.categories || [];
        return categories.some(category =>
          category.toLowerCase().includes(genre.toLowerCase())
        );
      });
    }

    // Handle no results after filtering
    if (books.length === 0) {
      return res.status(200).json({
        items: [],
        message: `No results found.`,
      });
    }

    res.status(200).json({ items: books });
  } catch (error) {
    console.error("Error fetching books from API:", error.message);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

// Auth0 configuration
passport.use(
  new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/callback',
    },
    (accessToken, refreshToken, extraParams, profile, done) => {
      return done(null, profile);
    }
  )
);

// Passport session setup
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false, // Prevent sessions for unauthenticated users
    cookie: {
      secure: false, // Set this to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get('/login', passport.authenticate('auth0', {
  scope: 'openid email profile',
}));

app.get('/callback', passport.authenticate('auth0', { failureRedirect: '/' }), (req, res) => {
  req.session.save((err) => {
    if (err) {
      console.error('Session save error:', err);
    }
    res.redirect('/homepageAuth');
  });
});

app.get('/homepageAuth', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'homePage', 'homepageAuth.html'));
});

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'profile', 'profile.html'));
});

app.get('/homepage', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/homepageAuth');
  }
  res.sendFile(path.join(__dirname, 'public', 'homepage', 'homepage.html'));
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }

    // Clear cookies
    res.clearCookie('connect.sid'); 

    // Redirect to Auth0 logout URL
    const logoutURL = `https://${process.env.AUTH0_DOMAIN}/v2/logout?returnTo=${encodeURIComponent('http://localhost:3000/homepage')}&client_id=${process.env.AUTH0_CLIENT_ID}`;
    res.redirect(logoutURL);
  });
});

app.use((req, res, next) => {
  console.log(`Path: ${req.path}, Authenticated: ${req.isAuthenticated()}`);
  next();
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

app.post('/createBookClub', async (req, res) => {
  const { name, description, created_by, genre, meetfrequency } = req.body;

  try {
    await pool.query(
      `INSERT INTO book_clubs (name, description, created_at, created_by, genre, meetfrequency) 
       VALUES ($1, $2, NOW(), $3, $4, $5)`,
      [name, description, created_by, genre, meetfrequency]
    );
    res.status(200).send("Book club created successfully");
  } catch (error) {
    console.error("Error saving book club:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post('/voteForBook', async (req, res) => {
  const { title } = req.body;

  try {
    const result = await pool.query("SELECT id FROM voting WHERE title = $1", [title]);

    if (result.rows.length === 0) {
      // If the book does not exist, insert it with a vote count of 1
      await pool.query("INSERT INTO voting (title, votes) VALUES ($1, 1)", [title]);
    } else {
      console.log("In else");
    await pool.query(
      `UPDATE voting SET votes = votes + 1 WHERE title = $1`,
      [title]
    );
  }
    res.status(200).send("Vote updated successfully");
  } catch (error) {
    console.error("Error updating vote count:", error);
    res.status(500).send("An error occured when updating vote.");
  }
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
