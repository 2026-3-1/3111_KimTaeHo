package rlaxogh76.DevClass.global.config;

import rlaxogh76.DevClass.global.jwt.JwtAuthenticationFilter;
import rlaxogh76.DevClass.global.jwt.JwtProvider;
import rlaxogh76.DevClass.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // TODO: 로그인 개발 완료 후 아래 한 줄 제거 후
                        //   .requestMatchers("/api/auth/**").permitAll()
                        //   .requestMatchers(HttpMethod.GET, "/api/courses/**").permitAll()
                        //   .requestMatchers("/api/enrollments/**").authenticated()
                        //   .anyRequest().authenticated()
                        //   으로 교체
                        .anyRequest().permitAll()
                )
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtProvider, userRepository),
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}