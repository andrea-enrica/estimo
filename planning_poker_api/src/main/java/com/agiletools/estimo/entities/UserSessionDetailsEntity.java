package com.agiletools.estimo.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.agiletools.estimo.entities.keys.UserSessionKey;
import com.agiletools.estimo.utils.enums.UserSessionRole;
import com.agiletools.estimo.utils.enums.UserSessionStatus;

@Table(name = "user_session")
@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSessionDetailsEntity {

    @EmbeddedId
    UserSessionKey id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @ManyToOne
    @MapsId("sessionId")
    @JoinColumn(name = "session_id")
    private SessionEntity session;

    @Enumerated(EnumType.STRING)
    @Column(name="role")
    private UserSessionRole role;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "feedback")
    private String feedback;

    @Enumerated(EnumType.STRING)
    @Column(name="status")
    private UserSessionStatus status;
}
