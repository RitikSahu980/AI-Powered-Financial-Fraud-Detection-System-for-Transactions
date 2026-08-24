package com.frauddetection.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record DeleteProfileRequest(

        @NotBlank
        String password

) {
}