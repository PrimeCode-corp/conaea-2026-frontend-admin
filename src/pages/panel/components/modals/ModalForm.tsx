import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import ModalHeader from './components/ModalHeader';
import { Button } from '@/components/ui/button';
import FormFields from '../FormFields';
import type { Field } from '../FormFields/formFields.types';

interface ModalFormProps<T extends Record<string, unknown>> {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  fields: Field[];
  form: T;
  errors: Partial<Record<keyof T, string>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  loading: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  mode?: 'create' | 'edit';
  onFile?: (id: string, file: File | null) => void;
  currentPhoto?: string;
  onValueChange?: (id: string, value: string) => void;
}

const ModalForm = <T extends Record<string, unknown>>({
  open,
  onOpenChange,
  fields,
  form,
  errors,
  onChange,
  onSubmit,
  loading,
  title,
  description,
  icon,
  mode = 'create',
  onFile,
  currentPhoto,
  onValueChange,
}: ModalFormProps<T>) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-[#1a1a1a] border border-white/10 text-slate-200 sm:max-w-md max-h-[90vh] flex flex-col'>
        <ModalHeader title={title} description={description} icon={icon} />

        <div className='overflow-y-auto flex-1 min-h-0 px-1'>
          <FormFields
            fields={fields}
            form={form}
            errors={errors}
            onChange={onChange}
            onFile={onFile}
            currentPhoto={currentPhoto}
            onValueChange={onValueChange}
          />
        </div>

        <DialogFooter className='gap-2 pt-2 shrink-0'>
          {mode === 'create' ? (
            <DialogClose asChild>
              <Button
                variant='outline'
                size='sm'
                className='border-white/10 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white transition'
              >
                Cancelar
              </Button>
            </DialogClose>
          ) : (
            <Button
              variant='outline'
              size='sm'
              className='border-white/10 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white transition'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
          )}
          <Button
            size='sm'
            className='bg-[#fbba0e] text-black font-semibold hover:bg-[#fbba0e]/90 transition min-w-24'
            onClick={onSubmit}
            disabled={loading}
          >
            {loading
              ? 'Guardando...'
              : mode === 'create'
                ? 'Guardar'
                : 'Guardar cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModalForm;
