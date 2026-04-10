import {
  LayoutDashboard,
  CalendarDays,
  Brackets,
  Mic2,
  ActivityIcon,
  DollarSign,
  ChartSpline,
  Ticket,
  University,
  Barcode,
  Users,
} from 'lucide-react';

import type { NavGroup } from './appSidebar.types';

export const navGroups: NavGroup[] = [
  {
    label: 'General',
    items: [{ label: 'Inicio', path: '/', icon: LayoutDashboard }],
  },
  {
    label: 'Académico',
    items: [
      { label: 'Participantes', path: '/participant', icon: Users },
      { label: 'Universidades', path: '/partner-university', icon: University },
      { label: 'Códigos de General', path: '/dynamic-code', icon: Barcode },
    ],
  },
  {
    label: 'Registro',
    items: [
      { label: 'Cupos', path: '/available-slot', icon: Ticket },
      { label: 'Pre-venta', path: '/pre-sale', icon: ChartSpline },
      { label: 'Tipos de Cuota', path: '/quota-type', icon: DollarSign },
    ],
  },
  {
    label: 'Cronograma',
    items: [
      { label: 'Actividades', path: '/activity', icon: ActivityIcon },
      { label: 'Tipo de Actividad', path: '/activity-type', icon: Brackets },
      { label: 'Días', path: '/day', icon: CalendarDays },
    ],
  },
  {
    label: 'Participantes',
    items: [{ label: 'Speakers', path: '/speaker', icon: Mic2 }],
  },
];
