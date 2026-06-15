export type SpeakerForm = {
  name: string;
  title: string;
  bio: string;
  photo: File | null;
};

export type FormErrors = Partial<Record<keyof SpeakerForm, string>>;

export const emptyForm: SpeakerForm = {
  name: '',
  title: '',
  bio: '',
  photo: null,
};

export const buildFormData = (form: SpeakerForm): FormData => {
  const fd = new FormData();
  fd.append('name', form.name);
  fd.append('title', form.title);
  fd.append('bio', form.bio);
  if (form.photo) fd.append('photo', form.photo);
  return fd;
};
