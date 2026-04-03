# Backend ccasa: `POST /api/v1/auth/register` — cuerpo de la petición

## Controlador

En `AuthController`, el método `register` recibe el cuerpo JSON como **`AuthRegisterRequestDTO`**:

```java
public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody AuthRegisterRequestDTO request) {
	return ResponseEntity.ok(authService.register(request));
```

Archivo: `ccasaBackend/src/main/java/com/backend/ccasa/controllers/AuthController.java`

---

## DTO completo: `AuthRegisterRequestDTO.java`

Ruta: `ccasaBackend/src/main/java/com/backend/ccasa/service/models/dtos/AuthRegisterRequestDTO.java`

```java
package com.backend.ccasa.service.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.io.Serializable;

public record AuthRegisterRequestDTO(
	@NotBlank String firstName,
	@NotBlank String lastName,
	@NotBlank @Email String email,
	@NotBlank String password
) implements Serializable {
}
```

---

## Contrato JSON esperado

| Campo       | Tipo   | Validación        |
|------------|--------|-------------------|
| `firstName` | string | no vacío          |
| `lastName`  | string | no vacío          |
| `email`     | string | no vacío, formato email |
| `password`  | string | no vacío          |

La respuesta exitosa es `AuthResponseDTO` (mismo estilo que login: token, userId, email, role), según el servicio `IAuthService.register`.
