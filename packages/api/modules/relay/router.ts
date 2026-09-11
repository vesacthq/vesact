import { relayProcedure } from "./procedures";
import { me } from "./procedures/me";

export const relayRouter = relayProcedure.router({
	me,
});
