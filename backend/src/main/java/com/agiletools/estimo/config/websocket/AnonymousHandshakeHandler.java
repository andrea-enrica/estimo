package com.agiletools.estimo.config.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import com.agiletools.estimo.services.JwtTokenService;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class AnonymousHandshakeHandler implements HandshakeInterceptor {

    private final JwtTokenService jwtTokenService;

    @Autowired
    public AnonymousHandshakeHandler(final JwtTokenService jwtTokenService) {
        this.jwtTokenService = jwtTokenService;
    }

    @Override
    public boolean beforeHandshake(final ServerHttpRequest request, final ServerHttpResponse response, final WebSocketHandler wsHandler,
                                   final Map<String, Object> attributes) throws Exception {
        final Map<String, String> queryParams = new HashMap<>();
        Arrays.stream(request.getURI().getQuery().split("&")).forEach(
                param -> queryParams.put(param.split("=")[0], param.split("=")[1])
        );
        return jwtTokenService.validateToken(queryParams.get("token"));
    }

    @Override
    public void afterHandshake(final ServerHttpRequest request, final ServerHttpResponse response, final WebSocketHandler wsHandler,
                               final Exception ex) {
    }
}
