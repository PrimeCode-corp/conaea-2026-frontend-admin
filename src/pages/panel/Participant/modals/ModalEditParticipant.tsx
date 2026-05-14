import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import ModalForm from '../../components/modals/ModalForm';
import { getParticipantEditFields } from '../fields';
import { useParticipantStore } from '@/store/useParticipantStore';
import type { ParticipantTableItem } from '@/types/participants.types';
import axios from 'axios';

interface ModalEditParticipantProps {
  open: boolean;
  onClose: () => void;
  participant: ParticipantTableItem | null;
}

type FormState = Record<string, unknown>;

const ModalEditParticipant = ({
  open,
  onClose,
  participant,
}: ModalEditParticipantProps) => {
  const { updateParticipant } = useParticipantStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [form, setForm] = useState<FormState>({});

  useEffect(() => {
    if (participant) {
      setForm({
        first_name: participant.first_name ?? '',
        paternal_surname: participant.paternal_surname ?? '',
        maternal_surname: participant.maternal_surname ?? '',
        document_type: participant.document_type,
        identity_document: participant.identity_document,
        birthday: participant.birthday ?? '',
        cellphone: participant.cellphone,
        email: participant.email,
        academic_cycle: participant.academic_cycle ?? '',
        cod_university: participant.cod_university ?? '',
        university_name: participant.university_name ?? '',
        university_type: participant.university_type ?? '',
        quota_type: participant.quota_type ?? '',
        discapacidad: participant.discapacidad ?? '',
        alergia: participant.alergia ?? '',
        photograph: null,
      });
      setErrors({});
    }
  }, [participant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.id]: undefined }));
  };

  const handleValueChange = (id: string, value: string) => {
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleFile = (id: string, file: File | null) => {
    setForm((prev) => ({ ...prev, [id]: file }));
  };

  const handleSubmit = async () => {
    if (!participant) return;
    setLoading(true);
    setErrors({});

    const formData = new FormData();

    const textFields = [
      'first_name',
      'paternal_surname',
      'maternal_surname',
      'document_type',
      'identity_document',
      'birthday',
      'cellphone',
      'email',
      'academic_cycle',
      'cod_university',
      'university_type',
    ];

    textFields.forEach((key) => {
      const value = form[key];
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });

    // Siempre se envían para permitir el soft-delete (enviar "" desactiva el registro)
    formData.append('discapacidad', String(form.discapacidad ?? ''));
    formData.append('alergia', String(form.alergia ?? ''));

    if (form.photograph instanceof File) {
      formData.append('photograph', form.photograph);
    }

    try {
      await updateParticipant(participant.id, formData);
      toast.success('Participante actualizado correctamente.');
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        setErrors(error.response.data as Record<string, string>);
      } else {
        toast.error('Error al actualizar el participante.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalForm
      open={open}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
      title='Editar participante'
      description={participant?.full_name ?? ''}
      icon={<Users className='w-4 h-4 text-black' />}
      mode='edit'
      fields={getParticipantEditFields()}
      form={form}
      errors={errors}
      onChange={handleChange}
      onValueChange={handleValueChange}
      onFile={handleFile}
      currentPhoto={participant?.photograph}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};

export default ModalEditParticipant;
