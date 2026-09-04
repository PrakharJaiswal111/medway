/*
# Add photo columns to hospitals and doctors

1. Modified Tables
- `hospitals` — add `image` (text, URL to hospital exterior photo) and `gallery` (text[], multiple interior/exterior photos)
- `doctors` — add `image` (text, URL to doctor portrait photo)

2. Notes
- Columns are nullable so existing rows are unaffected.
- Values will be populated by a follow-up UPDATE.
*/

ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS gallery text[] DEFAULT '{}';

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS image text;