package com.agiletools.estimo.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.agiletools.estimo.dtos.CreateStoryDto;
import com.agiletools.estimo.dtos.StoryDto;
import com.agiletools.estimo.entities.PaginatedResponse;
import com.agiletools.estimo.services.StoryService;
import com.agiletools.estimo.utils.security.AllowManagerOnly;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/stories")
public class StoryController {
    private final StoryService storyService;

    @GetMapping("/{sessionId}")
    public List<StoryDto> getStoriesInSession(@PathVariable Long sessionId) {
        return storyService.getStoriesInSession(sessionId);
    }

    @AllowManagerOnly
    @PostMapping
    public StoryDto createStory(@RequestBody CreateStoryDto createStoryDto) {
        return storyService.createStory(createStoryDto);
    }

    @AllowManagerOnly
    @PostMapping("/list")
    public List<StoryDto> createStories(@RequestBody List<CreateStoryDto> createStoryDtoList) {
        return storyService.createStories(createStoryDtoList);
    }

    @AllowManagerOnly
    @DeleteMapping("/{id}")
    public void deleteSession(@PathVariable Long id) {
        storyService.deleteStory(id);
    }

    @GetMapping("/paged/{sessionId}")
    public PaginatedResponse<StoryDto> getStoriesInSessionPaginated(@RequestParam(name = "size") Integer size,
                                                     @RequestParam(name = "page") Integer page,@PathVariable Long sessionId) {
        return storyService.getStoriesPaginated(size, page,sessionId);
    }

}
