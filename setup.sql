CREATE DATABASE bookclub;
\c bookclub
CREATE TABLE threads (
	id SERIAL PRIMARY KEY,
    book_id int,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	user_account_id VARCHAR(15),
	book_club_id VARCHAR(25),
	title  VARCHAR(15),
    comment  VARCHAR(200)
);