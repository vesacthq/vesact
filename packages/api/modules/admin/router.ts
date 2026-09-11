import { deleteOrganization } from "./procedures/delete-organization";
import { findOrganization } from "./procedures/find-organization";
import { listOrganizations } from "./procedures/list-organizations";
import { listUsers } from "./procedures/list-users";
import { updateOrganization } from "./procedures/update-organization";

export const adminRouter = {
	users: {
		list: listUsers,
	},
	organizations: {
		list: listOrganizations,
		find: findOrganization,
		update: updateOrganization,
		delete: deleteOrganization,
	},
};
