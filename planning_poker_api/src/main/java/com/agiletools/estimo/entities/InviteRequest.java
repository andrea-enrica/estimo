package com.agiletools.estimo.entities;


import lombok.Data;
import com.agiletools.estimo.dtos.SessionDto;

import java.util.List;

@Data
public class InviteRequest {
    private List<String> invitedUsers;
    private SessionDto session;
}
