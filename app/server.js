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

const cors = require('cors');
app.use(cors());

const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.static("public"));
app.use(express.json());

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


// Route to fetch most popular books
app.get('/popularBooks', async (req, res) => {
  try {
    const query = `${baseUrl}?q=subject:fiction&orderBy=relevance&key=${apiKey}&maxResults=40`;

    const response = await axios.get(query);
    console.log("API Response:", response.data);  // Log API response to check what is returned
    const books = response.data.items || [];

    res.status(200).json({ items: books });
  } catch (error) {
    console.error('Error fetching popular books:', error.message);
    res.status(500).json({ error: 'Failed to fetch popular books.' });
  }
});

// Auth0 configuration
passport.use(
  new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL:'http://localhost:3000/callback',
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

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.get('/bookClub/clubCreation/createBookClub', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bookClub', 'clubCreation', 'createBookClub.html'));
});

app.get('/bookClub/clubCreation/bookClubHome/bookClubHome', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bookClub', 'clubCreation', 'bookClubHome', 'bookClubHome.html'));
});

app.get('/discussionBoard', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'discussionBoard', 'index.html'));
});

app.get('/bookSelection', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '/bookSelection', 'setBookChoices.html'));
});

app.get('/votingPage', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '/votingPage', 'voteForBook.html'));
});

app.get('/calendar', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'calendar', 'clubOwnerEvents.html'));
});

app.get('/calendar/events', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'calendar', 'events.html'));
});

app.get('/calendar/deleteEvents', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'calendar', 'deleteEvents.html'));
});

app.get('/homepageAuth', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'homePage', 'homepageAuth.html'));
});

app.get('/calendar/clubEvents', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', '/calendar', 'clubEvents.html'));
});

app.get('/bookClub/joinBookClub/joinBookClub', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bookClub', 'joinBookClub', 'joinBookClub.html'));
});

app.get('/user', (req, res) => {
  if (req.user) {
    res.json({ name: req.user.name });
  } else {
    res.status(401).json({ error: 'User not logged in' });
  }
});

app.get("/searchBooks", ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "searchBooks", "index.html"));
});

app.get('/profile', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile', 'profile.html'));
});

app.get('/homePage/homePage', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/homepageAuth');
  }
  res.sendFile(path.join(__dirname, 'public', 'homePage', 'homePage.html'));
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }

    // Clear cookies
    res.clearCookie('connect.sid');

    const returnTo = process.env.NODE_ENV === 'production' 
      ? 'https://virtualbookclub001.fly.dev/homePage/homePage' 
      : 'http://localhost:3000/homePage/homePage';

    const logoutURL = `https://${process.env.AUTH0_DOMAIN}/v2/logout?returnTo=${encodeURIComponent(returnTo)}&client_id=${process.env.AUTH0_CLIENT_ID}`;
    
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

app.get("/bookClubHome", async (req, res) => {
  try {
    const bookClubData = await pool.query("SELECT * FROM book_clubs WHERE id = $1", [1]);
    res.json(bookClubData.rows[0]); 
  } catch (error) {
    console.error("Error retrieving book club data:", error);
    res.status(500).json({ error: "Internal server error" });
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

// Get all events for creating
app.get('/events', async (req, res) => {
  try {
    // Query for events
    const eventsQuery = 'SELECT * FROM events ORDER BY startTime ASC';
    const eventsResult = await pool.query(eventsQuery);

    // Query for club names
    const clubsQuery = 'SELECT name FROM book_clubs';
    const clubsResult = await pool.query(clubsQuery);

    // Combine the results
    res.status(200).json({
      events: eventsResult.rows, // Events data
      clubs: clubsResult.rows   // Club names data
    });
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).send("Error fetching data from database.");
  }
});

// Add a new event
app.post('/events', async (req, res) => {
  const { club, title, startTime, endTime } = req.body;
  console.log('Received POST request with body:', req.body);

  if (typeof club !== 'string' || club.valueOf() === 'Please select your club\'s name') {
    console.error("Invalid club name:", club);
    return res.status(400).send("Club name is required.")
  }
  if (typeof title !== 'string' || title.trim().length === 0) {
    console.error("Invalid title:", title);
    return res.status(400).send("Invalid title.");
  }
  if (!startTime || !endTime) {
    console.error("Start and end times are missing:", { startTime, endTime });
    return res.status(400).send("Start and end times are required.");
  }

  try {
    // Use correct column names in the query
    const result = await pool.query(
      'INSERT INTO events (club, title, starttime, endtime) VALUES ($1, $2, $3, $4) RETURNING *',
      [ club, title, startTime, endTime]
    );
    console.log('Inserted event:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding event to database:", error);
    res.status(500).send("Error adding event to database.");
  }
});

// Get all events for deleting
// Get events based on the selected club
app.get('/deleteEvents', async (req, res) => {
  const clubName = req.query.clubName; // Get clubName from query parameters

  try {
    if (clubName) {
      // Fetch events for the selected club
      const eventsQuery = 'SELECT title FROM events WHERE club = $1';
      const eventsResult = await pool.query(eventsQuery, [clubName]);

      return res.status(200).json({ events: eventsResult.rows });
    }

    // Default: Fetch all clubs and events
    const clubsQuery = 'SELECT name FROM book_clubs';
    const clubsResult = await pool.query(clubsQuery);

    const eventsQuery = 'SELECT * FROM events ORDER BY startTime ASC';
    const eventsResult = await pool.query(eventsQuery);

    res.status(200).json({
      clubs: clubsResult.rows,
      events: eventsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching data from database:', error);
    res.status(500).send('Error fetching data from database.');
  }
});

// Delete an event
app.post('/deleteEvents', async (req, res) => {
  const { club, title } = req.body;

  console.log('Received POST request with body:', req.body);

  if (!club || club === "Please select your club's name") {
    console.error("Invalid club name:", club);
    return res.status(400).send("Club name is required.");
  }
  if (!title || title === "Please select an event") {
    console.error("Invalid event title:", title);
    return res.status(400).send("Event title is required.");
  }

  try {
    // Use parameterized query to prevent SQL injection
    const query = 'DELETE FROM events WHERE club = $1 AND title = $2 RETURNING *';
    const result = await pool.query(query, [club, title]);

    if (result.rowCount === 0) {
      console.log("No event found to delete for club:", club, "and title:", title);
      return res.status(404).send("No event found with the provided club and title.");
    }

    console.log('Deleted event:', result.rows[0]);
    res.status(200).json({ message: 'Event deleted successfully', deletedEvent: result.rows[0] });
  } catch (error) {
    console.error("Error deleting event from database:", error);
    res.status(500).send("Error deleting event from database.");
  }
});

// Get all events to display
app.get('/clubEvents', async (req, res) => {
  const clubName = req.query.clubName;

  try {
    if (clubName) {
      const eventsQuery = 'SELECT title, startTime, endTime FROM events WHERE club = $1 ORDER BY startTime ASC';
      const eventsResult = await pool.query(eventsQuery, [clubName]);

      return res.status(200).json({ events: eventsResult.rows });
    }

    // Default: Fetch all clubs
    const clubsQuery = 'SELECT name FROM book_clubs';
    const clubsResult = await pool.query(clubsQuery);

    res.status(200).json({
      clubs: clubsResult.rows,
    });
  } catch (error) {
    console.error('Error fetching data from database:', error);
    res.status(500).send('Error fetching data from database.');
  }
});

app.get('/clubOwnerEvents', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'calendar', 'clubOwnerEvents.html'));
});


app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});