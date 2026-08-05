// types/partners.types.ts

export type PartnerType = 'Socio' | 'Colaborador' | 'Patrocinador';

/** Orden de presentación: el mismo que usa el endpoint público. */
export const PARTNER_TYPES: PartnerType[] = [
  'Patrocinador',
  'Colaborador',
  'Socio',
];

/** Catálogo de redes sociales. `logo` es el nombre del icono, no una URL. */
export type Network = {
  id: number;
  name: string;
  logo: string | null;
  is_active: boolean;
};

export type NetworkPayload = {
  name: string;
  logo?: string;
};

/** Enlace visto desde su auspiciador (respuesta aplanada). */
export type PartnerNetworkNested = {
  id: number;
  network_id: number;
  name: string; // nombre de la red social
  logo: string | null; // icono de la red social
  link: string;
  is_active: boolean;
};

/** Auspiciador tal como lo devuelve el listado/detalle del admin. */
export type Partner = {
  id: number;
  type: PartnerType;
  name: string;
  description: string;
  logo: string; // URL de Cloudinary (.webp)
  networks: PartnerNetworkNested[]; // solo en los GET
  is_active: boolean;
};

/** Enlace tal como lo devuelve el listado del admin (relaciones anidadas). */
export type PartnerNetworkDetail = {
  id: number;
  network: Network;
  partner: Omit<Partner, 'networks'>;
  link: string;
  is_active: boolean;
};

/** En escritura las relaciones se mandan como ids, no como objetos. */
export type PartnerNetworkPayload = {
  partner: number;
  network: number;
  link: string;
};
