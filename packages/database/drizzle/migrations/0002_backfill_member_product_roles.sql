-- Members and pending invitations created before product roles existed keep
-- their Studio access: a plain member becomes a Studio member.
UPDATE "member" SET "role" = 'member,studio:member' WHERE "role" = 'member';--> statement-breakpoint
UPDATE "invitation" SET "role" = 'member,studio:member' WHERE "role" = 'member' AND "status" = 'pending';
