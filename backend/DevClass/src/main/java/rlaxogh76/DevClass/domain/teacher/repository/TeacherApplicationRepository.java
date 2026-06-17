package rlaxogh76.DevClass.domain.teacher.repository;

import rlaxogh76.DevClass.domain.teacher.entity.TeacherApplication;
import rlaxogh76.DevClass.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherApplicationRepository extends JpaRepository<TeacherApplication, Long> {
    boolean existsByUserAndStatus(User user, TeacherApplication.Status status);
    List<TeacherApplication> findAllByOrderByCreatedAtDesc();
}
