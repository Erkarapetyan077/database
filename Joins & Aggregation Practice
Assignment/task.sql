-- 1.
CREATE TABLE authors (
    author_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    bio TEXT
);

CREATE TABLE articles (
    article_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    author_id INTEGER REFERENCES authors(author_id),
    published_on DATE NOT NULL,
    views INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE comments (
    comment_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    article_id INTEGER REFERENCES articles(article_id),
    commenter_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO
    authors (name, bio)
VALUES
    (
        'Maria Chen',
        'Writes about frontend performance'
    ),
    ('David Okafor', 'Backend and databases'),
    ('Sana Malik', 'DevOps and infrastructure'),
    ('Tom Reyes', 'Career advice for developers');

SELECT
    *
FROM
    authors;

INSERT INTO
    articles (title, author_id, published_on, views)
VALUES
    ('Speeding Up Your CSS', 1, '2026-01-05', 820),
    ('Lazy Loading Images', 1, '2026-01-20', 410),
    ('Indexing 101', 2, '2026-01-10', 1500),
    ('Understanding Joins', 2, '2026-02-01', 2100),
    ('Zero-Downtime Deploys', 3, '2026-01-15', 690),
    ('Docker for Beginners', 3, '2026-02-05', 950),
    ('Writing a Great Resume', 4, '2026-01-25', 300),
    ('Acing the Interview', 4, '2026-02-10', 0);

SELECT
    *
FROM
    articles;

INSERT INTO
    comments (article_id, commenter_name)
VALUES
    (1, 'Alex'),
    (1, 'Priya'),
    (3, 'Jordan'),
    (3, 'Sam'),
    (3, 'Lee'),
    (4, 'Alex'),
    (4, 'Priya'),
    (4, 'Jordan'),
    (4, 'Sam'),
    (5, 'Lee'),
    (6, 'Alex'),
    (7, 'Priya');

SELECT
    *
FROM
    comments;

SELECT
    articles.title,
    authors.name,
    articles.views
FROM
    articles
    INNER JOIN authors ON articles.author_id = authors.author_id;

SELECT
    articles.title,
    comments.commenter_name
FROM
    articles
    LEFT JOIN comments ON articles.article_id = comments.article_id;

INSERT INTO
    authors (name, bio)
VALUES
    ('Test Author', 'Temporary author');

SELECT
    authors.name,
    articles.title
FROM
    authors
    LEFT JOIN articles ON authors.author_id = articles.author_id;

DELETE FROM
    authors
WHERE
    name = 'Test Author';

-- 2.
SELECT
    authors.name,
    SUM(articles.views)
FROM
    authors
    JOIN articles ON authors.author_id = articles.author_id
GROUP BY
    authors.name;

SELECT
    authors.name,
    SUM(articles.views)
FROM
    authors
    JOIN articles ON authors.author_id = articles.author_id
GROUP BY
    authors.name
HAVING
    SUM(articles.views) > 1000;

SELECT
    articles.title,
    COUNT(comments.comment_id)
FROM
    articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
GROUP BY
    articles.title;

SELECT
    articles.title,
    COUNT(comments.comment_id)
FROM
    articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
GROUP BY
    articles.title
ORDER BY
    COUNT(comments.comment_id) DESC
LIMIT
    1;

-- 3.
CREATE TABLE writers (
    writer_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT
);

INSERT INTO
    writers (name, country)
VALUES
    ('Elena Vasquez', 'Spain'),
    ('Kenji Watanabe', 'Japan'),
    ('Grace Okonkwo', 'Nigeria');

CREATE TABLE books (
    book_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    writer_id INTEGER REFERENCES writers(writer_id),
    published_year INTEGER,
    price NUMERIC(6, 2) NOT NULL CHECK (price > 0)
);

INSERT INTO
    books (title, writer_id, published_year, price)
VALUES
    ('The Long Horizon', 1, 2019, 18.99),
    ('Small Fires', 1, 2022, 16.50),
    ('Paper Lanterns', 2, 2018, 14.00),
    ('The Quiet Station', 2, 2021, 19.50),
    ('River of Names', 3, 2020, 15.75),
    ('Unfinished Maps', 3, 2023, 21.00);

CREATE TABLE reviews (
    review_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    book_id INTEGER REFERENCES books(book_id),
    rating INTEGER NOT NULL CHECK (
        rating BETWEEN 1
        AND 5
    ),
    review_text TEXT
);

INSERT INTO
    reviews (book_id, rating, review_text)
VALUES
    (1, 5, 'Excellent book'),
    (1, 4, 'Very enjoyable'),
    (1, 5, 'Highly recommended'),
    (2, 3, 'Good but slow'),
    (2, 4, 'Interesting story'),
    (3, 5, 'Beautiful writing'),
    (3, 5, 'Loved it'),
    (4, 2, 'Too slow'),
    (4, 3, 'Decent book'),
    (5, 4, 'Strong characters'),
    (5, 5, 'Great story'),
    (5, 4, 'Enjoyed it');

SELECT
    books.title,
    writers.name,
    books.price
FROM
    books
    INNER JOIN writers ON books.writer_id = writers.writer_id;

SELECT
    books.title,
    reviews.rating
FROM
    books
    LEFT JOIN reviews ON books.book_id = reviews.book_id;

INSERT INTO
    writers (name, country)
VALUES
    ('Test Writer', 'Unknown');

SELECT
    writers.name,
    COUNT(books.book_id)
FROM
    writers
    LEFT JOIN books ON writers.writer_id = books.writer_id
GROUP BY
    writers.name;

DELETE FROM
    writers
WHERE
    name = 'Test Writer';

-- 4.
SELECT
    books.title,
    AVG(reviews.rating),
    COUNT(reviews.review_id)
FROM
    books
    LEFT JOIN reviews ON books.book_id = reviews.book_id
GROUP BY
    books.title;

SELECT
    books.title,
    AVG(reviews.rating),
    COUNT(reviews.review_id)
FROM
    books
    LEFT JOIN reviews ON books.book_id = reviews.book_id
GROUP BY
    books.title
HAVING
    AVG(reviews.rating) >= 4;

SELECT
    books.title,
    COUNT(reviews.review_id)
FROM
    books
    LEFT JOIN reviews ON books.book_id = reviews.book_id
GROUP BY
    books.title
HAVING
    COUNT(reviews.review_id) >= 2;

-- 5.
SELECT
    writers.name,
    AVG(reviews.rating)
FROM
    writers
    JOIN books ON writers.writer_id = books.writer_id
    JOIN reviews ON books.book_id = reviews.book_id
GROUP BY
    writers.name;

SELECT
    writers.name,
    AVG(reviews.rating)
FROM
    writers
    JOIN books ON writers.writer_id = books.writer_id
    JOIN reviews ON books.book_id = reviews.book_id
GROUP BY
    writers.name
HAVING
    AVG(reviews.rating) > 4;

-- 6.
SELECT
    authors.name,
    SUM(articles.views)
FROM
    authors
    JOIN articles ON authors.author_id = articles.author_id
GROUP BY
    authors.name
ORDER BY
    SUM(articles.views) DESC
LIMIT
    1;

SELECT
    books.title,
    AVG(reviews.rating)
FROM
    books
    JOIN reviews ON books.book_id = reviews.book_id
GROUP BY
    books.title
HAVING
    COUNT(reviews.review_id) >= 2
ORDER BY
    AVG(reviews.rating) DESC
LIMIT
    1;

--Ամենադժվար մասը JOIN-երն էին, որովհետև պետք էր հասկանալ table-ների միջև կապը և ճիշտ ON պայմանը գրել։
--Հատկապես դժվար էր, երբ պետք էր 3 table իրար կապել ՝ writers → books → reviews ։