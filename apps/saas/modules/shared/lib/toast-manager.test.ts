import { toast } from "@repo/ui/components/toast";
import { describe, expect, it } from "vitest";

describe("toast manager", () => {
	it("adds and closes a toast", () => {
		const toastId = toast.add({
			title: "Profile saved",
			type: "success",
		});

		expect(typeof toastId).toBe("string");
		expect(toastId.length).toBeGreaterThan(0);

		toast.close(toastId);
	});

	it("resolves a promise toast", async () => {
		const result = await toast.promise(Promise.resolve("done"), {
			loading: { title: "Working" },
			success: { title: "Finished" },
			error: { title: "Failed" },
		});

		expect(result).toBe("done");
	});
});
