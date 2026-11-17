package com.barberplug.owner;

import com.barberplug.web.ApiError;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.security.Principal;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** The signed-in Owner's own account. */
@RestController
@RequestMapping("/api/owner")
class OwnerAccountController {

    private final OwnerAccountService accounts;

    OwnerAccountController(OwnerAccountService accounts) {
        this.accounts = accounts;
    }

    record ChangePasswordRequest(
            @NotNull(message = "required") String currentPassword,
            @NotNull(message = "required") String newPassword) {}

    @PutMapping("/password")
    ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request, Principal principal) {
        Map<String, String> errors =
                accounts.changePassword(principal.getName(), request.currentPassword(), request.newPassword());
        return errors.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.badRequest().body(ApiError.fields(errors));
    }
}
