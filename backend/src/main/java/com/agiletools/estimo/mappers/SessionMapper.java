package com.agiletools.estimo.mappers;


import org.mapstruct.Mapper;
import com.agiletools.estimo.dtos.SessionDto;
import com.agiletools.estimo.entities.SessionEntity;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SessionMapper {

    SessionDto entityToDto(SessionEntity session);

    SessionEntity dtoToEntity(SessionDto dto);

    List<SessionDto> entityListToDtoList(List<SessionEntity> sessionEntities);
}
