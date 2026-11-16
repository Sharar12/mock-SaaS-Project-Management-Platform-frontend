import { Suspense } from 'react';
import { KanbanBoardView } from '@/features/KanbanBoardView';

export default function BoardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-400">Loading board...</div>}>
      <KanbanBoardView />
    </Suspense>
  );
}
