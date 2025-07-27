package com.agiletools.estimo.utils.security;

import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.*;

@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@PreAuthorize("hasAnyAuthority(T(com.agiletools.estimo.utils.enums.UserRole).MANAGER)")
public @interface AllowManagerOnly {
}
