package com.agiletools.estimo.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.agiletools.estimo.dtos.CreateStoryDto;
import com.agiletools.estimo.dtos.StoryDto;
import com.agiletools.estimo.entities.StoryEntity;

import java.util.List;

@Mapper(componentModel = "spring")
public interface StoryMapper {

    @Mapping(target = "key", source = "id")
    StoryDto entityToDto(StoryEntity story);

    StoryEntity dtoToEntity(StoryDto dto);

    StoryEntity dtoToEntity(CreateStoryDto dto);

    List<StoryDto> entityListToDtoList(List<StoryEntity> storyEntities);

    List<StoryEntity> dtoListToEntityList(List<CreateStoryDto> dtos);
}
