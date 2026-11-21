package com.barberplug.gallery;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GalleryImageRepository extends JpaRepository<GalleryImage, UUID> {

    /** Gallery order: position, then upload time as a tie-breaker. */
    List<GalleryImage> findAllByOrderByPositionAscCreatedAtAsc();

    @Query("select coalesce(max(g.position), -1) from GalleryImage g")
    int maxPosition();
}
