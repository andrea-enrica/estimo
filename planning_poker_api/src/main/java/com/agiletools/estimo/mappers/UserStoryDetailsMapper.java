package com.agiletools.estimo.mappers;

import org.mapstruct.Mapper;
import com.agiletools.estimo.dtos.UserStoryDetailsDto;
import com.agiletools.estimo.dtos.UserStoryKeyDto;
import com.agiletools.estimo.entities.UserStoryDetailsEntity;
import com.agiletools.estimo.entities.keys.UserStoryKey;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserStoryDetailsMapper {

    UserStoryDetailsDto entityToDto(UserStoryDetailsEntity userStoryDetailsEntity);

    UserStoryDetailsEntity dtoToEntity(UserStoryDetailsDto userStoryDetailsDto);

    List<UserStoryDetailsDto> entityListToDtoList(List<UserStoryDetailsEntity> userStoryDetailsEntities);

    List<UserStoryDetailsEntity> dtoListToEntityList(List<UserStoryDetailsDto> userStoryDetailsDtos);

    UserStoryKey userStoryKeyDtoToUserStoryKey(UserStoryKeyDto userStoryKeyDto);

    UserStoryKeyDto userStoryKeyToUserStoryKeyDto(UserStoryKey userStoryKey);

}
