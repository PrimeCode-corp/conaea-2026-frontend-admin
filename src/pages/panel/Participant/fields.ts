import type { Field } from '../components/FormFields/formFields.types';

export const getParticipantEditFields = (): Field[] => [
  {
    kind: 'photo',
    id: 'photograph',
    fullWidth: true,
  },
  {
    kind: 'input',
    id: 'first_name',
    label: 'Nombres',
    placeholder: 'Ej. Juan Carlos',
    fullWidth: false,
  },
  {
    kind: 'input',
    id: 'paternal_surname',
    label: 'Apellido Paterno',
    placeholder: 'Ej. Pérez',
    fullWidth: false,
  },
  {
    kind: 'input',
    id: 'maternal_surname',
    label: 'Apellido Materno',
    placeholder: 'Ej. López',
    fullWidth: false,
  },
  {
    kind: 'select',
    id: 'document_type',
    label: 'Tipo de documento',
    placeholder: 'Seleccionar…',
    fullWidth: false,
    options: [
      { value: 'DNI', label: 'DNI' },
      { value: 'PASAPORTE', label: 'Pasaporte' },
    ],
  },
  {
    kind: 'input',
    id: 'identity_document',
    label: 'Nro. de documento',
    placeholder: '12345678',
    maxLength: 10,
    fullWidth: false,
  },
  // {
  //   kind: 'input',
  //   id: 'birthday',
  //   label: 'F. Nacimiento',
  //   type: 'date',
  //   fullWidth: false,
  // },
  {
    kind: 'input',
    id: 'cellphone',
    label: 'Teléfono',
    placeholder: '+51 999 999 999',
    fullWidth: false,
  },
  {
    kind: 'input',
    id: 'email',
    label: 'Correo electrónico',
    type: 'email',
    placeholder: 'correo@universidad.edu.pe',
    fullWidth: true,
  },
  // {
  //   kind: 'select',
  //   id: 'academic_cycle',
  //   label: 'Ciclo académico',
  //   placeholder: 'Seleccionar ciclo…',
  //   fullWidth: false,
  //   options: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'].map(
  //     (c) => ({
  //       value: c,
  //       label: c,
  //     }),
  //   ),
  // },
];
