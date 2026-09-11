import { InvitationSchema, MemberSchema, OrganizationSchema } from "@repo/database";
import { z } from "zod";

export const AdminOrganizationSchema = OrganizationSchema.extend({
	members: z.array(MemberSchema),
	invitations: z.array(InvitationSchema),
});
