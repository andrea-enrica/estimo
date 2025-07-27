package com.agiletools.estimo.dtos;

import lombok.Data;

@Data
public class SessionStatusDto {
    private boolean isSessionActive;
    private StoryDto currentStory;
    private int currentStoryIndex;
    private boolean isStoryInProgress;
    private long startedTime;
}
