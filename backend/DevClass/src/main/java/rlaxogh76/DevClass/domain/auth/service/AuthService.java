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
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(ErrorCode.EMAIL_DUPLICATE);
        }
        User user = User.builder()
                .email(request.email())
                .name("")
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .build();
        return SignupResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        String token = jwtProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return LoginResponse.of(token);
    }
}