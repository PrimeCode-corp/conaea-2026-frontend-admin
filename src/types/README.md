# `src/types`

Interfaces de TypeScript de las entidades del dominio, **una por dominio** (`activities.types.ts`, `speakers.types.ts`, …).

## Convenciones

- Tipos **de la entidad del backend** (la forma que devuelve la API). Ej.: `QuotaTypes`, `Speakers`, `Activities`.
- El payload de escritura se deriva: `type XPayload = Omit<X, 'id' | 'is_active'>`.
- Algunos dominios tienen una versión "detalle" con objetos anidados vs. una "plana" con ids (ej. `Activities` con `day: number` vs `ActivityDetail` con `day: Days`).

## ¿Tipos de entidad vs. tipos de formulario?

- Aquí viven los tipos **de la entidad/API**.
- Los tipos **del formulario** de cada página (`XForm`, `FormErrors`, `emptyForm`) y su conversor (`formToPayload`/`buildFormData`) viven junto a la página en `src/pages/panel/<Domain>/<domain>.types.ts`, no aquí.
