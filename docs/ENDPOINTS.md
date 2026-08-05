# Endpoints consumidos por el frontend

Lista completa de endpoints HTTP que consume este panel de administración.

- **Base URL:** `VITE_API_URL` (por defecto `http://127.0.0.1:8000/api`). Todas las rutas son relativas a esa base.
- **Cliente:** instancia única de Axios en `src/lib/axios.ts`. Adjunta `Authorization: Bearer <access>` y, ante un `401`, refresca el token y reintenta.
- **Capa de consumo:** todas las llamadas viven en `src/services/*` (salvo el refresh, que se dispara desde el interceptor).
- **Borrado:** salvo una excepción, `remove` es *soft-delete* vía `PATCH { is_active: false }` (no `DELETE`).

> Generado a partir de `src/services/*` y `src/lib/axios.ts`. Si agregas/cambias una llamada, actualiza este archivo.

---

## Autenticación y seguridad

| Método | Endpoint | Origen | Notas |
|---|---|---|---|
| POST | `/token/` | `authService.login` | Login (username + password) → access/refresh |
| POST | `/token/refresh/` | `authService.refreshToken` y el interceptor de `lib/axios.ts` | Refresca el access token |
| POST | `/security/change-password/` | `authService.changePassword` | `current_password`, `new_password` |
| POST | `/security/validation-admin/enrollment/{id}/` | `validationService.toggleEnrollment` | Alterna validación de inscripción |
| POST | `/security/validation-admin/transaction/{id}/` | `validationService.toggleTransaction` | Alterna validación de transacción |
| POST | `/security/validation-admin/registration/{id}/` | `validationService.toggleRegistration` | Alterna validación de registro |
| GET | `/security/email-logs/` | `emailLogService.getByParticipant`, `getLastStatus` | Params: `participant_id`, `status`, `page`, `page_size` |
| POST | `/security/resend-email/` | `emailLogService.resend` | `participant_id` |

## Dashboard

| Método | Endpoint | Origen | Notas |
|---|---|---|---|
| GET | `/dashboard/` | `dashboardService.get` | Datos del panel de inicio |

## Actividades (`/activities`)

| Método | Endpoint | Origen | Notas |
|---|---|---|---|
| GET | `/activities/day/` | `dayService.getAll` | |
| GET | `/activities/day/{id}/` | `dayService.getById` | |
| POST | `/activities/day/` | `dayService.create` | |
| PUT | `/activities/day/{id}/` | `dayService.update` | |
| PATCH | `/activities/day/{id}/` | `dayService.remove` | Soft-delete (`is_active:false`) |
| GET | `/activities/day/{id}/activities/` | `dayService.getActivities` | Actividades de un día |
| GET | `/activities/activity/` | `activityService.getAll` | Params: `day_id`, `activity_type_id`, `speaker_id` |
| GET | `/activities/activity/{id}/` | `activityService.getById` | |
| POST | `/activities/activity/` | `activityService.create` | |
| PATCH | `/activities/activity/{id}/` | `activityService.update` | |
| PATCH | `/activities/activity/{id}/` | `activityService.remove` | Soft-delete |
| GET | `/activities/activity-type/` | `activityTypeService.getAll` | |
| GET | `/activities/activity-type/{id}/` | `activityTypeService.getById` | |
| POST | `/activities/activity-type/` | `activityTypeService.create` | |
| PUT | `/activities/activity-type/{id}/` | `activityTypeService.update` | |
| PATCH | `/activities/activity-type/{id}/` | `activityTypeService.remove` | Soft-delete |
| GET | `/activities/speaker/` | `speakerService.getAll` | |
| GET | `/activities/speaker/{id}/` | `speakerService.getById` | |
| POST | `/activities/speaker/` | `speakerService.create` | `multipart/form-data` (foto) |
| PATCH | `/activities/speaker/{id}/` | `speakerService.update` | `multipart/form-data` (foto) |
| PATCH | `/activities/speaker/{id}/` | `speakerService.remove` | Soft-delete |

## Registro (`/register`)

