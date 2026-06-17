package rlaxogh76.DevClass.global.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import rlaxogh76.DevClass.global.interceptor.AdminAuditInterceptor;

@Configuration
@RequiredArgsConstructor
public class AdminInterceptorConfig implements WebMvcConfigurer {

    private final AdminAuditInterceptor adminAuditInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(adminAuditInterceptor)
                .addPathPatterns("/api/admin/**");
    }
}
