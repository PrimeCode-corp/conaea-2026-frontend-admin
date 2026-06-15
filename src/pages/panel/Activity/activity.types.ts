import type { Activities } from '@/types/activities.types';

export type ActivityForm = {
  name: string;
  order: string;
  start_date: string;
  duration: string;
  location: string;
  capacity: string;
  day: string;
  activity_type: string;
  speaker: string;
};

export type FormErrors = Partial<Record<keyof ActivityForm, string>>;

export type ActivityPayload = Omit<Activities, 'id' | 'is_active'>;

export const emptyForm: ActivityForm = {
  name: '',
  order: '1',
  start_date: '',
  duration: '',
  location: '',
  capacity: '0',
  day: '',
  activity_type: '',
  speaker: '',
};

export const formToPayload = (form: ActivityForm): ActivityPayload => ({
  name: form.name,
  order: Number(form.order),
  start_date: form.start_date,
  duration: Number(form.duration),
  location: form.location,
  capacity: Number(form.capacity),
  day: Number(form.day),
  activity_type: Number(form.activity_type),
  speaker: Number(form.speaker),
});
