-- 1.
CREATE DATABASE acid_assignment;

CREATE TABLE events (
    event_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    seats_available INTEGER NOT NULL CHECK (seats_available >= 0)
);

INSERT INTO
    events (name, total_seats, seats_available)
VALUES
    ('Backend Workshop', 20, 20),
    ('DB Night', 5, 1);

CREATE TABLE bookings (
    booking_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(event_id),
    customer_name TEXT NOT NULL,
    seats INTEGER NOT NULL CHECK (seats > 0),
    booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO
    bookings (event_id, customer_name, seats)
VALUES
    (2, 'Ana', 3),
    (2, 'Ben', 1);