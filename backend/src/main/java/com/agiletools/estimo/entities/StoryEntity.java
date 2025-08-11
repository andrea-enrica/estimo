package com.agiletools.estimo.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Table(name="stories")
@Entity
@Data
public class StoryEntity {
    private static final String DEFAULT_AVERAGE = "N/A";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @Column(name="title")
    private String title;

    @Column(name="description")
    private String description;

    @Column(name="average")
    private String average = DEFAULT_AVERAGE;

    @Column(name="session_id")
    private Long sessionId;

    @OneToMany(mappedBy="story")
    private List<UserStoryDetailsEntity> userStoryDetails;
}
