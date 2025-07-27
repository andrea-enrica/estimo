package com.agiletools.estimo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.agiletools.estimo.entities.UserStoryDetailsEntity;
import com.agiletools.estimo.entities.keys.UserStoryKey;

import java.util.List;

public interface UserStoryDetailsRepository extends JpaRepository<UserStoryDetailsEntity, UserStoryKey> {
    List<UserStoryDetailsEntity> findByStoryId(Long sessionId);

    List<UserStoryDetailsEntity> findByUserId(Long userId);
}
