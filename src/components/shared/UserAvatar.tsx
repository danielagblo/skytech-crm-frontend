import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { useEffect, useState } from "react";

export const UserAvatar = ({
  id,
  name,
  src,
  className,
}: {
  id?: string;
  name: string;
  src?: string;
  className?: string;
}) => {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  useEffect(() => setCurrentSrc(src), [src]);
  useEffect(() => {
    const key = id ? `profilePhoto:${id}` : `profilePhoto:${name}`;
    const cached = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (!currentSrc && cached) setCurrentSrc(cached);
  }, [id, name, currentSrc]);
  return (
    <Avatar className={className}>
      <AvatarImage
        src={currentSrc}
        onError={() => {
          const key = id ? `profilePhoto:${id}` : `profilePhoto:${name}`;
          const cached = typeof window !== "undefined" ? localStorage.getItem(key) : null;
          if (cached) setCurrentSrc(cached);
        }}
      />
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  );
};
