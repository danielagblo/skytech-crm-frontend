import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
export const UserAvatar = ({
  name,
  src,
  className,
}: {
  name: string;
  src?: string;
  className?: string;
}) => (
  <Avatar className={className}>
    <AvatarImage src={src} />
    <AvatarFallback>{initials(name)}</AvatarFallback>
  </Avatar>
);
