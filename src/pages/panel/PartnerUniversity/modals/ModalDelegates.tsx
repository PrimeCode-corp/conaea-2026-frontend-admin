import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Phone, UserCheck, UserMinus, Plus } from 'lucide-react';
import { delegateService } from '@/services/delegateService';
import type { Delegate } from '@/types/delegates.types';

interface ModalDelegatesProps {
  open: boolean;
  onClose: () => void;
  universityId: number | null;
  universityName?: string;
}

const ModalDelegates = ({
  open,
  onClose,
  universityId,
  universityName,
}: ModalDelegatesProps) => {
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || !universityId) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await delegateService.list({
          partner_university_id: universityId,
          page_size: 100,
        });
        if (active) setDelegates(data.results);
      } catch {
        if (active) setDelegates([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [open, universityId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-[#1a1a1a] border border-white/10 text-slate-200 sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20'>
              <Users className='h-4 w-4 text-blue-400' />
            </div>
            <div>
              <DialogTitle className='text-slate-100 text-base font-semibold leading-tight'>
                Delegados
              </DialogTitle>
              {universityName && (
                <p className='text-xs text-slate-500 mt-0.5 leading-tight'>
                  {universityName}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-2 max-h-80 overflow-y-auto pr-1 mt-1'>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]'
              >
                <Skeleton className='h-7 w-7 rounded-lg bg-white/10 shrink-0' />
                <div className='flex-1 space-y-1.5'>
                  <Skeleton className='h-3.5 w-36 bg-white/10' />
                  <Skeleton className='h-3 w-24 bg-white/10' />
                </div>
                <Skeleton className='h-5 w-14 rounded-full bg-white/10 shrink-0' />
              </div>
            ))
          ) : delegates.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <UserMinus className='w-8 h-8 text-slate-600 mb-2' />
              <p className='text-sm text-slate-500'>Sin delegados registrados</p>
            </div>
          ) : (
            delegates.map((d) => {
              const isTitular = d.type_delegate === 'Titular';
              return (
                <div
                  key={d.id}
                  className='flex items-center justify-between gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]'
                >
                  <div className='flex items-center gap-2.5 min-w-0'>
                    <div
                      className={[
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border',
                        isTitular
                          ? 'bg-green-500/10 border-green-500/20'
                          : 'bg-blue-500/10 border-blue-500/20',
                      ].join(' ')}
                    >
                      <UserCheck
                        className={`h-3.5 w-3.5 ${isTitular ? 'text-green-400' : 'text-blue-400'}`}
                      />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-sm text-slate-200 font-medium leading-tight truncate'>
                        {d.fullname}
                      </p>
                      <div className='flex items-center gap-1 mt-0.5'>
                        <Phone className='h-3 w-3 text-slate-500 shrink-0' />
                        <span className='text-xs text-slate-500'>
                          {d.cellphone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={[
                      'shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                      isTitular
                        ? 'text-green-400 bg-green-500/10 border-green-500/20'
                        : 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                    ].join(' ')}
                  >
                    {d.type_delegate}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className='pt-2'>
          <Button
            size='sm'
            className='w-full gap-1.5 bg-[#fbba0e] text-black font-semibold hover:bg-[#fbba0e]/90 transition'
            onClick={() => {
              onClose();
              navigate('/delegate');
            }}
          >
            <Plus className='h-3.5 w-3.5' />
            Crear delegado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalDelegates;
