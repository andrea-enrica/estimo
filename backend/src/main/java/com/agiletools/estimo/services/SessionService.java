package com.agiletools.estimo.services;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.agiletools.estimo.dtos.SessionDto;
import com.agiletools.estimo.dtos.SessionEditDto;
import com.agiletools.estimo.dtos.SimpleUserDto;
import com.agiletools.estimo.entities.PaginatedResponse;
import com.agiletools.estimo.entities.SessionEntity;
import com.agiletools.estimo.entities.UserEntity;
import com.agiletools.estimo.entities.UserSessionDetailsEntity;
import com.agiletools.estimo.mappers.SessionMapper;
import com.agiletools.estimo.mappers.UserMapper;
import com.agiletools.estimo.repositories.SessionRepository;
import com.agiletools.estimo.utils.enums.SessionStatus;
import com.agiletools.estimo.utils.enums.UserSessionStatus;
import com.agiletools.estimo.utils.exceptions.EntityNotFoundException;
import com.agiletools.estimo.utils.exceptions.ForbiddenOperationException;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class SessionService {

    private final SessionRepository sessionRepository;
    private final SessionMapper sessionMapper;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public List<SessionDto> getSessionByCreatorAndManager(Long creatorId, Long sessionManagerId) {
        if (creatorId != null && sessionManagerId != null) {
            List<SessionEntity> searchedSession = sessionRepository.findByCreatorIdAndSessionManagerId(creatorId, sessionManagerId);
            return sessionMapper.entityListToDtoList(searchedSession);
        }

        if (creatorId != null) {
            return getSessionByCreatorId(creatorId);
        }

        if (sessionManagerId != null) {
            return getSessionByManagerId(sessionManagerId);
        }

        return getAllSessions();
    }

    @Transactional(readOnly = true)
    public List<SessionDto> getSessionByManagerId(Long sessionManagerId) {
        return sessionMapper.entityListToDtoList(sessionRepository.findBySessionManagerId(sessionManagerId));
    }

    @Transactional(readOnly = true)
    public List<SessionDto> getAllSessions() {
        return sessionMapper.entityListToDtoList(sessionRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<SessionDto> getSessionByCreatorId(Long creatorId) {
        return sessionMapper.entityListToDtoList(sessionRepository.findByCreatorId(creatorId));
    }

    @Transactional(readOnly = true)
    public SessionDto getSessionById(Long sessionId) {
        SessionEntity sessionEntity = sessionRepository.findById(sessionId).orElse(null);
        return sessionMapper.entityToDto(sessionEntity);
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<SessionDto> sessionsPaginated(Integer size, Integer page) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SessionEntity> pageWanted = sessionRepository.findAll(pageable);
        List<SessionDto> listOfSessionDtos = sessionMapper.entityListToDtoList(pageWanted.getContent());

        return PaginatedResponse.<SessionDto>builder().content(listOfSessionDtos).currentPage(pageWanted.getNumber()).totalPages(pageWanted.getTotalPages()).totalElements(pageWanted.getTotalElements()).build();
    }

    @Transactional()
    public SessionDto createSession(SessionDto sessionDto) {
        SessionEntity sessionEntity = sessionMapper.dtoToEntity(sessionDto);
        sessionEntity = sessionRepository.save(sessionEntity);
        return sessionMapper.entityToDto(sessionEntity);
    }

    @Transactional()
    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }

    @Transactional()
    public SessionDto updateSessionDetails(Long id, SessionEditDto sessionEditDto) {
        SessionEntity sessionEntity = sessionRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Session not found with id: " + id));

        if (sessionEntity.getStatus() == SessionStatus.ACTIVE) {
            throw new ForbiddenOperationException("You cannot change the details of an ongoing session!");
        }

        sessionEntity.setTitle(sessionEditDto.getTitle());
        if(!sessionEditDto.getCustomValues().isEmpty()) {
            sessionEntity.setCustomValues(sessionEditDto.getCustomValues());
        }

        SessionEntity updatedSessionEntity = sessionRepository.save(sessionEntity);
        return sessionMapper.entityToDto(updatedSessionEntity);
    }

    @Transactional()
    public SessionDto updateSessionStatus(Long id, SessionStatus status) {

        SessionEntity sessionEntity = sessionRepository.findById(id).orElse(null);

        if(sessionEntity != null) {
            sessionEntity.setStatus(status);
            if (status.equals(SessionStatus.ENDED)) {
                sessionEntity.setDateEnded(LocalDateTime.now());
            }

            return sessionMapper.entityToDto(sessionRepository.save(sessionEntity));
        }

        return null;
    }

    @Transactional(readOnly = true)
    public List<SimpleUserDto> getUsersInSession(Long sessionId) {
        Optional<SessionEntity> sessionEntity = sessionRepository.findById(sessionId);

        if (sessionEntity.isPresent()) {
            List<UserSessionDetailsEntity> userSessionEntityList = sessionEntity.get().getUserSessionDetails();
            List<UserSessionDetailsEntity> userSessionDetailsEntitiesFiltered = userSessionEntityList.stream().filter(userSessionDetailsEntity -> userSessionDetailsEntity.getStatus().equals(UserSessionStatus.PARTICIPATED)).toList();
            List<UserEntity> userEntityList = userSessionDetailsEntitiesFiltered.stream().map(UserSessionDetailsEntity::getUser).toList();
            return userMapper.entityListToSimpleUserDtoList(userEntityList);
        }
        return null;
    }
}
