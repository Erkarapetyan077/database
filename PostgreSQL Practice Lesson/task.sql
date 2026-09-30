-- 1. Simple integer ID usage
CREATE TABLE categories (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name TEXT
);

INSERT INTO
    categories (category_name)
VALUES
    ('Electronics');

INSERT INTO
    categories (category_name)
VALUES
    ('Furniture');

INSERT INTO
    categories (category_name)
VALUES
    ('Stationery');

INSERT INTO
    categories (category_name)
VALUES
    ('Books');

INSERT INTO
    categories (category_name)
VALUES
    ('Toys');

SELECT
    *
FROM
    categories;

SELECT
    *
FROM
    categories
ORDER BY
    category_id;

UPDATE
    categories
SET
    category_name = 'Toys & Games'
WHERE
    category_name = 'Toys';

--test
INSERT INTO
    categories (category_name)
VALUES
    ('Test Category');

DELETE FROM
    categories
WHERE
    category_name = 'Test Category';

SELECT
    *
FROM
    categories
ORDER BY
    category_id;

-- 2. Constraints
ALTER TABLE
    categories
ADD
    COLUMN description TEXT;

ALTER TABLE
    categories
ADD
    COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE
    categories
ALTER COLUMN
    category_name
SET
    NOT NULL;

ALTER TABLE
    categories
ADD
    CONSTRAINT categories_category_name_unique UNIQUE (category_name);

ALTER TABLE
    categories
ADD
    CONSTRAINT categories_category_name_length_check CHECK (length(category_name) >= 3);

INSERT INTO
    categories (category_name)
VALUES
    ('Sports');

SELECT
    *
FROM
    categories
WHERE
    category_name = 'Sports';

-- 3. Products, Orders & JOIN։
CREATE TABLE products(
    product_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name TEXT NOT NULL,
    price NUMERIC(8, 2) NOT NULL,
    category_id INTEGER,
    stock_quantity INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE
    products
ADD
    CONSTRAINT price_check CHECK (price > 0);

CREATE TABLE orders (
    order_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id INTEGER,
    quantity INTEGER NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE
    orders
ADD
    CONSTRAINT quantity_check CHECK (quantity > 0);

INSERT INTO
    products (product_name, price, category_id, stock_quantity)
VALUES
    ('Wireless Mouse', 19.99, 1, 150),
    ('Mechanical Keyboard', 49.99, 1, 80),
    ('Standing Desk', 249.00, 2, 30),
    ('Office Chair', 129.50, 2, 45),
    ('Notebook Pack', 4.99, 3, 300),
    ('Gel Pens (12-pack)', 6.50, 3, 220),
    ('PostgreSQL Handbook', 39.00, 4, 60),
    ('SQL Cookbook', 34.00, 4, 40),
    ('Building Blocks', 24.99, 5, 60),
    ('Desk Lamp', 15.50, NULL, 0);

SELECT
    *
FROM
    products
ORDER BY
    product_id;

INSERT INTO
    orders (product_id, quantity, order_date)
VALUES
    (1, 2, '2026-01-05'),
    (1, 1, '2026-01-12'),
    (2, 1, '2026-01-12'),
    (3, 1, '2026-01-20'),
    (4, 2, '2026-01-22'),
    (5, 5, '2026-02-01'),
    (6, 3, '2026-02-01'),
    (7, 1, '2026-02-10'),
    (1, 3, '2026-02-15'),
    (6, 2, '2026-02-18');

SELECT
    *
FROM
    orders
ORDER BY
    order_id;

SELECT
    orders.order_id,
    products.product_name,
    orders.quantity,
    orders.order_date
FROM
    orders
    INNER JOIN products ON orders.product_id = products.product_id;

SELECT
    products.product_name,
    orders.order_id,
    orders.quantity,
    orders.order_date
FROM
    products
    LEFT JOIN orders ON products.product_id = orders.product_id;

-- 4. COUNT, SUM, AVG, GROUP BY։
SELECT
    COUNT(*)
FROM
    products;

SELECT
    COUNT(*)
FROM
    orders;

SELECT
    SUM(quantity)
FROM
    orders;

SELECT
    AVG(quantity)
FROM
    orders;

SELECT
    product_id,
    COUNT(*)
FROM
    orders
GROUP BY
    product_id;

SELECT
    product_id,
    COUNT(*)
FROM
    orders
GROUP BY
    product_id
HAVING
    COUNT(*) > 1;

SELECT
    product_id,
    SUM(quantity)
FROM
    orders
GROUP BY
    product_id;

SELECT
    product_id,
    AVG(quantity)
FROM
    orders
GROUP BY
    product_id;

SELECT
    product_id,
    SUM(quantity)
FROM
    orders
GROUP BY
    product_id
HAVING
    SUM(quantity) > 3;

-- 5. JOIN + Aggregation։
SELECT
    products.product_name,
    SUM(orders.quantity)
FROM
    products
    LEFT JOIN orders ON products.product_id = orders.product_id
GROUP BY
    products.product_id,
    products.product_name;

SELECT
    products.product_name,
    SUM(orders.quantity)
FROM
    products
    LEFT JOIN orders ON products.product_id = orders.product_id
GROUP BY
    products.product_id,
    products.product_name
HAVING
    SUM(orders.quantity) > 3;

SELECT
    categories.category_name,
    COUNT(products.product_id)
FROM
    categories
    LEFT JOIN products ON categories.category_id = products.category_id
GROUP BY
    categories.category_id,
    categories.category_name;

-- 6. Foreign Key։
ALTER TABLE
    products
ADD
    CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(category_id);

INSERT INTO
    products (product_name, price, category_id, stock_quantity)
VALUES
    ('Test Product', 10.00, 999, 5);

ALTER TABLE
    orders
ADD
    CONSTRAINT orders_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(product_id);

INSERT INTO
    orders (product_id, quantity)
VALUES
    (999, 2);

DELETE FROM
    categories
WHERE
    category_id = 1;