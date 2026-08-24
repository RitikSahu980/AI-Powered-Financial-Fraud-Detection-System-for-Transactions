package com.frauddetection.backend.repository;

import com.frauddetection.backend.entity.User;
import com.frauddetection.backend.enums.AccountStatus;
import com.frauddetection.backend.enums.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

/** Persistence abstraction for the users collection. Contains no business logic. */
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    List<User> findByRole(UserRole role);

    List<User> findByAccountStatus(AccountStatus status);
}
