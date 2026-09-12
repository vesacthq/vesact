import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { imageUrl } from "@shared/lib/image-url";
import { Users2Icon } from "lucide-react";

export function OrganizationLogo({
	name,
	logoUrl,
	...props
}: React.ComponentProps<typeof Avatar> & {
	name: string;
	logoUrl?: string | null;
}) {
	return (
		<Avatar {...props}>
			<AvatarImage src={logoUrl ? imageUrl(logoUrl) : undefined} />
			<AvatarFallback className="bg-primary/10 text-primary uppercase" title={name}>
				<Users2Icon className="size-4" />
			</AvatarFallback>
		</Avatar>
	);
}
