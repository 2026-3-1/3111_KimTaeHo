package rlaxogh76.DevClass.domain.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EmailVerificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailVerificationService.class);

    private record VerificationEntry(
            String code,
            LocalDateTime codeExpiresAt,
            boolean verified,
            LocalDateTime verifiedUntil
    ) {}

    private final Map<String, VerificationEntry> store = new ConcurrentHashMap<>();

    public String generateAndStore(String email) {
        String code = String.format("%06d", new Random().nextInt(1_000_000));
        store.put(email, new VerificationEntry(code, LocalDateTime.now().plusMinutes(5), false, null));
        log.info("[EmailVerification] 인증 코드 생성 email={}", email);
        return code;
    }

    public boolean verify(String email, String code) {
        VerificationEntry entry = store.get(email);
        if (entry == null || entry.codeExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("[EmailVerification] 코드 만료 또는 미존재 email={}", email);
            return false;
        }
        if (!entry.code().equals(code)) {
            log.warn("[EmailVerification] 코드 불일치 email={}", email);
            return false;
        }
        store.put(email, new VerificationEntry(entry.code(), entry.codeExpiresAt(), true, LocalDateTime.now().plusMinutes(30)));
        log.info("[EmailVerification] 인증 완료 email={}", email);
        return true;
    }

    public boolean isVerified(String email) {
        VerificationEntry entry = store.get(email);
        return entry != null
                && entry.verified()
                && entry.verifiedUntil() != null
                && entry.verifiedUntil().isAfter(LocalDateTime.now());
    }

    public void remove(String email) {
        store.remove(email);
    }
}
