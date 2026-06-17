package rlaxogh76.DevClass.global.security;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long BLOCK_MS = 15 * 60 * 1000L;

    // [실패 횟수, 마지막 실패 timestamp]
    private final ConcurrentHashMap<String, long[]> cache = new ConcurrentHashMap<>();

    public void recordSuccess(String email) {
        cache.remove(email);
    }

    public void recordFailure(String email) {
        cache.compute(email, (k, v) -> {
            long[] info = (v != null) ? v : new long[]{0, 0};
            info[0]++;
            info[1] = System.currentTimeMillis();
            return info;
        });
    }

    public boolean isBlocked(String email) {
        long[] info = cache.get(email);
        if (info == null || info[0] < MAX_ATTEMPTS) return false;
        if (System.currentTimeMillis() - info[1] > BLOCK_MS) {
            cache.remove(email);
            return false;
        }
        return true;
    }
}
