CREATE DATABASE bookclub;
\c bookclub
DROP TABLE IF EXISTS threads;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS book_clubs;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS voting;
DROP TABLE IF EXISTS events;
CREATE TABLE threads (
	id SERIAL PRIMARY KEY,
    book_id int,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	user_account_id VARCHAR(15),
	book_club_id VARCHAR(25),
	title  VARCHAR(15),
    comment  VARCHAR(200)
);
CREATE TABLE posts (
    id SERIAL PRIMARY KEY, 
    thread_id INT NOT NULL,      
    parent_id INT DEFAULT NULL,         
    user_account_id VARCHAR(15) NOT NULL,
    content VARCHAR(500) NOT NULL,       
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE book_clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(15),
    genre VARCHAR(20),
    meetfrequency VARCHAR(20)
);
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    club_id INT REFERENCES book_clubs(id) ON DELETE CASCADE,
    user_id INT NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    club_id INT REFERENCES book_clubs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    discussion_date TIMESTAMP
);
CREATE TABLE voting (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    votes INTEGER DEFAULT 0
);
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  startTime VARCHAR(255) NOT NULL,
  endTime VARCHAR(255) NOT NULL
);