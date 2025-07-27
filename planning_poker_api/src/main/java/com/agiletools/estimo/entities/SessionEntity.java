package com.agiletools.estimo.entities;


import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import com.agiletools.estimo.utils.enums.SessionStatus;

import java.time.LocalDateTime;
import java.util.List;

@Table(name="sessions")
@Entity
@Data
public class SessionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @Column(name="date_created")
    private LocalDateTime dateCreated;

    @Column(name="date_ended")
    private LocalDateTime dateEnded;

    @Enumerated(EnumType.STRING)
    @Column(name="status")
    private SessionStatus status;

    @Column(name = "custom_values")
    private String customValues;

    @Column(name = "value_type")
    private String valueType;

    @Column(name = "title")
    private String title;

    @Column(name="creator_id")
    private Long creatorId;

    @Column(name="session_manager_id")
    private Long sessionManagerId;

    @OneToMany(mappedBy="session")
    @ToString.Exclude
    private List<UserSessionDetailsEntity> userSessionDetails;

    @OneToMany( mappedBy ="sessionId", cascade= CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<StoryEntity> sessionStories;

}
