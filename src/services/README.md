# `src/services`

Wrappers finos sobre Axios, **uno por dominio**. Cada servicio es un objeto literal cuyos métodos usan la instancia `api` (`src/lib/axios.ts`) y devuelven `res.data` directamente.

```ts
export const quotaTypeService = {
  getAll: () => api.get<QuotaTypes[]>('/register/quota-type/').then((r) => r.data),
  getById: (id) => api.get<QuotaTypes>(`/register/quota-type/${id}/`).then((r) => r.data),
  create: (payload) => api.post<QuotaTypes>('/register/quota-type/', payload).then((r) => r.data),
  update: (id, payload) => api.put<QuotaTypes>(`/register/quota-type/${id}/`, payload).then((r) => r.data),
  remove: (id) => api.patch<QuotaTypes>(`/register/quota-type/${id}/`, { is_active: false }).then((r) => r.data),
};
```

## Convenciones

- No instanciar Axios aquí: importar siempre `api` de `@/lib/axios` (lleva `baseURL`, `Authorization` y refresh de token en interceptores).
- **`remove` es soft-delete**: `PATCH { is_active: false }`, y devuelve la entidad (no `void`). Por eso `createCrudActions` tipa `remove` como `Promise<unknown>`.
- Sin manejo de errores ni toasts: dejar que el error propague para que el store/hook lo gestione.
- Listas paginadas en servidor devuelven `{ count, next, previous, results }`; el método acepta `page` y filtros.
- El payload suele ser `Omit<Entity, 'id' | 'is_active'>`; subidas con archivos usan `FormData`.
