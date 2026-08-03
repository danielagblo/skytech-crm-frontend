import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency=(value:number)=>new Intl.NumberFormat('en-GH',{style:'currency',currency:'GHS',minimumFractionDigits:2}).format(value).replace('GHS','GH¢')
export const formatDate=(value:string|Date)=>format(new Date(value),'do MMMM yyyy')
export const formatTime=(value:string|Date)=>format(new Date(value),'h:mm a')
export const formatRelative=(value:string|Date)=>formatDistanceToNow(new Date(value),{addSuffix:true})
export const initials=(name:string)=>name.split(' ').map((part)=>part[0]).join('').slice(0,2).toUpperCase()
