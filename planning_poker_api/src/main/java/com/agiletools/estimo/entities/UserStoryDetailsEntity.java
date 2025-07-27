package com.agiletools.estimo.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.agiletools.estimo.entities.keys.UserStoryKey;

import java.time.LocalDateTime;

@Table(name = "user_story")
@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStoryDetailsEntity {

    @EmbeddedId
    UserStoryKey id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @ManyToOne
    @MapsId("storyId")
    @JoinColumn(name = "story_id")
    private StoryEntity story;

    @Column(name = "estimation")
    private String estimation;

    @Column(name = "voted_time")
    private LocalDateTime votedTime;
}
