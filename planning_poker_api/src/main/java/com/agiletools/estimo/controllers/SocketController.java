package com.agiletools.estimo.controllers;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import com.agiletools.estimo.dtos.SessionStatusDto;
import com.agiletools.estimo.dtos.StoryDto;
import com.agiletools.estimo.dtos.UserMessageDto;
import com.agiletools.estimo.services.StoryService;
import com.agiletools.estimo.services.UserSessionDetailsService;
import com.agiletools.estimo.services.UserStoryDetailsService;
import com.agiletools.estimo.utils.constants.WebSocketPaths;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@CrossOrigin("*")
@Controller
@Slf4j
public class SocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<Long, Map<Long, UserMessageDto>> sessionUsers = new ConcurrentHashMap<>();
    private final Map<Long, List<StoryDto>> sessionStories = new ConcurrentHashMap<>();
    private final Map<Long, SessionStatusDto> sessionStatus = new ConcurrentHashMap<>();
    private static final int MAX_POSITIONS = 8;
    private final UserStoryDetailsService userStoryDetailsService;
    private final StoryService storyService;
    private final UserSessionDetailsService userSessionDetailsService;


    public SocketController(final SimpMessagingTemplate messagingTemplate, final UserStoryDetailsService userStoryDetailsService, final StoryService storyService, UserSessionDetailsService userSessionDetailsService) {
        this.messagingTemplate = messagingTemplate;
        this.userStoryDetailsService = userStoryDetailsService;
        this.storyService = storyService;
        this.userSessionDetailsService = userSessionDetailsService;
    }

    @MessageMapping(WebSocketPaths.USER_JOIN)
    public void handleUserJoin(@DestinationVariable final Long id, final UserMessageDto message) {
        sessionUsers.putIfAbsent(id, new LinkedHashMap<>());

        final Map<Long, UserMessageDto> users = sessionUsers.get(id);
        if (!users.containsKey(message.getUserId())) {
            if (users.size() < MAX_POSITIONS) {
                final int position = users.size();
                message.setPosition(position);
                message.setRole(String.valueOf(userSessionDetailsService.getSessionRoleAuthUser(id, message.getUserId())));
                users.put(message.getUserId(), message);
            } else {
                log.warn("User {} has already been joined", message.getUserId());
            }
        }
        notifyUsers(id);
    }

    @MessageMapping(WebSocketPaths.USER_LEAVE)
    public void handleUserLeave(@DestinationVariable final Long id, final UserMessageDto message) {
        final Map<Long, UserMessageDto> users = sessionUsers.get(id);
        if (users != null && users.containsKey(message.getUserId())) {
            final int position = users.get(message.getUserId()).getPosition();
            users.remove(message.getUserId());
            shiftUserPositions(users, position);
            notifyUsers(id);
        }
    }

    @MessageMapping(WebSocketPaths.USER_FORCE_DISCONNECT)
    public void handleForceDisconnect(@DestinationVariable final Long id, final Long userId) {
        messagingTemplate.convertAndSend(WebSocketPaths.SEND_USER_FORCE_DISCONNECT.replace("{id}", id.toString()), userId);
    }

    @MessageMapping(WebSocketPaths.SESSION_START)
    public void handleSessionStart(@DestinationVariable final Long id) {
        final SessionStatusDto status = sessionStatus.getOrDefault(id, new SessionStatusDto());
        status.setSessionActive(true);
        status.setCurrentStoryIndex(0);
        status.setCurrentStory(sessionStories.get(id).get(0));
        status.setStoryInProgress(true);
        status.setStartedTime(System.currentTimeMillis() / 1000);
        sessionStatus.put(id, status);
        messagingTemplate.convertAndSend(WebSocketPaths.TOPIC_START.replace("{id}", id.toString()), "Session started");
    }

    @MessageMapping(WebSocketPaths.SESSION_END)
    public void handleSessionEnd(@DestinationVariable final Long id) {
        final SessionStatusDto status = sessionStatus.getOrDefault(id, new SessionStatusDto());
        status.setSessionActive(false);
        status.setCurrentStory(null);
        status.setCurrentStoryIndex(0);
        status.setStoryInProgress(false);
        status.setStartedTime(0);
        sessionStatus.put(id, status);
        messagingTemplate.convertAndSend(WebSocketPaths.TOPIC_END.replace("{id}", id.toString()), "Session ended");
    }

    @MessageMapping(WebSocketPaths.SESSION_NEXT)
    public void handleSessionNextStory(@DestinationVariable final Long id) {
        final List<StoryDto> stories = sessionStories.get(id);
        final SessionStatusDto status = sessionStatus.getOrDefault(id, new SessionStatusDto());
        int currentStoryIndex = status.getCurrentStoryIndex();
        status.setStoryInProgress(true);
        if (stories != null && currentStoryIndex < stories.size() - 1) {
            currentStoryIndex++;
            status.setCurrentStory(stories.get(currentStoryIndex));
            status.setCurrentStoryIndex(currentStoryIndex);
            sessionStatus.put(id, status);

            messagingTemplate.convertAndSend(
                    WebSocketPaths.TOPIC_NEXT.replace("{id}", id.toString()),
                    "Changed to next story for estimation"
            );
        }
    }

    @MessageMapping(WebSocketPaths.UPDATE_USER_ESTIMATION)
    public void handleUserEstimation(@DestinationVariable final Long id, @DestinationVariable final String value, final Long userId) {
        final Map<Long, UserMessageDto> users = sessionUsers.get(id);
        if (users != null && users.containsKey(userId)) {
            final UserMessageDto user = users.get(userId);
            user.setEstimation(value);

            notifyUsers(id);
        }
    }

    @MessageMapping(WebSocketPaths.CLEAR_USER_ESTIMATION)
    public void handleUserEstimationClear(@DestinationVariable final Long id) {
        final Map<Long, UserMessageDto> users = sessionUsers.get(id);
        for (final Map.Entry<Long, UserMessageDto> entry : users.entrySet()) {
            final UserMessageDto userMessage = entry.getValue();
            userMessage.setEstimation(StringUtils.EMPTY);
        }
        notifyUsers(id);
    }

    private void shiftUserPositions(final Map<Long, UserMessageDto> users, final int startPosition) {
        final List<UserMessageDto> userList = new ArrayList<>(users.values());
        userList.sort(Comparator.comparingInt(UserMessageDto::getPosition));

        for (final UserMessageDto user : userList) {
            if (user.getPosition() > startPosition) {
                user.setPosition(user.getPosition() - 1);
            }
        }
    }

    private void notifyUsers(final Long sessionId) {
        final Map<Long, UserMessageDto> users = sessionUsers.get(sessionId);
        if (users != null) {
            final List<UserMessageDto> userList = new ArrayList<>(users.values());
            messagingTemplate.convertAndSend(WebSocketPaths.TOPIC_USERS_LIST.replace("{id}", sessionId.toString()), userList);
        }
    }

    @MessageMapping(WebSocketPaths.FLIP_CARDS)
    public void handleFlipCards(@DestinationVariable final Long id) {
        final SessionStatusDto status = sessionStatus.getOrDefault(id, new SessionStatusDto());
        status.setStoryInProgress(false);
        messagingTemplate.convertAndSend("/topic/session/" + id + "/flip-cards", "Flip Cards");
    }

    @MessageMapping(WebSocketPaths.REVOTE_STORY)
    public void handleRevoteStory(@DestinationVariable final Long id) {
        final SessionStatusDto status = sessionStatus.getOrDefault(id, new SessionStatusDto());
        status.setStoryInProgress(true);
        messagingTemplate.convertAndSend("/topic/session/" + id + "/revote-story", "Revote");
    }


    @MessageMapping(WebSocketPaths.SAVE_VOTES)
    public void handleSaveVotes(@DestinationVariable final Long id, @DestinationVariable final Long storyId, @DestinationVariable final String currentStoryAverage) {

        final Map<Long, UserMessageDto> users = sessionUsers.get(id);
        userStoryDetailsService.saveUserStoryDetails(users, storyId);
        storyService.updateStoryAverage(storyId, currentStoryAverage);

        messagingTemplate.convertAndSend(WebSocketPaths.TOPIC_VOTES_SAVED.replace("{id}", id.toString()), "Votes saved");
    }

    @MessageMapping(WebSocketPaths.UPDATE_STORIES)
    public void handleStoryUpdate(@DestinationVariable final Long id, final List<StoryDto> updatedStories) {
        sessionStories.put(id, updatedStories);
        notifyStories(id);
    }

    private void notifyStories(final Long sessionId) {
        final List<StoryDto> stories = sessionStories.get(sessionId);
        if (stories != null) {
            messagingTemplate.convertAndSend(WebSocketPaths.TOPIC_STORIES_LIST.replace("{id}", sessionId.toString()), stories);
        }
    }

    @MessageMapping(WebSocketPaths.USER_ROLE_CHANGE)
    public void handleUserRoleChange(@DestinationVariable final Long id, @DestinationVariable final String newRole, final Long userId) {
        final Map<Long, UserMessageDto> users = sessionUsers.get(id);
        if (users != null && users.containsKey(userId)) {
            final UserMessageDto user = users.get(userId);
            user.setRole(newRole);
            notifyUsers(id);
        }
    }

    @MessageMapping(WebSocketPaths.GET_SESSION_STATUS)
    public void handleSessionStatusRequest(@DestinationVariable final Long id) {
        final SessionStatusDto sessionStatusDto = sessionStatus.getOrDefault(id, new SessionStatusDto());
        messagingTemplate.convertAndSend(
                WebSocketPaths.SEND_SESSION_STATUS.replace("{id}", id.toString()),
                sessionStatusDto
        );
    }

}
