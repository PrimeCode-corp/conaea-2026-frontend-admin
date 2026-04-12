import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DetailForm {
  payment_method: string;
  mount: string;
  payment_date: string;
}

interface ModalPayDetailProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  form: DetailForm;
  onFormChange: (form: DetailForm) => void;
  onSave: () => void;
  loading: boolean;
}

const ModalPayDetail = ({
  open,
  onOpenChange,
  form,
  onFormChange,
  onSave,
  loading,
}: ModalPayDetailProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-[#1a1a1a] border border-white/10 text-slate-200 sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle className='text-slate-100 font-semibold text-base'>
            Editar detalles del voucher
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-4 py-2'>
          <div className='flex flex-col gap-1.5'>
            <Label className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
              Método de pago
            </Label>
            <Input
              value={form.payment_method}
              onChange={(e) =>
                onFormChange({ ...form, payment_method: e.target.value })
              }
              className='bg-[#111] border-white/10 text-slate-200 focus-visible:ring-[#fbba0e] focus-visible:ring-offset-0'
              disabled
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
              Monto (S/)
            </Label>
            <Input
              type='number'
              value={form.mount}
              onChange={(e) => onFormChange({ ...form, mount: e.target.value })}
              className='bg-[#111] border-white/10 text-slate-200 focus-visible:ring-[#fbba0e] focus-visible:ring-offset-0'
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label className='text-xs font-semibold uppercase tracking-wider text-slate-400'>
              Fecha
            </Label>
            <Input
              type='date'
              value={form.payment_date}
              onChange={(e) =>
                onFormChange({ ...form, payment_date: e.target.value })
              }
              className='bg-[#111] border-white/10 text-slate-200 focus-visible:ring-[#fbba0e] focus-visible:ring-offset-0 scheme-dark'
            />
          </div>
        </div>

        <DialogFooter className='gap-2 pt-2'>
          <Button
            variant='outline'
            size='sm'
            className='cursor-pointer border-white/10 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white transition'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            size='sm'
            className='cursor-pointer bg-[#fbba0e] text-black font-semibold hover:bg-[#fbba0e]/90 transition min-w-24'
            onClick={onSave}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalPayDetail;
