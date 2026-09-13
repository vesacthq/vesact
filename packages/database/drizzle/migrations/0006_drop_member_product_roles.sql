-- `member.role` holds the organization role alone; the `studio:*` and
-- `relay:*` entries written next to it are dropped, wherever they sat.
UPDATE "member" SET "role" = CASE
	WHEN 'owner' = ANY(string_to_array("role", ',')) THEN 'owner'
	WHEN 'admin' = ANY(string_to_array("role", ',')) THEN 'admin'
	ELSE 'member'
END WHERE "role" NOT IN ('owner', 'admin', 'member');--> statement-breakpoint
UPDATE "invitation" SET "role" = CASE
	WHEN 'owner' = ANY(string_to_array("role", ',')) THEN 'owner'
	WHEN 'admin' = ANY(string_to_array("role", ',')) THEN 'admin'
	ELSE 'member'
END WHERE "role" IS NOT NULL AND "role" NOT IN ('owner', 'admin', 'member');
