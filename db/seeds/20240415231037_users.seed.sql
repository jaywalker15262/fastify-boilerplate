-- migrate:up
INSERT INTO
  users (
    id,
    "createdAt",
    "updatedAt",
    email,
    password,
    country,
    "postalCode",
    street,
    "role"
  )
VALUES
  (
    'f59d0748-d455-4465-b0a8-8d8260b1c877',
    now(),
    now(),
    'john@gmail.com',
    '$2b$10$skytmxATFoiTYBqXxJrs/uMZ3mbiItKkcHM3A0X8QUf3Uq8sgaAse', -- "securePassword123"
    'England',
    '24312',
    'Road Avenue',
    'guest'
  );

-- migrate:down
DELETE FROM users WHERE id='f59d0748-d455-4465-b0a8-8d8260b1c877' LIMIT 1