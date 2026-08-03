import type { UserSummary } from './user.types'; export interface Activity{id:string;type:'CALL'|'COMMENT'|'LEAD'|'TASK'|'SECURITY';title:string;description:string;createdAt:string;actor:UserSummary}
