package com.barberplug.gallery;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.barberplug.IntegrationTest;
import com.barberplug.storage.ImageStorage;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@IntegrationTest
class GalleryIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    @Autowired
    private GalleryImageRepository images;

    @Autowired
    private ImageStorage storage;

    private static RequestPostProcessor owner() {
        return user("owner@test.local").roles("OWNER");
    }

    @BeforeEach
    void emptyGallery() {
        images.deleteAll();
    }

    private ResultActions upload(byte[] bytes, String filename) throws Exception {
        return mvc.perform(multipart("/api/admin/gallery")
                .file(new MockMultipartFile("file", filename, "application/octet-stream", bytes))
                .with(owner())
                .with(csrf()));
    }

    private JsonNode uploaded() throws Exception {
        String body = upload(TestImages.jpeg(1600, 1200), "cut.jpg")
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return json.readTree(body);
    }

    @Test
    void uploadStoresTwoWebpFilesAndShowsThePhotoToVisitors() throws Exception {
        JsonNode image = uploaded();
        String id = image.get("id").asText();

        assertThat(storage.exists("gallery/" + id + "/thumb.webp")).isTrue();
        assertThat(storage.exists("gallery/" + id + "/large.webp")).isTrue();

        // Public, no sign-in needed.
        mvc.perform(get("/api/gallery"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(id))
                .andExpect(jsonPath("$[0].thumbUrl").value(endsWith("/gallery/" + id + "/thumb.webp")))
                .andExpect(jsonPath("$[0].largeWidth").value(1600))
                .andExpect(jsonPath("$[0].thumbHeight").value(900));
    }

    @Test
    void newPhotosGoToTheEnd() throws Exception {
        String first = uploaded().get("id").asText();
        String second = uploaded().get("id").asText();

        mvc.perform(get("/api/gallery"))
                .andExpect(jsonPath("$[0].id").value(first))
                .andExpect(jsonPath("$[1].id").value(second));
    }

    @Test
    void rejectsFilesThatAreNotPhotos() throws Exception {
        upload("not an image".getBytes(), "photo.jpg")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("unsupported_type"));
    }

    @Test
    void onlyTheOwnerCanUpload() throws Exception {
        mvc.perform(multipart("/api/admin/gallery")
                        .file(new MockMultipartFile("file", "a.jpg", "image/jpeg", TestImages.jpeg(10, 10)))
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void captionsAreSavedTrimmedAndBlankBecomesEmpty() throws Exception {
        String id = uploaded().get("id").asText();

        mvc.perform(patch("/api/admin/gallery/" + id)
                        .with(owner())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"captionBg\":\"  Класическо подстригване \",\"captionEn\":\"   \"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.captionBg").value("Класическо подстригване"))
                .andExpect(jsonPath("$.captionEn").doesNotExist());
    }

    @Test
    void captionsHaveALengthLimit() throws Exception {
        String id = uploaded().get("id").asText();

        mvc.perform(patch("/api/admin/gallery/" + id)
                        .with(owner())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"captionBg\":\"" + "я".repeat(301) + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fields.captionBg").value("too_long"));
    }

    @Test
    void reorderNeedsEveryPhotoExactlyOnce() throws Exception {
        String a = uploaded().get("id").asText();
        String b = uploaded().get("id").asText();

        mvc.perform(order("[\"" + a + "\"]"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("order_mismatch"));

        mvc.perform(order("[\"" + b + "\",\"" + a + "\"]")).andExpect(status().isNoContent());
        mvc.perform(get("/api/gallery"))
                .andExpect(jsonPath("$[0].id").value(b))
                .andExpect(jsonPath("$[1].id").value(a));
    }

    @Test
    void deleteRemovesThePhotoAndItsFiles() throws Exception {
        String id = uploaded().get("id").asText();

        mvc.perform(delete("/api/admin/gallery/" + id).with(owner()).with(csrf())).andExpect(status().isNoContent());

        mvc.perform(get("/api/gallery")).andExpect(jsonPath("$", hasSize(0)));
        assertThat(storage.exists("gallery/" + id + "/thumb.webp")).isFalse();
        assertThat(storage.exists("gallery/" + id + "/large.webp")).isFalse();
    }

    @Test
    void unknownPhotoIsNotFound() throws Exception {
        mvc.perform(delete("/api/admin/gallery/00000000-0000-0000-0000-000000000000").with(owner()).with(csrf()))
                .andExpect(status().isNotFound());
    }

    private org.springframework.test.web.servlet.RequestBuilder order(String idsJson) {
        return put("/api/admin/gallery/order")
                .with(owner())
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"ids\":" + idsJson + "}");
    }
}
