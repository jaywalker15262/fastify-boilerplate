-- migrate:up
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE official_sites (
  software_name CITEXT PRIMARY KEY,
  url           TEXT    NOT NULL,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE official_sites;