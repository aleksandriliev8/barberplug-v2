package com.barberplug.gallery;

/** An upload that cannot become a Gallery Image. {@link #code()} is the API error code. */
public class ImageRejectedException extends RuntimeException {

    private final String code;

    public ImageRejectedException(String code, String message) {
        super(message);
        this.code = code;
    }

    public ImageRejectedException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
