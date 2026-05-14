import React from 'react';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormFile from './FormFile';
import FormPhoto from './FormPhoto';
import FormInputCheckbox from './FormInputCheckbox';
import FormUniversitySelect from './FormUniversitySelect';

interface Option {
  label: string;
  value: string;
}

type BaseProps = {
  label?: string;
  error?: string;
};

type InputProps = BaseProps & {
  kind: 'input';
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  maxLength?: number;
};

type SelectProps = BaseProps & {
  kind: 'select';
  value: string;
  onValueChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
};

type FileProps = BaseProps & {
  kind: 'file';
  value: File | null;
  onChange: (file: File | null) => void;
};

type PhotoProps = BaseProps & {
  kind: 'photo';
  id?: string;
  currentPhoto?: string;
  value: File | null;
  onChange: (file: File | null) => void;
};

type InputCheckboxProps = BaseProps & {
  kind: 'input-checkbox';
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
};

type UniversitySelectProps = BaseProps & {
  kind: 'university-select';
  value: string;
  initialName?: string;
  onValueChange: (code: string) => void;
  disabled?: boolean;
};

type InputControllerProps =
  | InputProps
  | SelectProps
  | FileProps
  | PhotoProps
  | InputCheckboxProps
  | UniversitySelectProps;

const InputController = ({ kind, ...props }: InputControllerProps) => {
  if (kind === 'select')
    return <FormSelect {...(props as Omit<SelectProps, 'kind'>)} />;
  if (kind === 'file')
    return <FormFile {...(props as Omit<FileProps, 'kind'>)} />;
  if (kind === 'photo')
    return <FormPhoto {...(props as Omit<PhotoProps, 'kind'>)} />;
  if (kind === 'input-checkbox')
    return <FormInputCheckbox {...(props as Omit<InputCheckboxProps, 'kind'>)} />;
  if (kind === 'university-select')
    return <FormUniversitySelect {...(props as Omit<UniversitySelectProps, 'kind'>)} />;
  return <FormInput {...(props as Omit<InputProps, 'kind'>)} />;
};

export default InputController;
