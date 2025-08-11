package com.agiletools.estimo.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.agiletools.estimo.dtos.EstimationPercentStoryDto;
import com.agiletools.estimo.dtos.UserStoryDetailsDto;
import com.agiletools.estimo.services.UserStoryDetailsService;

import java.util.List;

@RestController
@RequestMapping("/user-story-details")
public class UserStoryDetailsController {
    private final UserStoryDetailsService userStoryDetailsService;

    public UserStoryDetailsController(UserStoryDetailsService userStoryDetailsService) {
        this.userStoryDetailsService = userStoryDetailsService;
    }

    @GetMapping("/all")
    public List<UserStoryDetailsDto> getUserStoryDetails() {
        return userStoryDetailsService.getAllUserStoryDetails();
    }

    @GetMapping("/all-story")
    public List<UserStoryDetailsDto> getAllUserStoryDetailsByStoryId(@RequestParam(name = "storyId") Long storyId) {
        return userStoryDetailsService.getAllUserStoryDetailsByStoryId(storyId);

    }

    @GetMapping("/all-user")
    public List<UserStoryDetailsDto> getAllUserStoryDetailsByUserId(@RequestParam(name = "userId") Long userId) {
        return userStoryDetailsService.getAllUserStoryDetailsByUserId(userId);

    }

    @GetMapping("/all-session")
    public List<UserStoryDetailsDto> getAllUserStoryDetailsBySessionId(@RequestParam(name = "sessionId") Long sessionId) {
        return userStoryDetailsService.getAllUserStoryDetailsBySessionId(sessionId);
    }

    @GetMapping("/stories-voted-percent")
    public List<EstimationPercentStoryDto> getEstimationPercentInSessionStories(@RequestParam(name="sessionId")Long sessionId){
        return userStoryDetailsService.getEstimationPercentInSessionStories(sessionId);
    }

}