| Método | Endpoint | Origen | Notas |
|---|---|---|---|
| GET | `/register/quota-type/` | `quotaTypeService.getAll` | |
| GET | `/register/quota-type/{id}/` | `quotaTypeService.getById` | |
| POST | `/register/quota-type/` | `quotaTypeService.create` | |
| PUT | `/register/quota-type/{id}/` | `quotaTypeService.update` | |
| PATCH | `/register/quota-type/{id}/` | `quotaTypeService.remove` | Soft-delete |
| GET | `/register/pre-sale/` | `preSaleService.getAll` | |
| GET | `/register/pre-sale/{id}/` | `preSaleService.getById` | |
| POST | `/register/pre-sale/` | `preSaleService.create` | |
| PUT | `/register/pre-sale/{id}/` | `preSaleService.update` | |
| PATCH | `/register/pre-sale/{id}/` | `preSaleService.toggleBookingMode` | `{ booking_mode }` |
| PATCH | `/register/pre-sale/{id}/` | `preSaleService.remove` | Soft-delete |
| GET | `/register/pre-sale/{id}/slots/` | `preSaleService.getSlots` | |
| GET | `/register/available-slot/` | `availableSlotService.getAll` | Params: `pre_sale_id`, `quota_type_id` |
| GET | `/register/available-slot/{id}/` | `availableSlotService.getById` | |
| POST | `/register/available-slot/` | `availableSlotService.create` | |
| PUT | `/register/available-slot/{id}/` | `availableSlotService.update` | |
| PATCH | `/register/available-slot/{id}/` | `availableSlotService.remove` | Soft-delete |
| GET | `/register/individual-cup/` | `individualCupService.getAll` | Params: `pre_sale_id`, `partner_university_id`, `quota_type_id` |
| GET | `/register/individual-cup/{id}/` | `individualCupService.getById` | |
| POST | `/register/individual-cup/` | `individualCupService.create` | |
| PUT | `/register/individual-cup/{id}/` | `individualCupService.update` | |
| PATCH | `/register/individual-cup/{id}/` | `individualCupService.remove` | Soft-delete |
| GET | `/register/dynamic-code/` | `dynamicCodeService.getAll` | Params: `page`, `status`, `quota_type_id` |
| POST | `/register/dynamic-code/generate/` | `dynamicCodeService.generate` | Genera un código |
| PATCH | `/register/transaction/{id}/` | `voucherService.update`, `updateDetails` | `multipart/form-data` (voucher / detalles de pago) |

## Participantes (`/participants`)

| Método | Endpoint | Origen | Notas |
|---|---|---|---|
| GET | `/participants/table/` | `participantService.getTable` | Filtros: `pre_sale_id`, `document_type`, `quota_type_id`, `university_code`, `search`, `page` |
| PATCH | `/participants/participant/{id}/update/` | `participantService.update` | `multipart/form-data` |
| PATCH | `/participants/participant/{id}/deactivate/` | `participantService.remove` | Soft-delete |
| GET | `/participants/stats/` | `participantService.getStats` | `total`, `validated`, `pending` |
| POST | `/participants/export/` | `participantService.startExport` | Arranca la exportación → `202 { task_id, total, … }` (`204` si no hay resultados). Filtros: `pre_sale_id`, `quota_type_id`, `university_code` |
| GET | `/participants/export/{task_id}/` | `participantService.getExportStatus` | Avance: `status`, `processed`, `total`, `progress`, `download_url`. Se sondea cada `retry_after` segundos |
| DELETE | `/participants/export/{task_id}/` | `participantService.cancelExport` | Cancela la exportación en el servidor |
| GET | `/participants/export/{task_id}/download/` | `participantService.downloadExport` | El `.zip` ya generado (`410` si venció). Con `fetch` en vez de axios, para escribir la respuesta a disco en streaming |
| GET | `/participants/export/excel/` | `participantService.exportExcel` | El `.xlsx` con datos y enlaces (`204` si no hay resultados). Síncrono, sin tope de participantes. También con `fetch` |
| PATCH | `/participants/enrollment/{id}/` | `enrollmentService.update` | `multipart/form-data` |
| GET | `/participants/partner-universities/` | `partnerUniversityService.getAll` | Params: `page`, `search`, `quota_type_id`, `page_size` |
| GET | `/participants/partner-universities/{id}/` | `partnerUniversityService.getById` | |
| POST | `/participants/partner-universities/` | `partnerUniversityService.create` | |
| PUT | `/participants/partner-universities/{id}/` | `partnerUniversityService.update` | |
| PATCH | `/participants/partner-universities/{id}/` | `partnerUniversityService.remove` | Soft-delete |
| GET | `/participants/partner-universities/{id}/delegates/` | `partnerUniversityService.getDelegates` | |
| GET | `/participants/partner-universities/select/` | `partnerUniversityService.search` | Params: `search` |
| GET | `/participants/delegates/` | `delegateService.list` | Params: `partner_university_id`, `search`, `page`, `page_size` |
| GET | `/participants/delegates/{id}/` | `delegateService.getById` | |
| POST | `/participants/delegates/` | `delegateService.create` | |
| PATCH | `/participants/delegates/{id}/` | `delegateService.update` | |
| DELETE | `/participants/delegates/{id}/` | `delegateService.remove` | **Hard-delete** (única excepción: usa `DELETE`) |
