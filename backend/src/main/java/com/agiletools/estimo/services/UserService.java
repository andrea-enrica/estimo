package com.agiletools.estimo.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.agiletools.estimo.dtos.SessionDto;
import com.agiletools.estimo.dtos.UserDto;
import com.agiletools.estimo.dtos.UserProfileDto;
import com.agiletools.estimo.entities.PaginatedResponse;
import com.agiletools.estimo.entities.SessionEntity;
import com.agiletools.estimo.entities.UserEntity;
import com.agiletools.estimo.entities.UserSessionDetailsEntity;
import com.agiletools.estimo.mappers.SessionMapper;
import com.agiletools.estimo.mappers.UserMapper;
import com.agiletools.estimo.repositories.UserRepository;
import com.agiletools.estimo.utils.enums.UserRole;
import com.agiletools.estimo.utils.enums.UserSessionStatus;
import com.agiletools.estimo.utils.exceptions.UsernameAlreadyExistsException;

import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;

@Service
public class UserService {

    private static final String emailRegex = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final SessionMapper sessionMapper;
    private final PasswordEncoder passwordEncoder;

    public UserService(final UserMapper userMapper, final UserRepository userRepository, final SessionMapper sessionMapper, final PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.userRepository = userRepository;
        this.sessionMapper = sessionMapper;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDto getUserByCredentialsAndPassword(final String credential, final String password) {
        final String encodedPassword = passwordEncoder.encode(password);
        final Predicate<String> isEmail = credentialEmail -> credential.matches(emailRegex);

        if (isEmail.test(credential)) {
            return userMapper.entityToDto(userRepository.findByEmailAndPassword(credential, encodedPassword));
        }

        return userMapper.entityToDto(userRepository.findByUsernameAndPassword(credential, encodedPassword));
    }

    public List<UserDto> getAllUsers() {
        return userMapper.entityListToDtoList(userRepository.findAll());
    }

    public List<UserProfileDto> getAllUsersProfiles() {

        final List<UserEntity> users = userRepository.findAll();
        return users.stream().map(userMapper::entityToProfileDto).toList();
    }


    public UserDto createUser(final UserDto userDto) {
        if (isUsernameTaken(userDto.getUsername())) {
            throw new UsernameAlreadyExistsException("Username '" + userDto.getUsername() + "' is already taken.");
        }

        userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));
        final UserEntity userEntity = userMapper.dtoToEntity(userDto);
        return userMapper.entityToDto(userRepository.save(userEntity));
    }

    private boolean isUsernameTaken(final String username) {
        final List<UserEntity> allByUsername = userRepository.findAllByUsername(username);
        return !allByUsername.isEmpty();
    }

    public boolean checkUsernameValability(final Long id, final UserDto userDto) {
        final UserEntity user = userRepository.findById(id).orElseThrow();
        final List<UserEntity> allByUsername = userRepository.findAllByUsername(userDto.getUsername());
        return !allByUsername.isEmpty() && !user.getUsername().equals(userDto.getUsername());
    }

    public UserProfileDto updateUserProfile(final Long id, final UserDto userDto) {
        if(checkUsernameValability(id, userDto)) {
            throw new UsernameAlreadyExistsException("Username is already taken by another user");
        }

        final UserEntity user = userRepository.findById(id).orElseThrow();
        if (userDto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }
        user.setUsername(userDto.getUsername());
        user.setFullName(userDto.getFullName());
        user.setPhoneNumber(userDto.getPhoneNumber());

        return userMapper.entityToProfileDto(userRepository.save(user));
    }

    public UserDto updateAdmin(final Long id, final UserDto userDto) {
        final UserEntity user = userRepository.findById(id).orElseThrow();

        if(checkUsernameValability(id, userDto)) {
            throw new UsernameAlreadyExistsException("Username is already taken by another user");
        }

        if (userDto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }
        user.setUsername(userDto.getUsername());
        user.setFullName(userDto.getFullName());
        user.setPhoneNumber(userDto.getPhoneNumber());

        // admin-only editable attributes
        user.setRole(UserRole.valueOf(userDto.getRole()));
        user.setEmail(userDto.getEmail());

        return userMapper.entityToDto(userRepository.save(user));
    }

    public void deleteUser(final Long userId) {
        userRepository.deleteById(userId);
    }

    public UserDto findUserById(final Long userId) {
        return userMapper.entityToDto(userRepository.findById(userId).orElseThrow());
    }

    public UserProfileDto findUserProfileById(final Long userId) {
        return userMapper.entityToProfileDto(userRepository.findById(userId).orElseThrow());
    }

    public List<SessionDto> getSessionsUserParticipatedIn(final Long userId) {
        final Optional<UserEntity> userEntity = userRepository.findById(userId);

        if (userEntity.isPresent()) {
            final List<UserSessionDetailsEntity> userSessionEntityList = userEntity.get().getUserSessionDetails();
            final List<UserSessionDetailsEntity> userSessionEntityListParticipated = userSessionEntityList.stream().filter(userSessionDetailsEntity -> userSessionDetailsEntity.getStatus().equals(UserSessionStatus.PARTICIPATED)).toList();
            final List<SessionEntity> sessionEntityList = userSessionEntityListParticipated.stream().map(UserSessionDetailsEntity::getSession).toList();
            return sessionMapper.entityListToDtoList(sessionEntityList);
        }
        return List.of();
    }

    public List<SessionDto> getSessionsUserWasInvitedIn(final Long userId) {
        final Optional<UserEntity> userEntity = userRepository.findById(userId);

        if (userEntity.isPresent()) {
            final List<UserSessionDetailsEntity> userSessionEntityList = userEntity.get().getUserSessionDetails();
            final List<UserSessionDetailsEntity> userSessionEntityListInvited = userSessionEntityList.stream().filter(userSessionDetailsEntity -> userSessionDetailsEntity.getStatus().equals(UserSessionStatus.INVITED)).toList();
            final List<SessionEntity> sessionEntityList = userSessionEntityListInvited.stream().map(UserSessionDetailsEntity::getSession).toList();
            return sessionMapper.entityListToDtoList(sessionEntityList);
        }
        return List.of();
    }

    public PaginatedResponse<UserDto> usersPaginated(final Integer size, final Integer page) {
        final Pageable pageable = PageRequest.of(page, size);
        final Page<UserEntity> pageWanted = userRepository.findAll(pageable);
        final List<UserDto> listOfUserDtos = userMapper.entityListToDtoList(pageWanted.getContent());

        return PaginatedResponse.<UserDto>builder()
                .content(listOfUserDtos)
                .currentPage(pageWanted.getNumber())
                .totalPages(pageWanted.getTotalPages())
                .totalElements(pageWanted.getTotalElements())
                .build();
    }

    public List<UserDto> getSessionManagers() {
        final List<UserEntity> managers = userRepository.findByRole(UserRole.MANAGER);
        return userMapper.entityListToDtoList(managers);
    }
}
