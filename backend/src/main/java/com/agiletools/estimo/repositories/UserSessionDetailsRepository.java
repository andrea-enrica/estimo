package com.agiletools.estimo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.agiletools.estimo.entities.UserSessionDetailsEntity;
import com.agiletools.estimo.entities.keys.UserSessionKey;

import java.util.List;

public interface UserSessionDetailsRepository extends JpaRepository<UserSessionDetailsEntity, UserSessionKey> {

    UserSessionDetailsEntity findByUserIdAndSessionId(Long userId, Long sessionId);

    boolean existsBySessionIdAndUserId(Long sessionId, Long userId);

    List<UserSessionDetailsEntity> findBySessionId(Long sessionId);
}
