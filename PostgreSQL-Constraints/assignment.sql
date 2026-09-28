--1
CREATE DATABASE bookstore_db;

CREATE TABLE authors (
    author_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    country VARCHAR(50) DEFAULT 'Unknown',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO
    authors (full_name, email, country)
VALUES
    (
        'George Orwell',
        'orwell@example.com',
        'United Kingdom'
    );

INSERT INTO
    authors (full_name, email)
VALUES
    ('Haruki Murakami', 'murakami@example.com');

INSERT INTO
    authors (full_name, email, country)
VALUES
    (
        'J.R.R. Tolkien',
        'tolkien@example.com',
        'United Kingdom'
    );

INSERT INTO
    authors (full_name, email)
VALUES
    ('Another Author', 'orwell@example.com');

--2
CREATE TABLE books (
    book_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    author_id INTEGER NOT NULL,
    title TEXT NOT NULL
);

ALTER TABLE
    books
ADD
    CONSTRAINT books_author_id_fkey FOREIGN KEY (author_id) REFERENCES authors(author_id);

ALTER TABLE
    books
ADD
    COLUMN price NUMERIC(8, 2) NOT NULL;

ALTER TABLE
    books
ADD
    CONSTRAINT books_price_check CHECK (price > 0);

ALTER TABLE
    books
ADD
    COLUMN pages INTEGER CHECK (pages > 0);

ALTER TABLE
    books
ADD
    COLUMN tags TEXT [];

ALTER TABLE
    books
ADD
    COLUMN published_on DATE NOT NULL;

INSERT INTO
    books (
        author_id,
        title,
        price,
        pages,
        tags,
        published_on
    )
VALUES
    (
        1,
        '1984',
        18.50,
        328,
        ARRAY ['fiction', 'classic'],
        '1949-06-08'
    );

SELECT
    *
FROM
    books;

INSERT INTO
    books (
        author_id,
        title,
        price,
        pages,
        tags,
        published_on
    )
VALUES
    (
        2,
        'Norwegian Wood',
        22.00,
        298,
        ARRAY ['fiction', 'romance'],
        '1987-09-04'
    );

INSERT INTO
    books (
        author_id,
        title,
        price,
        pages,
        tags,
        published_on
    )
VALUES
    (
        3,
        'The Hobbit',
        24.99,
        310,
        ARRAY ['fantasy', 'adventure'],
        '1937-09-21'
    );

INSERT INTO
    books (
        author_id,
        title,
        price,
        pages,
        tags,
        published_on
    )
VALUES
    (
        1,
        'Animal Farm',
        14.50,
        112,
        ARRAY ['fiction', 'satire'],
        '1945-08-17'
    );

INSERT INTO
    books (
        author_id,
        title,
        price,
        pages,
        tags,
        published_on
    )
VALUES
    (
        3,
        'The Lord of the Rings',
        35.00,
        1178,
        ARRAY ['fantasy', 'adventure', 'classic'],
        '1954-07-29'
    );

--3
CREATE INDEX idx_books_published_on ON books USING btree (published_on);

EXPLAIN ANALYZE
SELECT
    *
FROM
    books
WHERE
    published_on = '1949-06-08';

--4
CREATE INDEX idx_books_tags ON books USING gin (tags);

SELECT
    *
FROM
    books
WHERE
    tags @ > ARRAY ['fiction'];

EXPLAIN ANALYZE
SELECT
    *
FROM
    books
WHERE
    tags @ > ARRAY ['fiction'];

--5
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE book_signings (
    signing_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    author_id INTEGER NOT NULL,
    store_location TEXT NOT NULL,
    during TSTZRANGE NOT NULL
);

ALTER TABLE
    book_signings
ADD
    CONSTRAINT book_signings_author_id_fkey FOREIGN KEY (author_id) REFERENCES authors(author_id);

ALTER TABLE
    book_signings
ADD
    CONSTRAINT book_signings_no_overlap EXCLUDE USING gist (author_id WITH =, during WITH & &);

INSERT INTO
    book_signings (author_id, store_location, during)
VALUES
    (
        1,
        'Yerevan Bookstore',
        '[2026-10-01 10:00:00+04, 2026-10-01 12:00:00+04)'
    );

INSERT INTO
    book_signings (author_id, store_location, during)
VALUES
    (
        2,
        'Yerevan Bookstore',
        '[2026-10-01 10:00:00+04, 2026-10-01 12:00:00+04)'
    );

--6 bonus
ALTER TABLE
    authors
ADD
    COLUMN website TEXT;

ALTER TABLE
    authors
ADD
    CONSTRAINT authors_website_check CHECK (
        website IS NULL
        OR website LIKE 'https://%'
    );

UPDATE
    authors
SET
    website = 'https://www.george-orwell.org'
WHERE
    author_id = 1;

UPDATE
    authors
SET
    website = 'https://www.harukimurakami.com'
WHERE
    author_id = 2;

UPDATE
    authors
SET
    website = 'https://www.tolkien.co.uk'
WHERE
    author_id = 3;