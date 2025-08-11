package com.agiletools.estimo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.agiletools.estimo.entities.SessionEntity;

import java.util.List;

public interface SessionRepository  extends JpaRepository<SessionEntity, Long> {

    List<SessionEntity> findBySessionManagerId (Long sessionManagerId);

    @Query("select e from SessionEntity e where e.creatorId = ?1 and e.sessionManagerId = ?2")
    List<SessionEntity> findByCreatorIdAndSessionManagerId(Long creatorId, Long sessionManagerId);

    List<SessionEntity> findByCreatorId(Long creatorId);
}
