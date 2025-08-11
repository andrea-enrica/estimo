package com.agiletools.estimo.utils.exceptions;

public class JwtAuthenticationException extends RuntimeException {
    
    public JwtAuthenticationException(final Exception ex) {
        super(ex);
    }
}
