'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarClock, Send } from 'lucide-react';
import { toast } from 'sonner';
import { ContactSegmentSelector } from './ContactSegmentSelector';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const schema = z.object({
  name: z.string().min(3),
  message: z.string().min(1).max(160),
});

type Values = z.infer<typeof schema>;

export const BroadcastComposer = () => {
  const [segments, setSegments] = useState<string[]>([]);
  const { register, control, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: { name: '', message: '' },
  });
  const message = useWatch({ control, name: 'message' });

  const send = (scheduled: boolean) => handleSubmit(() => {
    if (!segments.length) {
      toast.error('Select at least one recipient segment');
      return;
    }
    toast.success(scheduled ? 'Broadcast scheduled' : 'Broadcast sent');
  })();

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <ContactSegmentSelector selected={segments} onChange={setSegments} />
      <section className="surface p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Message composer</h2>
          <p className="text-sm text-muted-foreground">One clear message, delivered to the selected audience.</p>
        </div>
        <form className="space-y-4">
          <div>
            <Label>Broadcast name</Label>
            <Input placeholder="e.g. August payment reminder" {...register('name')} />
            {errors.name && <p className="text-xs text-danger">Name this broadcast</p>}
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>SMS message</Label>
              <span className="text-xs text-muted-foreground">{message.length}/160 · 1 SMS credit</span>
            </div>
            <Textarea className="min-h-52" placeholder="Write your message…" maxLength={160} {...register('message')} />
            {errors.message && <p className="text-xs text-danger">{errors.message.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => void send(true)}>
              <CalendarClock className="h-4 w-4" />Schedule
            </Button>
            <Button type="button" onClick={() => void send(false)}>
              <Send className="h-4 w-4" />Send now
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};
