package com.agiletools.estimo.entities.keys;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;

@Data
@Embeddable
public class UserStoryKey implements Serializable {

    @Column(name="story_id")
    private Long storyId;

    @Column(name="user_id")
    private Long userId;
}