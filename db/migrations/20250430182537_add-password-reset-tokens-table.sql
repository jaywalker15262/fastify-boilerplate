-- migrate:up
CREATE TABLE password_reset_tokens (
  user_id      UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,
  token        TEXT NOT NULL PRIMARY KEY,
  expires_at   TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT unique_user_id_reset UNIQUE (user_id)
);

-- migrate:down
DROP TABLE IF EXISTS password_reset_tokens;

