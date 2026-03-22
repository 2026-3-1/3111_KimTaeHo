package rlaxogh76.DevClass.domain.auth.dto;

public record LoginResponse(
        String accessToken,
        String tokenType
) {
    public static LoginResponse of(String token) {
        return new LoginResponse(token, "Bearer");
    }
}