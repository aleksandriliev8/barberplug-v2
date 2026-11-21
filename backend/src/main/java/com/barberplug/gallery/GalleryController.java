package com.barberplug.gallery;

import com.barberplug.gallery.GalleryService.GalleryImageNotFoundException;
import com.barberplug.gallery.GalleryService.GalleryOrderMismatchException;
import com.barberplug.web.ApiError;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Gallery API. GET /api/gallery is public (Visitors); everything under /api/admin/gallery
 * needs the signed-in Owner (see SecurityConfig).
 */
@RestController
class GalleryController {

    static final int MAX_CAPTION_LENGTH = 300;

    private final GalleryService gallery;

    GalleryController(GalleryService gallery) {
        this.gallery = gallery;
    }

    record GalleryImageResponse(
            UUID id,
            String captionBg,
            String captionEn,
            String thumbUrl,
            int thumbWidth,
            int thumbHeight,
            String largeUrl,
            int largeWidth,
            int largeHeight) {}

    record CaptionsRequest(
            @Size(max = MAX_CAPTION_LENGTH, message = "too_long") String captionBg,
            @Size(max = MAX_CAPTION_LENGTH, message = "too_long") String captionEn) {}

    record OrderRequest(@NotNull(message = "required") List<@NotNull UUID> ids) {}

    @GetMapping("/api/gallery")
    List<GalleryImageResponse> list() {
        return gallery.list().stream().map(this::toResponse).toList();
    }

    @PostMapping(path = "/api/admin/gallery", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<GalleryImageResponse> upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new ImageRejectedException("empty_file", "The file is empty");
        }
        GalleryImage image = gallery.upload(file.getBytes());
        return ResponseEntity.created(URI.create("/api/admin/gallery/" + image.getId())).body(toResponse(image));
    }

    @PatchMapping("/api/admin/gallery/{id}")
    GalleryImageResponse updateCaptions(@PathVariable UUID id, @Valid @RequestBody CaptionsRequest request) {
        return toResponse(gallery.updateCaptions(id, request.captionBg(), request.captionEn()));
    }

    @PutMapping("/api/admin/gallery/order")
    ResponseEntity<Void> reorder(@Valid @RequestBody OrderRequest request) {
        gallery.reorder(request.ids());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/admin/gallery/{id}")
    ResponseEntity<Void> delete(@PathVariable UUID id) {
        gallery.delete(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(ImageRejectedException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ApiError rejected(ImageRejectedException rejected) {
        return ApiError.of(rejected.code());
    }

    @ExceptionHandler(GalleryImageNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    ApiError notFound() {
        return ApiError.of("not_found");
    }

    @ExceptionHandler(GalleryOrderMismatchException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    ApiError orderMismatch() {
        return ApiError.of("order_mismatch");
    }

    private GalleryImageResponse toResponse(GalleryImage image) {
        return new GalleryImageResponse(
                image.getId(),
                image.getCaptionBg(),
                image.getCaptionEn(),
                gallery.publicUrl(image.getThumbKey()),
                image.getThumbWidth(),
                image.getThumbHeight(),
                gallery.publicUrl(image.getLargeKey()),
                image.getLargeWidth(),
                image.getLargeHeight());
    }
}
