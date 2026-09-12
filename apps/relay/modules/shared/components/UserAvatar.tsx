import { cn } from "@repo/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { imageUrl } from "@shared/lib/image-url";

export function UserAvatar({
	name,
	avatarUrl,
	className,
	...props
}: React.ComponentProps<typeof Avatar> & {
	name: string;
	avatarUrl?: string | null;
}) {
	const initials = name
		.split(" ")
		.slice(0, 2)
		.map((part) => part[0])
		.join("");

	return (
		<Avatar className={cn("size-8 rounded-full", className)} {...props}>
			<AvatarImage src={avatarUrl ? imageUrl(avatarUrl) : undefined} />
			<AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
		</Avatar>
	);
}
