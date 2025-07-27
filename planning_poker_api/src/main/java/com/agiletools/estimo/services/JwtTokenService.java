package com.agiletools.estimo.services;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;
import com.agiletools.estimo.dtos.UserDto;
import com.agiletools.estimo.utils.exceptions.AuthenticationCredentialsNotFoundException;
import com.agiletools.estimo.utils.exceptions.JwtAuthenticationException;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Duration;
import java.util.*;

@Service
@Slf4j
public class JwtTokenService {

    private static final long EXPIRATION_TIME = Duration.ofDays(1).toMillis();
    private static final String HEADER_STRING = "App-Auth";

    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_EMAIL = "email";

    @Value("${application.secret}")
    private String secret;

    public Authentication getAuthentication(final HttpServletRequest request) {
        final String token = request.getHeader(HEADER_STRING);
        if (token == null || token.isEmpty()) {
            log.warn("No jwt token found in request headers");
            return null;
        }

        try {
            Jws<Claims> claims = parseToken(token);

            Long id = Long.valueOf(claims.getBody().getSubject());
            String role = extractClaim(claims, CLAIM_ROLE, "role");
            String email = extractClaim(claims, CLAIM_EMAIL, "email");


            return createAuthentication(id, role, email);
        } catch (final MalformedJwtException | UnsupportedJwtException ex) {
            log.error("Unsupported jwt token {} with exception {}",
                    token, ex.getMessage());
            throw new JwtAuthenticationException(ex);
        } catch (final ExpiredJwtException ex) {
            log.error("Expired jwt token {}", ex.getMessage());
            throw new JwtAuthenticationException(ex);
        } catch (final AuthenticationCredentialsNotFoundException ex) {
            log.error("An error occurred while trying to create authentication based on jwt token, missing credentials {}",
                    ex.getMessage());
            throw new JwtAuthenticationException(ex);
        } catch (final Exception ex) {
            log.error("Unexpected exception occurred while parsing jwt {} exception: {}",
                    token, ex.getMessage());
            throw new JwtAuthenticationException(ex);
        }
    }

    private Jws<Claims> parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token);
    }

    public boolean validateToken(final String token) {
        try {
            Jws<Claims> claims = parseToken(token);
            return true;
        } catch (MalformedJwtException | UnsupportedJwtException | IllegalArgumentException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.warn("Expired JWT token: {}", ex.getMessage());
        } catch (JwtException ex) {
            log.error("JWT token validation failed: {}", ex.getMessage());
        }
        return false;
    }


    private String extractClaim(final Jws<Claims> claims, final String claimKey, final String claimName) {
        return Optional.ofNullable(claims.getBody().get(claimKey)).map(Object::toString).orElseThrow(() ->
                new AuthenticationCredentialsNotFoundException("No " + claimName + " found in jwt"));
    }

    private Authentication createAuthentication(Long id, String role, String email) {
        log.debug("Id: {}, Role: {}, Email: {}", id, role, email);

        role = role.replaceAll("[\\[\\]]", "");
        List<GrantedAuthority> grantedAuthorities = Collections.singletonList(new SimpleGrantedAuthority(role));

        return new UsernamePasswordAuthenticationToken(id, null, grantedAuthorities);
    }

    public String createJwtToken(final UserDto loggedUser) {
        String jwtToken;

        jwtToken = Jwts.builder()//
                .setSubject(String.valueOf(loggedUser.getId()))//
                .claim(CLAIM_ROLE, loggedUser.getRole())//
                .claim(CLAIM_EMAIL, loggedUser.getEmail())//
                .setIssuedAt(new Date())//
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))//
                .signWith(getSigningKey())
                .compact();
        return jwtToken;
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
