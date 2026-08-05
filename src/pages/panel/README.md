# `src/pages/panel`

Una carpeta por dominio (Activity, Speaker, QuotaType, …). Las páginas se construyen con **hooks + layout compartidos** (`src/hooks`, `./components`), no con estado a mano.

Ejemplos canónicos: `Activity/Activity.tsx` (layout completo) y `PartnerUniversity/PartnerUniversity.tsx` (paginación de servidor).

## Anatomía de un dominio

| Archivo | Rol |
|---|---|
| `columns.ts(x)` | Definición de columnas de la tabla. |
| `fields.ts` | Definición de campos del formulario (`input`/`select`/`file`/`photo`/…). |
| `<domain>.types.ts` | `XForm`, `FormErrors`, `emptyForm` y el conversor `formToPayload`/`buildFormData` (**definido una sola vez aquí**, importado por la página y por los ActionButtons). |
| `<Domain>ActionButtons.tsx` | Flujo "Crear" con `useResourceForm`. |
| `<Domain>.tsx` | Página: fetch al montar; editar/eliminar con `useCrudPanel`; render con `CrudPanelLayout` (o JSX propio en casos especiales). |
| `<Domain>TableButtons.tsx` | Botones de fila (recibe `onEdit`/`onDelete`/…). |
| `<Domain>Filters.tsx` | Filtros (selects) cuando aplica. |

## Receta — página con layout completo (client pagination)

```tsx
const filtered = items.filter(/* búsqueda + filtros */);
const pagination = useClientPagination(filtered);
const crud = useCrudPanel<Entity, EntityForm, EntityPayload>({
  items, remove, update, emptyForm, fields, mapToForm, toPayload, messages,
});
return (
  <CrudPanelLayout
    description="…" icon={…}
    toolbar={<XActionButtons />}
    search={search} setSearch={setSearch}
    columns={columns} data={pagination.paginated}
    renderRowActions={(row) => <XTableButtons row={row} onEdit={crud.onEdit} onDelete={crud.onDelete} />}
    filtered={filtered.length} total={items.length} pagination={pagination}
    deleteModal={crud.deleteModal} deleteTitle="…"
    editModal={crud.editModal} editTitle="…" editDescription="…" editIcon={…} editFields={fields}
  />
);
```

## Variantes

- **Paginación de servidor** (PartnerUniversity, Delegates, Participant, DynamicCode): JSX propio (no `CrudPanelLayout`); `useServerTable` para el refetch con debounce y `<FooterPanel {...getServerFooterProps(meta, page, onPageChange)} />` para el pie.
- **Cabeceras con estadísticas / overlays** (AvailableSlot, IndividualCup): JSX propio + `useCrudPanel` con `getEditFields` (campos dinámicos con `hint`) y `fieldErrors: true`. Indicadores con `components/SlotIndicator`.
- **Edición en modal aparte** (Participant): no usa formulario inline; modales gestionados con `useDisclosure`.
- **Entidad con hijos que se guardan por separado** (Partner): `CrudPanelLayout` para el auspiciador + `modals/ModalPartnerNetworks` para sus enlaces a redes (cada uno con su propio request). Tras crear, los ActionButtons avisan con `onCreated` para encadenar las redes.

## Reglas

- No dupliques `formToPayload`/`buildFormData`: vive en `<domain>.types.ts`.
- No re-implementes estado de modales/formularios/paginación: usa los hooks.
- Validación: `@/utils/validations`. Errores de API: `@/utils/apiError`. Toasts: Sonner.

Ver `./components/README.md` para los componentes compartidos y `src/hooks/README.md` para los hooks.
