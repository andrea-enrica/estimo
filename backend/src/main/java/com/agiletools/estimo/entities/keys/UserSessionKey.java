package com.agiletools.estimo.entities.keys;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
@Data
@Builder
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
public class UserSessionKey implements Serializable {

    @Column(name="session_id")
    private Long sessionId;

    @Column(name="user_id")
    private Long userId;
}
