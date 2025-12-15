# TODO: Update Database for Message Deletion Tracking

## Database Schema Updates (server/initialize.js)

- [x] Add `sender_deleted TINYINT(1) DEFAULT 0` and `receiver_deleted TINYINT(1) DEFAULT 0` to the CREATE TABLE statement for messages.
- [x] Add ALTER TABLE statements after CREATE TABLE to add these columns if they don't exist (for existing databases).

## API Endpoint Updates (server/index.js)

- [x] Update GET /api/messages query: Add `WHERE m.receiver_deleted = 0` to exclude deleted messages from inbox.
- [x] Update GET /api/messages/:id query: Add `AND m.receiver_deleted = 0` to prevent fetching deleted messages.
- [x] Add new DELETE /api/messages/:id endpoint: Check if the authenticated user is the sender or receiver; set `sender_deleted = 1` if sender, `receiver_deleted = 1` if receiver. Return success or error if not authorized.

## Followup Steps

- [ ] Restart the server to apply database changes.
- [ ] Test the endpoints to ensure deleted messages are hidden and delete functionality works.
