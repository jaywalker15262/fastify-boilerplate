-- migrate:up
ALTER TABLE email_verification_tokens
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- migrate:down
ALTER TABLE email_verification_tokens
DROP CONSTRAINT unique_user_id;