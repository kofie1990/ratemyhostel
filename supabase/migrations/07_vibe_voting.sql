-- 07_vibe_voting.sql

-- 1. Alter room_votes: replace binary upvote/downvote with 1.0-10.0 decimal score
ALTER TABLE room_votes DROP CONSTRAINT IF EXISTS room_votes_vote_value_check;
ALTER TABLE room_votes RENAME COLUMN vote_value TO score;
ALTER TABLE room_votes ALTER COLUMN score TYPE NUMERIC(3,1) USING score::NUMERIC(3,1);
ALTER TABLE room_votes ADD CONSTRAINT room_votes_score_check CHECK (score >= 1.0 AND score <= 10.0);

-- 2. Alter rooms.vibe_score to support decimal averages
ALTER TABLE rooms ALTER COLUMN vibe_score TYPE NUMERIC(3,1) USING vibe_score::NUMERIC(3,1);

-- 3. Create a function that recalculates the vibe_score average for a room
CREATE OR REPLACE FUNCTION update_vibe_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rooms
  SET vibe_score = (
    SELECT ROUND(AVG(score)::NUMERIC, 1)
    FROM room_votes
    WHERE room_id = COALESCE(NEW.room_id, OLD.room_id)
  )
  WHERE id = COALESCE(NEW.room_id, OLD.room_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create triggers to auto-update vibe_score on any vote change
DROP TRIGGER IF EXISTS on_room_vote_change ON room_votes;
CREATE TRIGGER on_room_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON room_votes
  FOR EACH ROW EXECUTE FUNCTION update_vibe_score();
