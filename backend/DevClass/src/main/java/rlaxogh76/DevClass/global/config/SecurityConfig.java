package rlaxogh76.DevClass.global.config;

import rlaxogh76.DevClass.global.jwt.JwtAuthenticationFilter;
import rlaxogh76.DevClass.global.jwt.JwtProvider;
import rlaxogh76.DevClass.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.IpAddressMatcher;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    @Value("${admin.allowed-ips:}")
    private String adminAllowedIps;

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
                .headers(headers -> headers
                        .contentTypeOptions(ct -> {})
                        .frameOptions(fo -> fo.deny())
                        .xssProtection(xss -> {})
                        .contentSecurityPolicy(csp ->
                                csp.policyDirectives(
                                        "default-src 'self'; " +
                                        "script-src 'self'; " +
                                        "style-src 'self' 'unsafe-inline'; " +
                                        "img-src 'self' data: https:; " +
                                        "frame-ancestors 'none'"
                                )
                        )
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers("/actuator/**").access((authentication, ctx) ->
                                new AuthorizationDecision(new IpAddressMatcher("127.0.0.1").matches(ctx.getRequest())))
                        .requestMatchers("/api/admin/**").access((supplier, ctx) -> {
                            Authentication authentication = supplier.get();
                            boolean isAdmin = authentication != null
                                    && authentication.isAuthenticated()
                                    && authentication.getAuthorities().stream()
                                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                            if (!isAdmin) return new AuthorizationDecision(false);
                            if (adminAllowedIps == null || adminAllowedIps.isBlank()) {
                                return new AuthorizationDecision(true);
                            }
                            boolean ipAllowed = Arrays.stream(adminAllowedIps.split(","))
                                    .map(String::trim)
                                    .filter(ip -> !ip.isEmpty())
                                    .anyMatch(ip -> new IpAddressMatcher(ip).matches(ctx.getRequest()));
                            return new AuthorizationDecision(ipAllowed);
                        })
                        .anyRequest().permitAll()
                )
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtProvider, userRepository),
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}