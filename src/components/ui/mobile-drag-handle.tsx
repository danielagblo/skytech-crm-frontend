'use client';

import { useRef } from 'react';

export const MobileDragHandle = ({ onDismiss, onExpand }: { onDismiss: () => void; onExpand: () => void }) => {
  const startY = useRef<number | null>(null);
  const offset = useRef(0);
  const reset = (element: HTMLElement) => {
    element.style.transition = 'transform 180ms ease';
    element.style.transform = '';
    window.setTimeout(() => { element.style.transition = ''; }, 200);
  };
  return <div className="-mx-4 -mt-2 flex touch-none justify-center pb-3 pt-2 sm:hidden" onPointerDown={(event) => { startY.current = event.clientY; offset.current = 0; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerMove={(event) => { if (startY.current === null) return; const content = event.currentTarget.parentElement; if (!content) return; offset.current = event.clientY - startY.current; if (offset.current > 0) content.style.transform = `translateY(${offset.current}px)`; }} onPointerUp={(event) => { const content = event.currentTarget.parentElement; const movement = offset.current; startY.current = null; offset.current = 0; if (!content) return; if (movement > 110) { onDismiss(); return; } if (movement < -70) onExpand(); reset(content); }} aria-label="Drag sheet"><span className="h-1.5 w-12 rounded-full bg-foreground/20" /></div>;
};
