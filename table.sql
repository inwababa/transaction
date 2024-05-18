CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount NUMERIC(20, 4), -- Amount in naira (floating point with 4 decimal places), with a precision of 20 and a scale of 4
);
