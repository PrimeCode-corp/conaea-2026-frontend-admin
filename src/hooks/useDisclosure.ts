import { useState } from 'react';

/**
 * Estado de apertura de un modal/panel, opcionalmente con un dato asociado
 * (la fila o entidad sobre la que actúa). Reemplaza los pares
 * `const [open, setOpen]` + `const [data, setData]` repetidos.
 *
 * - `show(payload)` abre y guarda el dato.
 * - `hide()` cierra y limpia el dato.
 */
export function useDisclosure<T = void>() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const show = (payload?: T) => {
    if (payload !== undefined) setData(payload);
    setOpen(true);
  };

  const hide = () => {
    setOpen(false);
    setData(null);
  };

  return { open, setOpen, data, show, hide };
}
