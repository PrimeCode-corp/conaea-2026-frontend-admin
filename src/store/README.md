# `src/store`

Stores de Zustand, **uno por dominio**. Cada store posee su lista + `loading` + `error` y las acciones asíncronas que llaman al servicio correspondiente.

## Stores de lista (CRUD simple)

Usan la factory `createCrudActions` (`createCrudActions.ts`) para generar `fetch`/`create`/`update`/`remove`/`invalidate`, y las mapean a sus **claves nombradas** para no romper a los consumidores:

```ts
export const useQuotaTypeStore = create<QuotaTypeStore>((set, get) => {
  const crud = createCrudActions<QuotaTypeStore, QuotaTypes, QuotaTypePayload>(
    set,
    get,
    {
      key: 'quotaTypes',
      service: quotaTypeService,
      loadError: 'Error al cargar los tipos de cuota',
      createError: 'Error al crear el tipo de cuota',
      updateError: 'Error al actualizar el tipo de cuota',
    },
  );
  return {
    quotaTypes: [],
    loading: false,
    error: null,
    fetchQuotaTypes: crud.fetch,
    createQuotaType: crud.create,
    updateQuotaType: crud.update,
    removeQuotaType: crud.remove,
    invalidateQuotaTypes: crud.invalidate,
  };
});
```

- Las claves se mantienen nombradas (`fetchDays`, etc.) a propósito: varias páginas componen distintos stores, y claves genéricas (`items`/`fetch`) colisionarían.
- `fetch` cachea: si la lista ya tiene elementos, no vuelve a pedir (usa `invalidate` para forzar).
- El store puede añadir estado/acciones propias junto a las de la factory (ver `useDayStore`, que añade `activities`/`fetchActivities`).
- Para payloads de actualización distintos al de creación (p. ej. `FormData`), pasa el 4º genérico: `createCrudActions<Store, T, FormData, FormData>(...)` (ver `useSpeakerStore`).

Usan la factory: `useDayStore`, `useActivityTypeStore`, `useQuotaTypeStore`, `useSpeakerStore`.

## Stores especiales (no factory)

- **Paginación de servidor** (`usePartnerUniversityStore`, `useDelegateStore`, `useParticipantStore`, `useDynamicCodeStore`): guardan `meta`/`page` y aceptan filtros en `fetch`.
- **`useActivityStore`**: la lista es `ActivityDetail[]` (objetos anidados); create/update re-piden el detalle.
- **`useAuthStore`**: JWT (access+refresh), refresh automático (30s antes de expirar), cola de requests durante el refresh; usa `persist` a localStorage.

## Convenciones

- Las acciones lanzan (`throw`) en error para que la UI las capture; no muestran toasts (eso vive en los hooks/páginas).
- `remove` es soft-delete (`PATCH { is_active: false }`) — ver `src/services`.
