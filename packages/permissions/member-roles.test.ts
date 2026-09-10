import { describe, expect, it } from "vitest";

import {
	getOrganizationRole,
	getProductRole,
	parseMemberRoles,
	serializeMemberRoles,
	withOrganizationRole,
	withProductRole,
} from "./member-roles";

describe("member roles", () => {
	it("parses the comma-separated column and drops unknown entries", () => {
		expect(parseMemberRoles("member, studio:member,relay:admin,bogus")).toEqual([
			"member",
			"studio:member",
			"relay:admin",
		]);
		expect(parseMemberRoles(null)).toEqual([]);
	});

	it("takes the highest organization role when several are present", () => {
		expect(getOrganizationRole(["member", "admin"])).toBe("admin");
		expect(getOrganizationRole(["studio:member"])).toBeNull();
	});

	it("replaces one product's role without touching the others", () => {
		const roles = parseMemberRoles("member,studio:member,relay:developer");

		expect(withProductRole(roles, "studio", "studio:admin")).toEqual([
			"member",
			"relay:developer",
			"studio:admin",
		]);
		expect(withProductRole(roles, "relay", null)).toEqual(["member", "studio:member"]);
		expect(getProductRole(withProductRole(roles, "relay", null), "relay")).toBeNull();
	});

	it("puts the organization role first and serializes without duplicates", () => {
		expect(serializeMemberRoles(withOrganizationRole(["member", "studio:member"], "admin"))).toBe(
			"admin,studio:member",
		);
		expect(serializeMemberRoles(["member", "member"])).toBe("member");
	});
});
