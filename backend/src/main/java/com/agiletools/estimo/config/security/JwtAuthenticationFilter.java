package com.agiletools.estimo.config.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import com.agiletools.estimo.services.JwtTokenService;
import com.agiletools.estimo.utils.exceptions.JwtAuthenticationException;

import java.io.IOException;


public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenService jwtTokenService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest servletRequest, @NonNull HttpServletResponse servletResponse,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            Authentication auth = jwtTokenService.getAuthentication(servletRequest);
            if (auth != null) {
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
            filterChain.doFilter(servletRequest, servletResponse);
        } catch (final JwtAuthenticationException ex) {
            SecurityContextHolder.clearContext();
            servletResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error parsing JWT Token");
        }
    }
}
