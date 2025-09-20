package com.agiletools.estimo.config.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final AnonymousHandshakeHandler anonymousHandshakeHandler;

    @Autowired
    public WebSocketConfig(final AnonymousHandshakeHandler anonymousHandshakeHandler) {
        this.anonymousHandshakeHandler = anonymousHandshakeHandler;
    }

    @Override
    public void registerStompEndpoints(final StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .addInterceptors(anonymousHandshakeHandler)
                .setAllowedOrigins(
                        "https://frontend.ubb-sed-estimo.com",
                        "http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5050"
                )
                .withSockJS()
                .setWebSocketEnabled(true)
                .setSessionCookieNeeded(false);
    }

    @Override
    public void configureMessageBroker(final MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/topic");
    }
}
