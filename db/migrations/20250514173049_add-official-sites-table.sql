-- migrate:up
CREATE TABLE official_sites (
  software_name CITEXT PRIMARY KEY,
  url           TEXT    NOT NULL,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE official_sites;