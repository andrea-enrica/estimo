package com.agiletools.estimo.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.agiletools.estimo.entities.StoryEntity;

import java.util.List;

public interface StoryRepository extends JpaRepository<StoryEntity, Long> {

    List<StoryEntity> findAllBySessionId(Long sessionId);
    Page<StoryEntity> findAllBySessionId(Long sessionId,Pageable pageable);
}
