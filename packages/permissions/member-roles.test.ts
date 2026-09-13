import { describe, expect, it } from "vitest";

import { isOrganizationRole, parseMemberRole } from "./member-roles";

describe("member roles", () => {
	it("reads the organization role", () => {
		expect(parseMemberRole("owner")).toBe("owner");
		expect(parseMemberRole(" admin ")).toBe("admin");
		expect(parseMemberRole(null)).toBeNull();
		expect(parseMemberRole("bogus")).toBeNull();
	});

	it("keeps only the organization role of a legacy comma-separated value", () => {
		expect(parseMemberRole("member,product:member")).toBe("member");
		expect(parseMemberRole("product:member,member")).toBe("member");
		expect(parseMemberRole("product:admin,other:developer")).toBeNull();
	});

	it("takes the highest organization role when several are present", () => {
		expect(parseMemberRole("member,admin")).toBe("admin");
	});

	it("recognizes organization roles", () => {
		expect(isOrganizationRole("member")).toBe(true);
		expect(isOrganizationRole("product:member")).toBe(false);
	});
});
