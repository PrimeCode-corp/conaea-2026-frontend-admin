import { useEffect } from 'react';

import { Barcode } from 'lucide-react';
import { Button } from '@/components/ui/button';

import HeaderPanel from '../components/HeaderPanel';
import TablePanel from '../components/TablePanel';
import FooterPanel from '../components/FooterPanel';
import LoadingControl from '@/components/LoadingControl';
import { getServerFooterProps } from '@/utils/pagination';

import { useDynamicCodeStore } from '@/store/useDynamicCodeStore';

import { columns } from './columns';

import { Toaster } from 'sonner';
import { toast } from 'sonner';

const DynamicCode = () => {
  const {
    codes,
    loading,
    generating,
    error,
    fetchCodes,
    generateCode,
    meta,
    page,
  } = useDynamicCodeStore();

  useEffect(() => {
    fetchCodes(1);
  }, [fetchCodes]);

  const handleGenerate = async () => {
    try {
      const newCode = await generateCode();
      toast.success(`Código generado: ${newCode.code}`);
    } catch {
      toast.error('Error al generar el código. Intenta nuevamente.');
    }
  };

  if (loading) return <LoadingControl />;
  if (error) return <p className='text-red-400 p-8'>{error}</p>;

  return (
    <>
      <HeaderPanel
        title='Panel de Control'
        description='Gestión de Códigos Dinámicos'
        icon={<Barcode className='h-5 w-5 text-black' />}
      />

      <div className='rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-xl'>
        <div className='flex flex-col gap-3 border-b border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <Button
            size='sm'
            className='gap-1.5 bg-[#fbba0e] text-black font-semibold hover:bg-[#fbba0e]/90 transition'
            onClick={handleGenerate}
            disabled={generating}
          >
            <Barcode className='h-4 w-4' />
            {generating ? 'Generando...' : 'Generar Código'}
          </Button>
        </div>

        <TablePanel
          columns={columns}
          data={codes}
          pagination={
            meta
              ? {
                  count: meta.count,
                  next: meta.next,
                  previous: meta.previous,
                  page,
                  onPageChange: (p) => fetchCodes(p),
                  pageSize: 10,
                }
              : undefined
          }
        />

        <FooterPanel
          {...getServerFooterProps(meta, page, (p) => fetchCodes(p))}
        />
      </div>

      <Toaster position='bottom-right' richColors theme='dark' />
    </>
  );
};

export default DynamicCode;
