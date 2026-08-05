# `src/pages/panel/components`

Componentes compartidos por las páginas del panel. (Los componentes shadcn/ui genéricos viven en `src/components/ui`.)

## Layout y tabla

| Componente | Rol |
|---|---|
| `CrudPanelLayout` | Esqueleto JSX común: `HeaderPanel` + barra (toolbar + búsqueda) + `TablePanel` + `FooterPanel` + `ModalDelete` + `ModalForm`. Recibe los bundles `deleteModal`/`editModal` de `useCrudPanel`. Asume paginación client-side. Acepta `children` para modales extra. |
| `HeaderPanel` | Encabezado con icono, título, descripción y `actions` opcionales (p. ej. estadísticas). |
| `TablePanel` | Tabla con header, skeletons de carga, estado vacío y numerado de filas. **No** renderiza paginación: su prop `pagination` solo se usa para el numerado global. Hijo opcional: render de acciones por fila. |
| `FooterPanel` | Pie con conteo y **única** UI de paginación numerada (números + elipsis). La usan client y server (server arma props con `getServerFooterProps`). |
| `PagerButton` | Botón de navegación (primera/anterior/siguiente/última) usado por `FooterPanel`. |
| `SearchPanel` | Input de búsqueda. |
| `SlotIndicator` | Indicador vertical "máximo / usado" (AvailableSlot, IndividualCup). |
| `NetworkIcon` | Icono de una red social a partir de `Network.logo` (identificador, no URL), con fallback. Exporta `NETWORK_ICON_OPTIONS`, el catálogo que alimenta el select del formulario (Network, Partner). |

## Modales (`modals/`)

| Componente | Rol |
|---|---|
| `ModalForm` | Modal de formulario genérico (crear/editar); renderiza `FormFields`. Props: `mode`, `fields`, `form`, `errors`, `onChange`, `onValueChange`, `onFile`, `onSubmit`, `currentPhoto`. |
| `ModalDelete` | Confirmación de borrado. |
| `ModalImage` | Preview de imagen. |
| `components/ModalHeader` | Encabezado reutilizable de los modales. |

## Formularios (`FormFields/`, `InputController/`)

- `FormFields` recorre la definición de `fields` y delega cada campo en el `InputController`.
- `InputController/` resuelve el tipo de campo: `FormInput`, `FormFile`, `FormPhoto`, `FormSearchSelect`, `FormUniversitySelect`, etc.
- El tipo `Field` vive en `FormFields/formFields.types.ts` (`kind`, `id`, `required`, `requiredOnCreate`, `condition`, `hint`, `validate`, …).
- `validate(value, form)` es la validación propia del campo (formato/peso de una imagen, duplicados…): la ejecuta `@/utils/validations` tras la de requerido y devuelve el mensaje o `null`.

## Convenciones

- Antes de añadir un componente aquí, comprueba que no exista ya uno que cubra el caso.
- La paginación está unificada: no reintroduzcas UI de paginación en `TablePanel`.
