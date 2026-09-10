import { and, eq, ilike, or, sql } from "drizzle-orm";
import type { z } from "zod";

import { db } from "../client";
import { organization } from "../schema/postgres";
import type { OrganizationUpdateSchema } from "../zod";

export async function getOrganizations({
	limit,
	offset,
	query,
}: {
	limit: number;
	offset: number;
	query?: string;
}) {
	const organizations = await db.query.organization.findMany({
		where: query ? (org, { ilike, or }) => or(ilike(org.name, `%${query}%`)) : undefined,
		limit,
		offset,
		extras: {
			membersCount:
				// Column refs inside `extras` are rendered against the outer table, so
				// the inner table is spelled out.
				sql<number>`(SELECT COUNT(*) FROM "member" WHERE "member"."organizationId" = ${organization.id})`.as(
					"membersCount",
				),
		},
	});

	return organizations.map((organizationRecord) => ({
		...organizationRecord,
		membersCount: Number(organizationRecord.membersCount),
	}));
}

export async function countAllOrganizations({ query }: { query?: string }) {
	const result = await db
		.select({ count: sql<number>`count(*)` })
		.from(organization)
		.where(query ? or(ilike(organization.name, `%${query}%`)) : undefined);
	return Number(result[0]?.count ?? 0);
}

export async function getOrganizationById(id: string) {
	return db.query.organization.findFirst({
		where: (org, { eq }) => eq(org.id, id),
		with: {
			members: true,
			invitations: true,
		},
	});
}

export async function getInvitationById(id: string) {
	return db.query.invitation.findFirst({
		where: (invitation, { eq }) => eq(invitation.id, id),
		with: {
			organization: true,
		},
	});
}

export async function getOrganizationBySlug(slug: string) {
	return db.query.organization.findFirst({
		where: (org, { eq }) => eq(org.slug, slug),
	});
}

export async function getOrganizationMembership(organizationId: string, userId: string) {
	return db.query.member.findFirst({
		where: (member, { eq }) =>
			and(eq(member.organizationId, organizationId), eq(member.userId, userId)),
		with: {
			organization: true,
		},
	});
}

export async function getOrganizationWithPurchasesAndMembersCount(organizationId: string) {
	const organizationRecord = await db.query.organization.findFirst({
		where: (org, { eq }) => eq(org.id, organizationId),
		with: {
			purchases: true,
		},
		extras: {
			membersCount:
				// Column refs inside `extras` are rendered against the outer table, so
				// the inner table is spelled out.
				sql<number>`(SELECT COUNT(*) FROM "member" WHERE "member"."organizationId" = ${organization.id})`.as(
					"membersCount",
				),
		},
	});

	if (!organizationRecord) {
		return organizationRecord;
	}

	return {
		...organizationRecord,
		membersCount: Number(organizationRecord.membersCount),
	};
}

export async function getPendingInvitationByEmail(email: string) {
	return db.query.invitation.findFirst({
		where: (invitation, { eq }) =>
			and(eq(invitation.email, email), eq(invitation.status, "pending")),
	});
}

export async function updateOrganization(
	updatedOrganization: z.infer<typeof OrganizationUpdateSchema>,
) {
	return db
		.update(organization)
		.set(updatedOrganization)
		.where(eq(organization.id, updatedOrganization.id));
}
