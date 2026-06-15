interface CrudService<T, P, U> {
  getAll: () => Promise<T[]>;
  create: (payload: P) => Promise<T>;
  update: (id: number, payload: U) => Promise<T>;
  remove: (id: number) => Promise<unknown>;
}

interface CrudActionsConfig<State, T, P, U> {
  /** Clave del array en el estado (p. ej. `'quotaTypes'`). */
  key: keyof State;
  service: CrudService<T, P, U>;
  loadError: string;
  createError: string;
  updateError: string;
}

/**
 * Genera las acciones CRUD estándar (`fetch`/`create`/`update`/`remove`/
 * `invalidate`) de un store de lista cacheada, leyendo y escribiendo el array
 * en `config.key`. Cada store mapea estas acciones a sus claves nombradas
 * (`fetchDays`, `createDay`, …), conservando su API pública y permitiéndole
 * añadir estado/acciones propias.
 *
 * `P` es el payload de creación y `U` el de actualización (por defecto
 * `Partial<P>`; útil para stores que usan `FormData`).
 */
export function createCrudActions<
  State extends { loading: boolean; error: string | null },
  T extends { id: number },
  P,
  U = Partial<P>,
>(
  set: (partial: Partial<State>) => void,
  get: () => State,
  config: CrudActionsConfig<State, T, P, U>,
) {
  const { key, service, loadError, createError, updateError } = config;

  const getList = () => get()[key] as T[];
  const setList = (items: T[]) =>
    set({ [key]: items } as unknown as Partial<State>);

  const fetch = async () => {
    if (getList().length > 0) return;
    set({ loading: true, error: null } as Partial<State>);
    try {
      setList(await service.getAll());
    } catch {
      set({ error: loadError } as Partial<State>);
    } finally {
      set({ loading: false } as Partial<State>);
    }
  };

  return {
    fetch,
    create: async (payload: P) => {
      try {
        const created = await service.create(payload);
        setList([...getList(), created]);
      } catch {
        throw new Error(createError);
      }
    },
    update: async (id: number, payload: U) => {
      try {
        const updated = await service.update(id, payload);
        setList(getList().map((it) => (it.id === id ? updated : it)));
      } catch {
        throw new Error(updateError);
      }
    },
    remove: async (id: number) => {
      await service.remove(id);
      setList(getList().filter((it) => it.id !== id));
    },
    invalidate: async () => {
      setList([]);
      await fetch();
    },
  };
}
