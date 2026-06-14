package rlaxogh76.DevClass.domain.auth.controller;

import rlaxogh76.DevClass.domain.auth.dto.*;
import rlaxogh76.DevClass.domain.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Auth", description = "회원가입 / 로그인 API")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "회원가입",
            description = "이메일, 비밀번호, 역할(STUDENT / TEACHER)을 입력하여 회원가입합니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "회원가입 성공",
                    content = @Content(
                            schema = @Schema(implementation = SignupResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "id": 1,
                                      "email": "user@email.com",
                                      "role": "STUDENT",
                                      "createdAt": "2026-03-23T23:00:00"
                                    }
                                    """)
                    )
            ),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (필드 누락 또는 형식 오류)"),
            @ApiResponse(responseCode = "409", description = "이메일 중복")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            content = @Content(
                    examples = @ExampleObject(value = """
                            {
                              "email": "user@email.com",
                              "password": "1234",
                              "role": "STUDENT"
                            }
                            """)
            )
    )
    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(authService.signup(request));
    }

    @Operation(
            summary = "로그인",
            description = "이메일과 비밀번호로 로그인하고 JWT AccessToken을 발급받습니다."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "로그인 성공",
                    content = @Content(
                            schema = @Schema(implementation = LoginResponse.class),
                            examples = @ExampleObject(value = """
                                    {
                                      "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
                                      "tokenType": "Bearer"
                                    }
                                    """)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "이메일 또는 비밀번호 불일치")
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            content = @Content(
                    examples = @ExampleObject(value = """
                            {
                              "email": "user@email.com",
                              "password": "1234"
                            }
                            """)
            )
    )
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "이메일 인증 코드 발송", description = "입력한 이메일로 6자리 인증 코드를 발송합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "인증 코드 발송 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 이메일 형식")
    })
    @PostMapping("/email/send-code")
    public ResponseEntity<Void> sendVerificationCode(@Valid @RequestBody EmailSendRequest request) {
        authService.sendVerificationCode(request.email());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "이메일 인증 코드 확인", description = "발송된 인증 코드를 검증합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "인증 성공"),
            @ApiResponse(responseCode = "400", description = "코드 불일치 또는 만료")
    })
    @PostMapping("/email/verify-code")
    public ResponseEntity<Void> verifyCode(@Valid @RequestBody EmailVerifyRequest request) {
        authService.verifyCode(request.email(), request.code());
        return ResponseEntity.ok().build();
    }
}
