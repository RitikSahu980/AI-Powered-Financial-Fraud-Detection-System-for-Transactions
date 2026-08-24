package com.frauddetection.backend.service;

import com.frauddetection.backend.dto.request.LoginRequest;
import com.frauddetection.backend.dto.request.RegisterUserRequest;
import com.frauddetection.backend.dto.response.LoginResponse;
import com.frauddetection.backend.dto.response.UserResponse;
import com.frauddetection.backend.dto.response.VerifyUserResponse;
import com.frauddetection.backend.exception.DuplicateResourceException;
import com.frauddetection.backend.exception.ResourceNotFoundException;

public interface UserService {

    UserResponse registerUser(RegisterUserRequest request);

    UserResponse getUserById(String userId);

    UserResponse getUserByEmail(String email);
    VerifyUserResponse verifyUser(String username, String email);
    
    LoginResponse login(LoginRequest request);
    void deleteProfile(String userId, String password);
    void resetPassword(String token, String newPassword);
    void changePassword(
            String userId,
            String currentPassword,
            String newPassword
    );
}
