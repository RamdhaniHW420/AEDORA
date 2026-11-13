import React from 'react';
import { ScreenHeader } from '@/components/ui';

/** Header layar dengan tombol kembali. Dipertahankan untuk layar yang belum memakai ScreenHeader langsung. */
export function BackBar({ title, onBack }: { title: string; onBack: () => void; transparent?: boolean }) {
  return <ScreenHeader title={title} onBack={onBack} />;
}
