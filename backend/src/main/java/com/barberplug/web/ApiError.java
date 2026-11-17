package com.barberplug.web;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

/**
 * Error body for every API failure. `error` and the `fields` values are stable codes
 * (for example `invalid_credentials`, `too_short`); the frontend turns them into BG/EN text.
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiError(String error, Map<String, String> fields) {

    public static ApiError of(String error) {
        return new ApiError(error, Map.of());
    }

    public static ApiError fields(Map<String, String> fields) {
        return new ApiError("validation_failed", fields);
    }
}
