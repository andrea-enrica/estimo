package com.agiletools.estimo.services;


import com.agiletools.estimo.dtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.agiletools.estimo.entities.UserStoryDetailsEntity;
import com.agiletools.estimo.mappers.StoryMapper;
import com.agiletools.estimo.mappers.UserStoryDetailsMapper;
import com.agiletools.estimo.repositories.StoryRepository;
import com.agiletools.estimo.repositories.UserRepository;
import com.agiletools.estimo.repositories.UserStoryDetailsRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RequiredArgsConstructor
@Service
public class UserStoryDetailsService {

    private final UserStoryDetailsRepository userStoryDetailsRepository;

    private final UserStoryDetailsMapper userStoryDetailsMapper;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final StoryMapper storyMapper;

    @Transactional(readOnly = false)
    public void saveUserStoryDetails(Map<Long, UserMessageDto> users, Long receivedStoryId) {
        if (users != null) {

            List<UserStoryDetailsDto> userStoryDetailsList = new ArrayList<>();

            for (Map.Entry<Long, UserMessageDto> entry : users.entrySet()) {

                UserMessageDto userMessage = entry.getValue();

                UserStoryDetailsDto detailsDto = new UserStoryDetailsDto();
                UserStoryKeyDto keyDto = new UserStoryKeyDto();

                keyDto.setUserId(userMessage.getUserId());
                keyDto.setStoryId(receivedStoryId);
                detailsDto.setId(keyDto);
                if (Objects.equals(userMessage.getEstimation(), "")) {
                    detailsDto.setEstimation("?");
                } else {
                    detailsDto.setEstimation(userMessage.getEstimation());
                }
                detailsDto.setVotedTime(userMessage.getVotedTime());
                userStoryDetailsList.add(detailsDto);
            }
            for (UserStoryDetailsDto dto : userStoryDetailsList) {

                UserStoryDetailsEntity entity = userStoryDetailsMapper.dtoToEntity(dto);
                Long storyId = dto.getId().getStoryId();

                if (storyRepository.findById(storyId).isPresent()) {
                    entity.setStory(storyRepository.findById(storyId).get());
                }
                Long userId = dto.getId().getUserId();

                if (userRepository.findById(userId).isPresent()) {
                    entity.setUser(userRepository.findById(userId).get());
                }

                userStoryDetailsRepository.save(entity);

            }
        }
    }

    @Transactional(readOnly = true)
    public List<UserStoryDetailsDto> getAllUserStoryDetails() {
        List<UserStoryDetailsEntity> userStoryDetailsList = userStoryDetailsRepository.findAll();
        return userStoryDetailsMapper.entityListToDtoList(userStoryDetailsList);
    }

    @Transactional(readOnly = true)
    public List<UserStoryDetailsDto> getAllUserStoryDetailsByStoryId(Long storyId) {
        List<UserStoryDetailsEntity> userStoryDetailsList = userStoryDetailsRepository.findByStoryId(storyId);
        return userStoryDetailsMapper.entityListToDtoList(userStoryDetailsList);
    }

    @Transactional(readOnly = true)
    public List<UserStoryDetailsDto> getAllUserStoryDetailsByUserId(Long userId) {
        List<UserStoryDetailsEntity> userStoryDetailsList = userStoryDetailsRepository.findByUserId(userId);
        return userStoryDetailsMapper.entityListToDtoList(userStoryDetailsList);
    }

    @Transactional(readOnly = true)
    public List<UserStoryDetailsDto> getAllUserStoryDetailsBySessionId(Long sessionId) {
        List<StoryDto> allStoriesOnSession = storyMapper.entityListToDtoList(storyRepository.findAllBySessionId(sessionId));
        List<UserStoryDetailsDto> userStoryDetailsList = new ArrayList<>();
        for (StoryDto story : allStoriesOnSession) {
            Long storyId = story.getKey();
            userStoryDetailsList.addAll(userStoryDetailsMapper.entityListToDtoList(userStoryDetailsRepository.findByStoryId(storyId)));
        }
        return userStoryDetailsList;
    }

    @Transactional(readOnly = true)
    public List<EstimationPercentStoryDto> getEstimationPercentInSessionStories(Long sessionId) {
        List<StoryDto> allStoriesOnSession = storyMapper.entityListToDtoList(storyRepository.findAllBySessionId(sessionId));
        List<EstimationPercentStoryDto> estimationPercentStoryDtos = new ArrayList<>();
        for (StoryDto story : allStoriesOnSession) {
            Long storyId = story.getKey();
            List<UserStoryDetailsEntity> usersStory= userStoryDetailsRepository.findByStoryId(storyId);
            int nrParticipants=usersStory.size();
            if(nrParticipants!=0) {
                int nrOfVotedParticipants = nrParticipants - (int) usersStory.stream()
                        .filter(obj -> "?".equals(obj.getEstimation()))
                        .count();
                int percent = nrOfVotedParticipants * 100 / nrParticipants;
                EstimationPercentStoryDto estimationPercentStoryDto = new EstimationPercentStoryDto();
                estimationPercentStoryDto.setPercent(percent);
                estimationPercentStoryDto.setTitle(story.getTitle());
                estimationPercentStoryDtos.add(estimationPercentStoryDto);
            }
        }
        return estimationPercentStoryDtos;

    }
}
