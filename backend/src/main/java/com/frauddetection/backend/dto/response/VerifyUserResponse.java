package com.frauddetection.backend.dto.response;

import lombok.Builder;

@Builder
public record VerifyUserResponse(

        boolean verified,

        String token

) {
}