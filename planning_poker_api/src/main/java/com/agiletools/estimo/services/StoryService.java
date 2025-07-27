package com.agiletools.estimo.services;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.agiletools.estimo.dtos.CreateStoryDto;
import com.agiletools.estimo.dtos.StoryDto;
import com.agiletools.estimo.entities.PaginatedResponse;
import com.agiletools.estimo.entities.StoryEntity;
import com.agiletools.estimo.mappers.StoryMapper;
import com.agiletools.estimo.repositories.StoryRepository;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StoryService {

    private final StoryRepository storyRepository;
    private final StoryMapper storyMapper;

    public StoryDto createStory(CreateStoryDto storyDto) {
        StoryEntity storyEntity = storyMapper.dtoToEntity(storyDto);
        return storyMapper.entityToDto(storyRepository.save(storyEntity));
    }

    public List<StoryDto> createStories(List<CreateStoryDto> storyDtoList) {
        List<StoryEntity> storyEntityList = storyMapper.dtoListToEntityList(storyDtoList);
        return storyMapper.entityListToDtoList(storyRepository.saveAll(storyEntityList));
    }

    public PaginatedResponse<StoryDto> getStoriesPaginated(Integer size, Integer page, Long sessionId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<StoryEntity> pageWanted = storyRepository.findAllBySessionId(sessionId, pageable);
        List<StoryDto> listOfStoryDtos = storyMapper.entityListToDtoList(pageWanted.getContent());

        return PaginatedResponse.<StoryDto>builder()
                .content(listOfStoryDtos)
                .currentPage(pageWanted.getNumber())
                .totalPages(pageWanted.getTotalPages())
                .totalElements(pageWanted.getTotalElements())
                .build();
    }

    public List<StoryDto> getStoriesInSession(Long sessionId) {
        List<StoryEntity> unsortedList = storyRepository.findAllBySessionId(sessionId);
        unsortedList.sort(Comparator.comparing(StoryEntity::getId));
        return storyMapper.entityListToDtoList(unsortedList);
    }

    public void updateStoryAverage(Long storyId, String average) {
        storyRepository.findById(storyId).ifPresent(storyEntity -> {
            storyEntity.setAverage(average);
            storyRepository.save(storyEntity);
        });
    }

    public void deleteStory(Long id) {
        storyRepository.deleteById(id);
    }

}
