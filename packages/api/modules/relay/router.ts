import { relayProcedure } from "./procedures";
import { health } from "./procedures/health";
import { me } from "./procedures/me";

export const relayRouter = relayProcedure.router({
	health,
	me,
});
