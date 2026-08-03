'use client';

import { useRef } from 'react';
import { Camera, Mail, Moon, Phone, ShieldCheck, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/authStore';
import { useUploadUserPhoto } from '@/hooks/useUsers';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/shared/UserAvatar';

export const ProfileSheet = ({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) => {
  const user = useAuthStore((state) => state.user);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const upload = useUploadUserPhoto();
  const { resolvedTheme, setTheme } = useTheme();
  if (!user) return null;
  const name = `${user.firstName} ${user.lastName}`;
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="sm:max-w-[430px]"><SheetHeader className="border-b pb-4"><SheetTitle className="text-xl font-medium">My profile</SheetTitle></SheetHeader><div className="space-y-6"><div className="flex items-center gap-5 rounded-2xl bg-muted p-5"><div className="relative"><UserAvatar name={name} src={user.profilePhotoUrl ?? undefined} className="h-24 w-24 ring-4 ring-primary/40" /><button type="button" onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 rounded-full bg-primary p-2 text-black shadow" aria-label="Upload profile photo"><Camera className="h-4 w-4" /></button><input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload.mutate({ id: user.id, file }); event.currentTarget.value = ''; }} /></div><div className="min-w-0"><h2 className="truncate text-xl font-semibold">{name}</h2><p className="text-sm text-muted-foreground">{user.role.replace('_', ' ')}</p><Button type="button" variant="link" className="mt-1 h-auto p-0 text-green-700" disabled={upload.isPending} onClick={() => fileRef.current?.click()}>{upload.isPending ? 'Uploading…' : 'Change profile photo'}</Button></div></div><div className="divide-y rounded-2xl border bg-card"><div className="flex items-center gap-3 p-4"><Mail className="h-4 w-4 text-muted-foreground" /><div><p className="eyebrow">Email</p><p className="text-sm">{user.email}</p></div></div><div className="flex items-center gap-3 p-4"><Phone className="h-4 w-4 text-muted-foreground" /><div><p className="eyebrow">Phone</p><p className="text-sm">{user.phone || 'Not provided'}</p></div></div><div className="flex items-center gap-3 p-4"><ShieldCheck className="h-4 w-4 text-muted-foreground" /><div><p className="eyebrow">Access</p><p className="text-sm">{user.planTier} plan · {user.role}</p></div></div></div><div className="flex items-center justify-between rounded-2xl border bg-card p-4"><div><p className="font-medium">Appearance</p><p className="text-xs text-muted-foreground">Use a comfortable theme across every screen.</p></div><Button variant="outline" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>{resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{resolvedTheme === 'dark' ? 'Light' : 'Dark'}</Button></div></div></SheetContent></Sheet>;
};
