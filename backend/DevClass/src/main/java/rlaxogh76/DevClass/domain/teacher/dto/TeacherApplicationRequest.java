package rlaxogh76.DevClass.domain.teacher.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TeacherApplicationRequest(
    @NotBlank(message = "전화번호는 필수입니다.")
    @Pattern(regexp = "^\\d{10,11}$", message = "전화번호는 숫자만 10~11자리로 입력해주세요.")
    String phone,

    @NotBlank(message = "소개글은 필수입니다.")
    @Size(min = 20, max = 1000, message = "소개글은 20자 이상 1000자 이하로 입력해주세요.")
    String introduction
) {}
