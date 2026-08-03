'use client';
import { ArrowLeft, ArrowRight, Bell, Menu, Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSidebarStore } from '@/store/sidebarStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { UserAvatar } from '@/components/shared/UserAvatar';

export const TopBar = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const setOpen = useSidebarStore((state) => state.setMobileOpen);
  const unread = useNotificationStore((state) => state.unreadCount);
  const user = useAuthStore((state) => state.user);
  const name = user ? `${user.firstName} ${user.lastName}` : 'Loading profile';
  return <header className="sticky top-0 z-30 flex h-20 items-center border-b bg-background/90 px-4 backdrop-blur lg:px-6">
    <button className="mr-3 rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
    <h2 className="hidden text-lg font-medium sm:block">Systems Aisle</h2>
    <div className="ml-6 hidden gap-1 sm:flex"><button className="rounded-md p-2 hover:bg-muted" onClick={() => router.back()} aria-label="Go back"><ArrowLeft className="h-4 w-4" /></button><button className="rounded-md p-2 hover:bg-muted" onClick={() => router.forward()} aria-label="Go forward"><ArrowRight className="h-4 w-4" /></button></div>
    <div className="ml-auto flex items-center gap-2">
      <button className="rounded-full p-2 hover:bg-muted" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
      <button className="relative rounded-full p-2 hover:bg-muted" aria-label="Notifications"><Bell className="h-5 w-5" />{unread > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger" />}</button>
      <UserAvatar name={name} src={user?.profilePhotoUrl ?? undefined} className="h-10 w-10" />
      <div className="hidden leading-tight sm:block"><p className="text-sm font-semibold">{name}</p><p className="text-[10px] text-muted-foreground">{user?.role ?? '—'}</p></div>
    </div>
  </header>;
};
