# Plan de Arquitectura Backend

Estado actual:

- El backend es modular y funcional.
- Aún no sigue una arquitectura hexagonal completa por módulo.

Decisión:

- Priorizar seguridad, validación, multitenancy y contratos antes del refactor estructural mayor.
- Aceptar temporalmente la deuda de `controller + service + prisma`.

Plan futuro:

1. Tomar `products` como módulo piloto.
2. Separar `application`, `domain`, `infrastructure`, `presentation`.
3. Extraer puertos y repositorios.
4. Repetir patrón en `attributes`, `workflows` y `users`.
