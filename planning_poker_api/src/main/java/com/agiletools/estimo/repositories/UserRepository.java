package com.agiletools.estimo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.agiletools.estimo.entities.UserEntity;
import com.agiletools.estimo.utils.enums.UserRole;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    UserEntity findByUsernameAndPassword(String username, String password);

    UserEntity findByEmailAndPassword(String email, String password);

    List<UserEntity> findByRole(UserRole role);

    UserEntity findByUsername(String username);

    List<UserEntity> findAllByUsername(String username);
}
