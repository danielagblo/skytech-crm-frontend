'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Bell, CheckCheck, Moon, Sun } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProfileSheet } from './ProfileSheet';

export const TopBar = () => {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const { list, unreadCount, markAllRead } = useNotificationStore();
  const user = useAuthStore((state) => state.user);
  const name = user ? `${user.firstName} ${user.lastName}` : 'Loading profile';
  return <><header className="sticky top-0 z-30 flex h-[72px] items-center border-b bg-background/95 backdrop-blur lg:h-[90px]"><div className="flex h-full min-w-0 flex-1 items-center lg:flex-none"><div className="flex h-full min-w-0 flex-1 items-center border-r px-4 lg:w-[270px] lg:flex-none"><h1 className="truncate text-xl font-light tracking-tight text-muted-foreground sm:text-2xl lg:text-[27px]">Systems Aisle</h1></div><div className="hidden h-full items-center gap-8 px-8 sm:flex"><button onClick={() => router.back()} className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Go back"><ArrowLeft className="h-5 w-5" /></button><button onClick={() => router.forward()} className="rounded-full p-2 transition hover:bg-muted" aria-label="Go forward"><ArrowRight className="h-5 w-5" /></button></div></div><div className="ml-auto flex items-center gap-1 pr-3 sm:gap-3 sm:pr-5"><button className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">{resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button><DropdownMenu><DropdownMenuTrigger asChild><button className="relative rounded-full p-2 hover:bg-muted" aria-label="Notifications"><Bell className="h-5 w-5" />{unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-background" />}</button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-80 p-2"><div className="flex items-center justify-between px-2 py-2"><strong>Notifications</strong><button className="flex items-center gap-1 text-xs text-green-700" onClick={markAllRead}><CheckCheck className="h-3.5 w-3.5" />Mark read</button></div>{list.length === 0 ? <p className="px-2 py-6 text-center text-sm text-muted-foreground">You are all caught up.</p> : list.slice(0, 6).map((item) => <DropdownMenuItem key={item.id} className="block"><p className="font-medium">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.body}</p></DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu><button type="button" onClick={() => setProfileOpen(true)} className="flex items-center gap-3 rounded-full p-1 pr-2 text-left transition hover:bg-muted" aria-label="Open profile"><UserAvatar name={name} src={user?.profilePhotoUrl ?? undefined} className="h-10 w-10 ring-2 ring-cyan-400 sm:h-12 sm:w-12" /><span className="hidden leading-tight md:block"><span className="block text-sm font-medium">{name}</span><span className="block text-[10px] text-muted-foreground">{user?.role ? user.role.replace('_', ' ') : '—'}</span></span></button></div></header><ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} /></>;
};
