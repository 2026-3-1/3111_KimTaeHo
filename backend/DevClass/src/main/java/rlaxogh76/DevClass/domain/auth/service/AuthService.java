package rlaxogh76.DevClass.domain.auth.service;

import rlaxogh76.DevClass.domain.auth.dto.LoginRequest;
import rlaxogh76.DevClass.domain.auth.dto.LoginResponse;
import rlaxogh76.DevClass.domain.auth.dto.SignupRequest;
import rlaxogh76.DevClass.domain.auth.dto.SignupResponse;
import rlaxogh76.DevClass.domain.user.entity.User;
import rlaxogh76.DevClass.domain.user.repository.UserRepository;
import rlaxogh76.DevClass.global.exception.BusinessException;
import rlaxogh76.DevClass.global.exception.ErrorCode;
import rlaxogh76.DevClass.global.jwt.JwtProvider;
import rlaxogh76.DevClass.global.notification.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final EmailVerificationService emailVerificationService;
    private final EmailService emailService;

    public void sendVerificationCode(String email) {
        String code = emailVerificationService.generateAndStore(email);
        try {
            emailService.sendVerificationCode(email, code);
        } catch (Exception e) {
            log.error("[Auth] 인증 코드 발송 실패 email={} error={}", email, e.getMessage());
            emailVerificationService.remove(email);
            throw new BusinessException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    public void verifyCode(String email, String code) {
        if (!emailVerificationService.verify(email, code)) {
            throw new BusinessException(ErrorCode.EMAIL_VERIFICATION_FAILED);
        }
    }

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        if (!emailVerificationService.isVerified(request.email())) {
            throw new BusinessException(ErrorCode.EMAIL_NOT_VERIFIED);
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.EMAIL_DUPLICATE);
        }
        User.Role assignedRole = request.role() == User.Role.TEACHER
                ? User.Role.PENDING_TEACHER
                : request.role();
        User user = User.builder()
                .email(request.email())
                .name("")
                .password(passwordEncoder.encode(request.password()))
                .role(assignedRole)
                .build();
        User saved = userRepository.save(user);
        emailVerificationService.remove(request.email());
        return SignupResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        if (!user.isActive()) {
            throw new BusinessException(ErrorCode.ACCOUNT_SUSPENDED);
        }
        String token = jwtProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return LoginResponse.of(token);
    }
}
