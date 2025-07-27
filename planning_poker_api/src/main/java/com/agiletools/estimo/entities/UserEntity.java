package com.agiletools.estimo.entities;


import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import com.agiletools.estimo.utils.enums.UserRole;

import java.util.List;

@Table(name="users")
@Entity
@Data
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @Column(name="full_name")
    private String fullName;

    @Column(name="username")
    private String username;

    @Column(name="password")
    private String password;

    @Column(name="email")
    private String email;

    @Column(name="phone_number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name="role")
    private UserRole role;

    @OneToMany( mappedBy ="creatorId", cascade= CascadeType.ALL, orphanRemoval = true)
    private List<SessionEntity> createdSessions;

    @OneToMany( mappedBy ="sessionManagerId", cascade =CascadeType.ALL, orphanRemoval = true)
    private List<SessionEntity> managedSessions;

    @OneToMany(mappedBy="user")
    @ToString.Exclude
    private List<UserSessionDetailsEntity> userSessionDetails;

    @OneToMany(mappedBy="user")
    @ToString.Exclude
    private List<UserStoryDetailsEntity> userStoryDetails;
}
