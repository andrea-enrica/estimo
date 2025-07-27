package com.agiletools.estimo.mappers;

import org.mapstruct.Mapper;
import com.agiletools.estimo.dtos.UserSessionDetailsDto;
import com.agiletools.estimo.dtos.UserSessionKeyDto;
import com.agiletools.estimo.entities.UserSessionDetailsEntity;
import com.agiletools.estimo.entities.keys.UserSessionKey;

import java.util.List;

@Mapper(componentModel="spring")
public interface UserSessionDetailsMapper {

    UserSessionDetailsDto entityToDto(UserSessionDetailsEntity userSessionDetailsEntity);

    UserSessionDetailsEntity dtoToEntity(UserSessionDetailsDto userSessionDetailsDto);

    List<UserSessionDetailsDto> entityListToDtoList(List<UserSessionDetailsEntity> userSessionDetailsEntities);

    UserSessionKey userSessionKeyDtoToUserSessionKey(UserSessionKeyDto dto);

    UserSessionKeyDto userSessionKeyToUserSessionKeyDto(UserSessionKey key);

}
