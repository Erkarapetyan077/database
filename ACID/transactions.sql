--1.
BEGIN;

UPDATE
    events
SET
    seats_available = seats_available - 2
WHERE
    name = 'Backend Workshop';

INSERT INTO
    bookings (event_id, customer_name, seats)
SELECT
    event_id,
    'Carla',
    2
FROM
    events
WHERE
    name = 'Backend Workshop';

COMMIT;

BEGIN;

UPDATE
    events
SET
    seats_available = seats_available - 2
WHERE
    name = 'Backend Workshop';

INSERT INTO
    bookings (event_id, customer_name, seats)
SELECT
    event_id,
    NULL,
    2
FROM
    events
WHERE
    name = 'Backend Workshop';

--ERROR:  null value in column "customer_name" of relation "bookings" violates not-null constraint
--DETAIL:  Failing row contains (4, 1, null, 2, 2026-10-19 01:50:25.084547+04).
SELECT
    *
FROM
    events;

ROLLBACK;

UPDATE
    events
SET
    seats_available = seats_available - 2
WHERE
    name = 'Backend Workshop';

INSERT INTO
    bookings (event_id, customer_name, seats)
VALUES
    (1, NULL, 2);

SELECT
    *
FROM
    events
ORDER BY
    event_id;

SELECT
    *
FROM
    bookings
ORDER BY
    booking_id;

UPDATE
    events
SET
    seats_available = seats_available + 2
WHERE
    name = 'Backend Workshop';

--մենք կատարել էինք transaction օգտագործելով begin keyword-ը,
--այսպես ասած wrap անենք մի քանի հրաման(transaction) մեկ transaction-ի մեջ
--և ACID-ի atomicity-ի սկզբունքով կամ կկատարվի ամբողջ transaction կամ ամբողջը կձախողվի
--դա է պատճառը որ 1.3-ում հրամաննրը կատարվեցին որը որ սխալ էր, քանի որ չէինք օգտագործել begin keyword-ը,
--ամբողջը մեկ transaction համարելու համար, այդ պատճառով սխալ աշխատեց բայց միաժամանակ տեղի ունեցավ առաջին update-ը,
--որի արդյունքում ստիպված եղա ձեռքով վերականգնելու տվյալները:
-- 2.
UPDATE
    events
SET
    seats_available = seats_available - 5
WHERE
    name = 'DB Night';

-- ERROR:  new row for relation "events" violates check constraint "events_seats_available_check"
-- DETAIL:  Failing row contains (2, DB Night, 5, -4).
INSERT INTO
    bookings (event_id, customer_name, seats)
VALUES
    (2, 'Test', 0);

-- ERROR:  new row for relation "bookings" violates check constraint "bookings_seats_check"
-- DETAIL:  Failing row contains (6, 2, Test, 0, 2026-10-19 01:57:38.873601+04).
SELECT
    e.name,
    e.total_seats,
    e.seats_available + COALESCE(SUM(b.seats), 0) AS accounted_seats
FROM
    events e
    LEFT JOIN bookings b ON e.event_id = b.event_id
GROUP BY
    e.event_id,
    e.name,
    e.total_seats,
    e.seats_available
ORDER BY
    e.event_id;

BEGIN;

UPDATE
    events
SET
    seats_available = seats_available - 1
WHERE
    name = 'Backend Workshop';

INSERT INTO
    bookings (event_id, customer_name, seats)
SELECT
    event_id,
    'Dev',
    1
FROM
    events
WHERE
    name = 'Backend Workshop';

COMMIT;

-- Միայն ազատ տեղերը նվազեցնող UPDATE-ը կարող է խախտել կանոնը,
-- եթե համապատասխան ամրագրում չստեղծվի։
-- Task 1-ում BEGIN-ի և ROLLBACK-ի շնորհիվ սխալ INSERT-ից հետո
-- չեղարկվեց նաև UPDATE-ը, ու կանոնը պահպանվեց։
-- Բազան կարող է այս կանոնը պարտադրել deferred constraint trigger-ով,
-- որը գործարքի վերջում ստուգում է՝
-- ազատ տեղեր + ամրագրված տեղեր = ընդհանուր տեղեր։
--3.
-- Session A
BEGIN;

UPDATE
    events
SET
    seats_available = seats_available - 1
WHERE
    name = 'Backend Workshop';

-- Session B․ դեռ տեսնում ենք հին՝ 17 արժեքը։
SELECT
    *
FROM
    events;

-- Session A․ սեփական փոփոխությունն արդեն տեսանելի է։
SELECT
    *
FROM
    events;

COMMIT;

-- Session B․ COMMIT-ից հետո տեսնում ենք նոր՝ 16 արժեքը։
SELECT
    *
FROM
    events;

-- 3b. Read Committed
-- Session B
BEGIN;

SELECT
    seats_available AS read1
FROM
    events
WHERE
    name = 'Backend Workshop';

-- Առաջին ընթերցումը՝ 16։
-- Session A․ փոփոխությունը պահպանվում է autocommit-ով։
UPDATE
    events
SET
    seats_available = seats_available - 1
WHERE
    name = 'Backend Workshop';

-- Session B
SELECT
    seats_available AS read2
FROM
    events
WHERE
    name = 'Backend Workshop';

-- Երկրորդ ընթերցումը՝ 15։
-- Նույն գործարքում տարբեր արժեքներ ստացանք՝ non-repeatable read։
COMMIT;

