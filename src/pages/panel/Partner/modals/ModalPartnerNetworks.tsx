import { useEffect, useState } from 'react';
import { Check, Link2, Plus, Share2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import ModalHeader from '../../components/modals/components/ModalHeader';
import ModalDelete from '../../components/modals/ModalDelete';
import NetworkIcon from '../../components/NetworkIcon';

import { usePartnerStore } from '@/store/usePartnerStore';
import { useNetworkStore } from '@/store/useNetworkStore';
import { extractApiError } from '@/utils/apiError';
import type { Partner, PartnerNetworkNested } from '@/types/partners.types';

interface Props {
  open: boolean;
  onClose: () => void;
  partner: Partner | null;
}

const MAX_LINK = 500;

const validateLink = (value: string): string | null => {
  const link = value.trim();
  if (!link) return 'El enlace es requerido.';
  if (link.length > MAX_LINK)
    return `El enlace no debe superar los ${MAX_LINK} caracteres.`;
  if (!/^https?:\/\/.+/i.test(link))
    return 'El enlace debe empezar con http:// o https://';
  return null;
};

/**
 * Gestiona los enlaces a redes sociales de un auspiciador. Vive aparte del
 * formulario del auspiciador porque son entidades distintas: cada enlace se
 * crea, edita y desactiva con su propio request.
 */
const ModalPartnerNetworks = ({ open, onClose, partner }: Props) => {
  const {
    partners,
    createPartnerLink,
    updatePartnerLink,
    removePartnerLink,
  } = usePartnerStore();
  const { networks: catalog, fetchNetworks } = useNetworkStore();

  // --- Alta ---
  const [networkId, setNetworkId] = useState('');
  const [link, setLink] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // --- Edición en línea ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingLink, setEditingLink] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // --- Baja ---
  const [toDelete, setToDelete] = useState<PartnerNetworkNested | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open) fetchNetworks();
  }, [open, fetchNetworks]);

  // Se lee del store para que la lista se refresque tras cada operación.
  const live = partners.find((p) => p.id === partner?.id) ?? partner;
  const links = live?.networks ?? [];

  // El backend rechaza dos enlaces activos del mismo auspiciador en la misma
  // red, así que las ya usadas no se ofrecen.
  const used = new Set(links.map((l) => l.network_id));
  const available = catalog.filter((n) => !used.has(n.id));

  const resetAddForm = () => {
    setNetworkId('');
    setLink('');
    setAddError(null);
  };

  const handleClose = () => {
    resetAddForm();
    setEditingId(null);
    onClose();
  };

  const handleAdd = async () => {
    if (!live) return;

    if (!networkId) {
      setAddError('Selecciona una red social.');
      return;
    }

    const error = validateLink(link);
    if (error) {
      setAddError(error);
      return;
    }

    setAdding(true);
    try {
      await createPartnerLink(live.id, Number(networkId), link.trim());
      toast.success('Enlace agregado correctamente.');
      resetAddForm();
    } catch (err) {
      toast.error(
        extractApiError(err, 'Error al agregar el enlace. Intenta nuevamente.'),
      );
    } finally {
      setAdding(false);
    }
  };

  const handleSaveEdit = async (row: PartnerNetworkNested) => {
    if (!live) return;

    const error = validateLink(editingLink);
    if (error) {
      toast.error(error);
      return;
    }

    setSavingEdit(true);
    try {
      await updatePartnerLink(live.id, row.id, editingLink.trim());
      toast.success('Enlace actualizado correctamente.');
      setEditingId(null);
    } catch (err) {
      toast.error(
        extractApiError(
          err,
          'Error al actualizar el enlace. Intenta nuevamente.',
        ),
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!live || !toDelete) return;

    setDeleting(true);
    try {
      await removePartnerLink(live.id, toDelete.id);
      toast.success('Enlace eliminado correctamente.');
      setToDelete(null);
    } catch (err) {
      toast.error(
        extractApiError(err, 'Error al eliminar el enlace. Intenta nuevamente.'),
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className='bg-[#1a1a1a] border border-white/10 text-slate-200 sm:max-w-lg max-h-[90vh] flex flex-col'>
          <ModalHeader
            title='Redes sociales'
            description={live?.name ?? 'Auspiciador'}
            icon={<Share2 className='h-4 w-4 text-black' />}
          />

          <div className='flex-1 min-h-0 overflow-y-auto px-1 py-2'>
            {/* ── Enlaces actuales ── */}
            {links.length === 0 ? (
              <div className='rounded-xl border border-dashed border-white/10 bg-[#111] py-8 text-center'>
                <Link2 className='mx-auto mb-2 h-5 w-5 text-slate-600' />
                <p className='text-xs text-slate-500'>
                  Este auspiciador todavía no tiene redes.
                </p>
              </div>
            ) : (
              <ul className='flex flex-col gap-2'>
                {links.map((row) => (
                  <li
                    key={row.id}
                    className='flex items-center gap-3 rounded-xl border border-white/10 bg-[#111] px-3 py-2.5'
                  >
                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300'>
                      <NetworkIcon logo={row.logo} className='h-3.5 w-3.5' />
                    </div>

                    <div className='min-w-0 flex-1'>
                      <p className='text-xs font-semibold text-slate-200'>
                        {row.name}
                      </p>

                      {editingId === row.id ? (
                        <Input
                          value={editingLink}
                          maxLength={MAX_LINK}
                          onChange={(e) => setEditingLink(e.target.value)}
                          className='mt-1 h-7 bg-[#1a1a1a] border-white/10 text-xs text-slate-200'
                        />
                      ) : (
                        <a
                          href={row.link}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='block truncate text-xs text-slate-500 hover:text-[#fbba0e] transition'
                        >
                          {row.link}
                        </a>
                      )}
                    </div>

                    {editingId === row.id ? (
                      <div className='flex shrink-0 items-center gap-1'>
                        <Button
                          size='sm'
                          variant='ghost'
                          disabled={savingEdit}
                          className='h-8 w-8 p-0 text-green-400 hover:bg-green-500/10 hover:text-green-300 transition cursor-pointer'
                          onClick={() => handleSaveEdit(row)}
                        >
                          <Check className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          disabled={savingEdit}
                          className='h-8 w-8 p-0 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition cursor-pointer'
                          onClick={() => setEditingId(null)}
                        >
                          <X className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    ) : (
                      <div className='flex shrink-0 items-center gap-1'>
                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-8 w-8 p-0 text-slate-400 hover:bg-yellow-500/10 hover:text-yellow-400 transition cursor-pointer'
                          onClick={() => {
                            setEditingId(row.id);
                            setEditingLink(row.link);
                          }}
                        >
                          <Link2 className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          className='h-8 w-8 p-0 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition cursor-pointer'
                          onClick={() => setToDelete(row)}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* ── Agregar enlace ── */}
            <div className='mt-5 rounded-xl border border-white/10 bg-[#111] p-3'>
              <Label className='mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400'>
                <Plus className='h-3 w-3 text-[#fbba0e]' />
                Agregar enlace
              </Label>

              {catalog.length === 0 ? (
                <p className='text-xs text-slate-500'>
                  No hay redes sociales en el catálogo. Crea una en la sección
                  «Redes sociales».
                </p>
              ) : available.length === 0 ? (
                <p className='text-xs text-slate-500'>
                  El auspiciador ya tiene un enlace en todas las redes
                  disponibles.
                </p>
              ) : (
                <div className='flex flex-col gap-2'>
                  <Select
                    value={networkId}
                    onValueChange={(val) => {
                      setNetworkId(val);
                      setAddError(null);
                    }}
                  >
                    <SelectTrigger className='bg-[#1a1a1a] border-white/10 text-slate-200 focus:ring-[#fbba0e] focus:ring-offset-0 text-sm cursor-pointer'>
                      <SelectValue placeholder='Red social' />
                    </SelectTrigger>
                    <SelectContent className='bg-[#1a1a1a] border-white/10 text-slate-200'>
                      {available.map((n) => (
                        <SelectItem
                          key={n.id}
                          value={n.id.toString()}
                          className='focus:bg-white/5 focus:text-slate-100 cursor-pointer'
                        >
                          <span className='flex items-center gap-2'>
                            <NetworkIcon logo={n.logo} className='h-3.5 w-3.5' />
                            {n.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className='flex gap-2'>
                    <Input
                      value={link}
                      maxLength={MAX_LINK}
                      placeholder='https://instagram.com/…'
                      onChange={(e) => {
                        setLink(e.target.value);
                        setAddError(null);
                      }}
                      className='bg-[#1a1a1a] border-white/10 text-sm text-slate-200'
                    />
                    <Button
                      size='sm'
                      disabled={adding}
                      className='shrink-0 gap-1.5 bg-[#fbba0e] text-black font-semibold hover:bg-[#fbba0e]/90 transition cursor-pointer'
                      onClick={handleAdd}
                    >
                      <Plus className='h-4 w-4' />
                      {adding ? 'Agregando...' : 'Agregar'}
                    </Button>
                  </div>

                  {addError && (
                    <p className='text-xs text-red-400'>{addError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ModalDelete
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title='Eliminar enlace'
        description={toDelete ? `el enlace de ${toDelete.name}` : undefined}
      />
    </>
  );
};

export default ModalPartnerNetworks;
