import { notFound } from 'next/navigation';
import { deals } from '@/lib/mock-data';
import { DealDetailPage } from '@/components/pipeline/DealDetailPage';

export default async function Page({params}:{params:Promise<{dealId:string}>}){
  const {dealId}=await params;
  const deal=deals.find((item)=>item.id===dealId);
  if(!deal)notFound();
  return <DealDetailPage deal={deal}/>;
}
