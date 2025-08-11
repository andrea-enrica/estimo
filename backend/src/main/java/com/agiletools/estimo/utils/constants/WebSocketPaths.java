package com.agiletools.estimo.utils.constants;

public final class WebSocketPaths {
    private WebSocketPaths() {
        // private constructor to prevent instantiation
    }

    public static final String SESSION_BASE = "/session/";
    public static final String USER_JOIN = SESSION_BASE + "{id}/join";
    public static final String USER_LEAVE = SESSION_BASE + "{id}/leave";
    public static final String SESSION_START = SESSION_BASE + "{id}/start";
    public static final String SESSION_END = SESSION_BASE + "{id}/end";
    public static final String SESSION_NEXT = SESSION_BASE + "{id}/next";
    public static final String TOPIC_USERS = "/topic/session/";
    public static final String TOPIC_START = TOPIC_USERS + "{id}/start";
    public static final String TOPIC_END = TOPIC_USERS + "{id}/end";
    public static final String TOPIC_NEXT = TOPIC_USERS + "{id}/next";
    public static final String TOPIC_USERS_LIST = TOPIC_USERS + "{id}/users";
    public static final String TOPIC_VOTES_SAVED = TOPIC_USERS + "/{id}/votesSaved";
    public static final String USER_FORCE_DISCONNECT = SESSION_BASE + "force-disconnect/{id}";
    public static final String SEND_USER_FORCE_DISCONNECT = TOPIC_USERS + "force-disconnect/{id}";
    public static final String CLEAR_USER_ESTIMATION = SESSION_BASE + "{id}/clear-estimation";
    public static final String UPDATE_USER_ESTIMATION = SESSION_BASE + "{id}/estimated/{value}";
    public static final String SAVE_VOTES = SESSION_BASE + "{id}/save-votes/{storyId}/{currentStoryAverage}";
    public static final String UPDATE_STORIES = SESSION_BASE + "{id}/update-stories";
    public static final String TOPIC_STORIES_LIST = TOPIC_USERS + "{id}/stories";
    public static final String USER_ROLE_CHANGE = SESSION_BASE + "role/{id}/{newRole}";
    public static final String GET_SESSION_STATUS = SESSION_BASE + "{id}/get-state";
    public static final String SEND_SESSION_STATUS = TOPIC_USERS + "{id}/receive-state";
    public static final String FLIP_CARDS = SESSION_BASE + "{id}/flip-cards";
    public static final String REVOTE_STORY = SESSION_BASE + "{id}/revote-story";
}
