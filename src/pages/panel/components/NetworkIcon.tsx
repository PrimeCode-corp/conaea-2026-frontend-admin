import {
  AtSign,
  Facebook,
  Globe,
  Instagram,
  Link as LinkIcon,
  Linkedin,
  MessageCircle,
  Music,
  Send,
  Twitch,
  Twitter,
  Youtube,
} from 'lucide-react';

/**
 * Iconos que el frontend sabe pintar para una red social. El `value` es lo que
 * se guarda en `Network.logo` (máx. 20 caracteres) y lo que consume también la
 * landing pública, así que no lo cambies sin migrar los registros existentes.
 */
export const NETWORK_ICON_OPTIONS = [
  { value: 'instagram', label: 'Instagram', Icon: Instagram },
  { value: 'facebook', label: 'Facebook', Icon: Facebook },
  { value: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { value: 'youtube', label: 'YouTube', Icon: Youtube },
  { value: 'twitter', label: 'X / Twitter', Icon: Twitter },
  { value: 'tiktok', label: 'TikTok', Icon: Music },
  { value: 'twitch', label: 'Twitch', Icon: Twitch },
  { value: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle },
  { value: 'telegram', label: 'Telegram', Icon: Send },
  { value: 'threads', label: 'Threads', Icon: AtSign },
  { value: 'website', label: 'Sitio web', Icon: Globe },
] as const;

interface NetworkIconProps {
  /** Identificador del icono (`Network.logo`). */
  logo: string | null | undefined;
  className?: string;
}

/** Pinta el icono de una red social, con fallback si el valor no está mapeado. */
const NetworkIcon = ({ logo, className = 'h-4 w-4' }: NetworkIconProps) => {
  const option = NETWORK_ICON_OPTIONS.find(
    (o) => o.value === logo?.trim().toLowerCase(),
  );
  const Icon = option?.Icon ?? LinkIcon;

  return <Icon className={className} />;
};

export default NetworkIcon;
