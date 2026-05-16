import InputController from '../InputController';
import type { Field } from './formFields.types';

interface FormFieldsProps<T extends Record<string, unknown>> {
  fields: Field[];
  form: T;
  errors: Partial<Record<keyof T, string>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (id: string, value: string) => void;
  onFile?: (id: string, file: File | null) => void;
  currentPhoto?: string;
}

const FormFields = <T extends Record<string, unknown>>({
  fields,
  form,
  errors,
  onChange,
  onValueChange,
  onFile,
  currentPhoto,
}: FormFieldsProps<T>) => {
  const visibleFields = fields.filter((field) =>
    field.condition
      ? field.condition(form as Record<string, unknown>, currentPhoto)
      : true,
  );

  const rows: Field[][] = [];
  let i = 0;

  while (i < visibleFields.length) {
    const field = visibleFields[i];
    if (field.fullWidth) {
      rows.push([field]);
      i++;
    } else if (visibleFields[i + 1] && !visibleFields[i + 1].fullWidth) {
      rows.push([field, visibleFields[i + 1]]);
      i += 2;
    } else {
      rows.push([field]);
      i++;
    }
  }

  const renderField = (field: Field) => {
    const error = field.id
      ? (errors as Record<string, string>)[field.id]
      : undefined;

    if (field.kind === 'photo') {
      return (
        <InputController
          kind='photo'
          id={field.id}
          currentPhoto={currentPhoto} // 👈 viene de props, no del form
          value={field.id ? (form[field.id] as File | null) : null}
          onChange={(file) => field.id && onFile?.(field.id, file)}
          error={error}
        />
      );
    }

    if (field.kind === 'select') {
      return (
        <InputController
          kind='select'
          label={field.label}
          value={field.id ? ((form[field.id] as string) ?? '') : ''}
          onValueChange={(val) => field.id && onValueChange?.(field.id, val)}
          options={field.options ?? []}
          placeholder={field.placeholder}
          disabled={field.disabled}
          error={error}
        />
      );
    }

    if (field.kind === 'search-select') {
      return (
        <InputController
          kind='search-select'
          label={field.label}
          value={field.id ? ((form[field.id] as string) ?? '') : ''}
          options={field.options ?? []}
          onValueChange={(val) => field.id && onValueChange?.(field.id, val)}
          placeholder={field.placeholder}
          disabled={field.disabled}
          error={error}
        />
      );
    }

    if (field.kind === 'university-select') {
      return (
        <InputController
          kind='university-select'
          label={field.label}
          value={field.id ? ((form[field.id] as string) ?? '') : ''}
          initialName={(form['university_name'] as string) ?? ''}
          onValueChange={(code) => field.id && onValueChange?.(field.id, code)}
          disabled={field.disabled}
          error={error}
        />
      );
    }

    if (field.kind === 'input-checkbox') {
      return (
        <InputController
          kind='input-checkbox'
          id={field.id!}
          label={field.label}
          value={field.id ? ((form[field.id] as string) ?? '') : ''}
          onValueChange={(val) => field.id && onValueChange?.(field.id, val)}
          placeholder={field.placeholder}
          error={error}
        />
      );
    }

    if (field.kind === 'file') {
      return (
        <InputController
          kind='file'
          label={field.label}
          value={field.id ? (form[field.id] as File | null) : null}
          onChange={(file) => field.id && onFile?.(field.id, file ?? null)}
          error={error}
        />
      );
    }

    return (
      <InputController
        kind='input'
        id={field.id!}
        label={field.label!}
        type={field.type}
        value={field.id ? ((form[field.id] as string) ?? '') : ''}
        onChange={onChange}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        maxLength={field.maxLength}
        error={error}
      />
    );
  };

  return (
    <div className='flex flex-col gap-5 py-2'>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={
            row.length === 2 ? 'grid grid-cols-2 gap-4' : 'flex flex-col'
          }
        >
          {row.map((field) => (
            <div key={field.id}>
              {renderField(field)}
              {field.hint && (
                <div className='mt-1.5'>{field.hint(form as Record<string, unknown>)}</div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FormFields;
