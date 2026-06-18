# Paginación Backend

- Los endpoints listados de negocio devuelven forma homogénea mediante `paginated()`.
- Forma estándar:
  - `data`
  - `meta.page`
  - `meta.pageSize`
  - `meta.total`
- Módulos cubiertos: `attributes`, `products`, `categories`, `imports`, `exports`, `channels`, `workflows.tasks`, `assets`, `gdsn`, `users`.
- Excepciones intencionadas:
  - `dashboard` devuelve agregados.
  - `search` devuelve autocompletado compacto.
  - `mappings` devuelve la configuración completa del tenant.
