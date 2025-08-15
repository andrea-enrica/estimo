package com.agiletools.estimo.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.agiletools.estimo.dtos.AddFeedbackDto;
import com.agiletools.estimo.dtos.SessionDto;
import com.agiletools.estimo.dtos.UserSessionDetailsDto;
import com.agiletools.estimo.entities.InviteRequest;
import com.agiletools.estimo.entities.SessionEntity;
import com.agiletools.estimo.entities.UserEntity;
import com.agiletools.estimo.entities.UserSessionDetailsEntity;
import com.agiletools.estimo.entities.keys.UserSessionKey;
import com.agiletools.estimo.mappers.SessionMapper;
import com.agiletools.estimo.mappers.UserSessionDetailsMapper;
import com.agiletools.estimo.repositories.UserRepository;
import com.agiletools.estimo.repositories.UserSessionDetailsRepository;
import com.agiletools.estimo.utils.enums.UserSessionRole;
import com.agiletools.estimo.utils.enums.UserSessionStatus;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class UserSessionDetailsService {

    private final UserSessionDetailsRepository userSessionDetailsRepository;
    private final UserRepository userRepository;

    private final UserSessionDetailsMapper userSessionDetailsMapper;
    private final SessionMapper sessionMapper;

    @Transactional(readOnly = true)
    public List<UserSessionDetailsDto> getAllUserSessionDetails() {
        return userSessionDetailsMapper.entityListToDtoList(userSessionDetailsRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<UserSessionDetailsDto> getAllUserSessionDetailsForSession(Long sessionId) {
        return userSessionDetailsMapper.entityListToDtoList(userSessionDetailsRepository.findBySessionId(sessionId));
    }


    @Transactional(readOnly = false)
    public void inviteUsersToSession(InviteRequest inviteRequest) {

        List<UserEntity> users = inviteRequest.getInvitedUsers().stream().map(userRepository::findByUsername).toList();
        SessionEntity sessionEntity = sessionMapper.dtoToEntity(inviteRequest.getSession());

        for (UserEntity user : users) {
            UserSessionKey userSessionKey = UserSessionKey.builder().userId(user.getId()).sessionId(sessionEntity.getId()).build();
            UserSessionDetailsEntity userSessionDetailsEntity = UserSessionDetailsEntity.builder()
                    .id(userSessionKey)
                    .session(sessionEntity)
                    .user(user)
                    .status(UserSessionStatus.INVITED)
                    .role(UserSessionRole.USER).build();

            userSessionDetailsRepository.save(userSessionDetailsEntity);
        }
    }

    @Transactional(readOnly = false)
    public void addManagerToSession(SessionDto sessionDto) {
        SessionEntity sessionEntity = sessionMapper.dtoToEntity(sessionDto);
        UserEntity manager = userRepository.findById(sessionEntity.getSessionManagerId()).orElseThrow();

        UserSessionKey userSessionKey = UserSessionKey.builder().userId(manager.getId()).sessionId(sessionEntity.getId()).build();
        UserSessionDetailsEntity userSessionDetailsEntity = UserSessionDetailsEntity.builder()
                .id(userSessionKey)
                .session(sessionEntity)
                .user(manager)
                .status(UserSessionStatus.PARTICIPATED)
                .role(UserSessionRole.MANAGER).build();

        userSessionDetailsRepository.save(userSessionDetailsEntity);
    }

    @Transactional(readOnly = false)
    public void acceptInviteToSession(Long userId, Long sessionId) {
        UserSessionDetailsEntity userSessionDetailsEntity = userSessionDetailsRepository.findByUserIdAndSessionId(userId, sessionId);
        userSessionDetailsEntity.setStatus(UserSessionStatus.PARTICIPATED);
        userSessionDetailsRepository.save(userSessionDetailsEntity);
    }

    @Transactional(readOnly = false)
    public void declineInviteToSession(Long userId, Long sessionId) {
        UserSessionDetailsEntity userSessionDetailsEntity = userSessionDetailsRepository.findByUserIdAndSessionId(userId, sessionId);
        userSessionDetailsRepository.delete(userSessionDetailsEntity);
    }

    @Transactional(readOnly = true)
    public boolean checkUserAssignedToSession(Long sessionId, Long userId) {
        return userSessionDetailsRepository.existsBySessionIdAndUserId(sessionId, userId);
    }

    @Transactional(readOnly = false)
    public UserSessionDetailsDto addRatingAndFeedbackToSession(AddFeedbackDto addFeedbackDto, Long userId, Long sessionId) {
        UserSessionDetailsEntity userSessionDetailsEntity = userSessionDetailsRepository.findById(new UserSessionKey(sessionId, userId)).orElse(null);

        if (userSessionDetailsEntity != null) {
            userSessionDetailsEntity.setFeedback(addFeedbackDto.getFeedback());
            userSessionDetailsEntity.setRating(addFeedbackDto.getRating());
            return userSessionDetailsMapper.entityToDto(userSessionDetailsRepository.save(userSessionDetailsEntity));
        }
        return null;
    }

    @Transactional(readOnly = true)
    public UserSessionRole getSessionRoleAuthUser(Long sessionId, Long userId) {
        UserSessionDetailsEntity userSessionDetailsEntity = userSessionDetailsRepository.findById(new UserSessionKey(sessionId, userId)).orElse(null);
        if (userSessionDetailsEntity != null) {
            return userSessionDetailsEntity.getRole();
        }
        return null;
    }

    @Transactional(readOnly = false)
    public UserSessionDetailsDto updateUserSessionRole(Long userId, Long sessionId, UserSessionRole newRole) {
        UserSessionDetailsEntity userSessionDetailsEntity = userSessionDetailsRepository.findById(new UserSessionKey(sessionId, userId)).orElse(null);
        if (userSessionDetailsEntity != null) {
            userSessionDetailsEntity.setRole(newRole);
            return userSessionDetailsMapper.entityToDto(userSessionDetailsRepository.save(userSessionDetailsEntity));
        }
        return null;
    }
}