-- 3a. Չհաստատված փոփոխությունը մյուս session-ին տեսանելի չէ։
-- Session A
BEGIN;

UPDATE
    events
SET
    seats_available = seats_available - 1
WHERE
    name = 'Backend Workshop';

-- Session B․ տեսնում է նախկին արժեքը, քանի որ փոփոխությունը դեռ հաստատված չէ։
SELECT
    *
FROM
    events;

-- Session A․ իր կատարած փոփոխությունն արդեն տեսնում է։
SELECT
    *
FROM
    events;

COMMIT;

-- Հաստատումից հետո նոր հարցումը տեսնում է փոփոխված տվյալները։
SELECT
    *
FROM
    events;

-- 3b. Նույն տվյալների կրկնակի ընթերցում։
-- Read Committed
-- Session B
BEGIN;

SELECT
    seats_available AS read1
FROM
    events;

-- Session A
UPDATE
    events
SET
    seats_available = seats_available - 1
WHERE
    name = 'Backend Workshop';

-- Session B․ երկրորդ ընթերցման ժամանակ տեսնում է նոր հաստատված արժեքը։
SELECT
    seats_available AS read2
FROM
    events;

-- Repeatable Read
-- Session B
BEGIN ISOLATION LEVEL REPEATABLE READ;

SELECT
    seats_available AS read1
FROM
    events;

-- Session A
UPDATE
    events
SET
    seats_available = seats_available + 1
WHERE
    name = 'Backend Workshop';

-- Session B․ շարունակում է տեսնել գործարքի սկզբնական պատկերը։
SELECT
    seats_available AS read2
FROM
    events;

-- 3c. Երկու գործարքի աշխատանքը նույն տողի հետ։
-- Session A
BEGIN;

SELECT
    seats_available
FROM
    events;

-- Session B
BEGIN;

SELECT
    seats_available
FROM
    events;

-- Session A․ UPDATE-ը կողպում է փոփոխվող տողը։
UPDATE
    events
SET
    seats_available = seats_available - 1
WHERE
    name = 'Backend Workshop';

-- Session B․ UPDATE-ը սպասում է Session A-ի գործարքի ավարտին։
UPDATE
    events
SET
    seats_available = seats_available - 1
WHERE
    name = 'Backend Workshop';

-- Session A․ COMMIT-ն ազատում է կողպումը, և Session B-ի UPDATE-ը շարունակվում է։
COMMIT;

-- FOR UPDATE․ տողերը կողպվում են արդեն ընթերցման ժամանակ։
-- Session A
BEGIN;

SELECT
    seats_available
FROM
    events FOR
UPDATE
;

-- Session B․ հարցումը սպասում է Session A-ի կողպումների ազատմանը։
BEGIN;

SELECT
    seats_available
FROM
    events FOR
UPDATE
;

-- Session A
UPDATE
    events
SET
    seats_available = seats_available - 1
WHERE
    name = 'Backend Workshop';

-- Session B․ այս հրամանը հնարավոր է աշխատեցնել միայն սպասող SELECT-ի ավարտից հետո։
UPDATE
    events
SET
    seats_available = seats_available - 1
WHERE
    name = 'Backend Workshop';

-- Session A․ ավարտում է գործարքը և ազատում կողպումները։
COMMIT;

--4.
INSERT INTO
    bookings(event_id, customer_name, seats)
VALUES
    (1, 'Olesia', 1);

-- TASK 4 — Durability
-- PostgreSQL-ը փոփոխությունների մասին նախ գրառում է Write-Ahead Log-ում՝ WAL-ում։
-- Երբ fsync-ը և synchronous_commit-ը միացված են, COMMIT-ի հաջող պատասխանից առաջ
-- անհրաժեշտ WAL գրառումները պահվում են կայուն կրիչի վրա։
-- Վթարից հետո PostgreSQL-ը կարող է WAL-ի միջոցով վերականգնել հաստատված փոփոխությունները։
-- Եթե synchronous_commit-ն անջատված է, COMMIT-ը կարող է հաջող պատասխան տալ
-- մինչև WAL-ի պահպանումը․ այդ պահին վթարի դեպքում վերջին գործարքները կարող են կորչել։
-- TASK 5 — Synthesis
-- Atomicity
-- Task 1.2-ում սխալ INSERT-ից հետո ROLLBACK-ը չեղարկեց նաև հաջող UPDATE-ը։
-- Առանց ընդհանուր գործարքի՝ ազատ տեղերը կնվազեին, բայց ամրագրում չէր ստեղծվի։
-- Consistency
-- Task 2-ում CHECK սահմանափակումներն արգելեցին բացասական ազատ տեղերն ու զրո տեղով ամրագրումը։
-- Առանց այդ սահմանափակումների՝ բազան կընդուներ կանոնները խախտող տվյալներ։
-- Isolation
-- Task 3c-ում FOR UPDATE-ի պատճառով Session B-ն սպասեց Session A-ի ավարտին։
-- Առանց կողպված ընթերցման և տեղերի կրկնակի ստուգման՝ երկուսն էլ կարող էին ամրագրել վերջին տեղը։
-- Durability
-- Task 4-ում պետք է ստուգենք՝ COMMIT արված ամրագրումը պահպանվե՞լ է վերագործարկումից հետո։
-- Առանց durability-ի՝ հաջողությամբ հաստատված տվյալները կարող էին կորչել սերվերի վթարի դեպքում։