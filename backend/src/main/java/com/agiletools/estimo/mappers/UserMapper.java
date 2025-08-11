package com.agiletools.estimo.mappers;

import org.mapstruct.Mapper;
import com.agiletools.estimo.dtos.SimpleUserDto;
import com.agiletools.estimo.dtos.UserDto;
import com.agiletools.estimo.dtos.UserProfileDto;
import com.agiletools.estimo.entities.UserEntity;

import java.util.List;


@Mapper(componentModel = "spring")
public interface UserMapper {

    UserDto entityToDto(UserEntity userEntity);

    UserProfileDto entityToProfileDto(UserEntity userEntity);

    UserEntity dtoToEntity(UserDto userDto);

    List<UserDto> entityListToDtoList(List<UserEntity> userEntities);

    List<SimpleUserDto> entityListToSimpleUserDtoList(List<UserEntity> userEntities);
}
