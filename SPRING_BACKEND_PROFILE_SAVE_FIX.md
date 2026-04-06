# Spring Boot Fix: Profile Saves But Not Visible

This guide fixes exactly this issue:
- Frontend shows Profile updated successfully
- But updated fields are not visible later
- Or fields become null after refresh/login

Use this in your separate Spring Boot backend project.

## 1. Root Cause

Most likely one or more of these backend issues are present:

1. User entity does not contain all profile columns (phone, bio, institution, specialization, experienceYears).
2. Update endpoint ignores some request fields.
3. Response DTO excludes updated fields, so frontend receives old/partial user.
4. Existing database table is missing new columns.
5. CORS is not configured for PUT from frontend origin.

## 2. Required User Fields in Entity

File: User.java
Package example: com.careerportal.career_backend.entity

Add these fields if missing:

- phone
- bio
- institution
- specialization
- experienceYears
- questionnaireCompleted

Example:

@Column(name = "phone")
private String phone;

@Column(name = "bio", length = 2000)
private String bio;

@Column(name = "institution")
private String institution;

@Column(name = "specialization")
private String specialization;

@Column(name = "experience_years")
private Integer experienceYears;

@Column(name = "questionnaire_completed", nullable = false)
private Boolean questionnaireCompleted = false;

Make sure getters and setters are present for all of the above.

## 3. Database Migration (Very Important)

If your table already exists, add missing columns in DB.

MySQL example:

ALTER TABLE users ADD COLUMN phone VARCHAR(50) NULL;
ALTER TABLE users ADD COLUMN bio TEXT NULL;
ALTER TABLE users ADD COLUMN institution VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN specialization VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN experience_years INT NULL;
ALTER TABLE users ADD COLUMN questionnaire_completed BIT(1) NOT NULL DEFAULT b'0';

PostgreSQL example:

ALTER TABLE users ADD COLUMN phone VARCHAR(50);
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN institution VARCHAR(255);
ALTER TABLE users ADD COLUMN specialization VARCHAR(255);
ALTER TABLE users ADD COLUMN experience_years INTEGER;
ALTER TABLE users ADD COLUMN questionnaire_completed BOOLEAN NOT NULL DEFAULT FALSE;

If using Flyway/Liquibase, add proper migration file instead of manual SQL.

## 4. Update Profile Request DTO

Create or update UpdateProfileRequest.java:

package com.careerportal.career_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UpdateProfileRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    private String phone;
    private String bio;
    private String institution;
    private String specialization;
    private Integer experienceYears;
    private Boolean questionnaireCompleted;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public Boolean getQuestionnaireCompleted() { return questionnaireCompleted; }
    public void setQuestionnaireCompleted(Boolean questionnaireCompleted) { this.questionnaireCompleted = questionnaireCompleted; }
}

## 5. Repository Methods

File: UserRepository.java

Add:

Optional<User> findByEmailIgnoreCase(String email);
boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

If your id is not Long, change type accordingly.

## 6. Service Method That Actually Persists All Fields

File: UserService.java

Add or replace update method:

@Transactional
public User updateProfile(Long userId, UpdateProfileRequest req) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("User not found"));

    String normalizedEmail = req.getEmail().trim().toLowerCase();
    if (userRepository.existsByEmailIgnoreCaseAndIdNot(normalizedEmail, userId)) {
        throw new RuntimeException("Email already exists");
    }

    user.setName(req.getName().trim());
    user.setEmail(normalizedEmail);
    user.setPhone(req.getPhone() == null ? null : req.getPhone().trim());
    user.setBio(req.getBio() == null ? null : req.getBio().trim());
    user.setInstitution(req.getInstitution() == null ? null : req.getInstitution().trim());
    user.setSpecialization(req.getSpecialization() == null ? null : req.getSpecialization().trim());
    user.setExperienceYears(req.getExperienceYears());

    if (req.getQuestionnaireCompleted() != null) {
        user.setQuestionnaireCompleted(req.getQuestionnaireCompleted());
    }

    return userRepository.save(user);
}

## 7. Controller Endpoints Required By Frontend

Your frontend tries these update routes:
- /api/users/{id}
- /api/admin/users/{id}
- /api/auth/users/{id}

Implement one controller method mapped to all 3:

@PutMapping({"/api/users/{id}", "/api/admin/users/{id}", "/api/auth/users/{id}"})
public ResponseEntity<?> updateUser(
    @PathVariable Long id,
    @Valid @RequestBody UpdateProfileRequest request
) {
    try {
        User updated = userService.updateProfile(id, request);
        return ResponseEntity.ok(Map.of("user", toUserResponse(updated)));
    } catch (RuntimeException ex) {
        if ("User not found".equals(ex.getMessage())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        }
        if ("Email already exists".equals(ex.getMessage())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", ex.getMessage()));
    } catch (Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("message", "Failed to update user", "error", ex.getMessage()));
    }
}

## 8. Return Full User Object In Login Response

If login response excludes profile fields, UI will look unsaved after re-login.

Ensure login returns this shape:

{
  "user": {
    "id": 2,
    "name": "Rama Naidu",
    "email": "rama@gmail.com",
    "role": "student",
    "status": "active",
    "specialization": "Data Science",
    "phone": "9573731708",
    "bio": "I like coding,Game development.",
    "institution": "K L University",
    "experienceYears": null,
    "questionnaireCompleted": false
  }
}

If you use a response DTO, include all these fields.

## 9. CORS Fix (Needed For Browser PUT Requests)

If backend and frontend are different origins, add CORS config.

Option A: Global config

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}

Option B: Controller-level CORS annotation on auth/user controllers.

## 10. Verify Quickly

Run these checks:

1. Save profile from UI.
2. In backend logs verify PUT endpoint hit.
3. In DB, query user row and confirm phone, bio, institution, specialization updated.
4. Logout and login again.
5. Edit Profile popup should show saved values.

## 11. Common Mistake Checklist

- Entity has fields but DB table does not.
- DTO has fields but service does not set them.
- Service updates fields but response DTO does not return them.
- CORS allows GET/POST only, blocks PUT.
- Different user id is being updated than currently logged in user.

## 12. Frontend Contract Your Backend Must Match

For update:

PUT /api/users/{id}
Body fields used by frontend:
- name
- email
- phone
- institution
- specialization
- bio
- experienceYears (for counselor)
- questionnaireCompleted (sometimes)

Response expected:

{
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "role": "student or counselor or admin",
    "status": "active",
    "specialization": "...",
    "phone": "...",
    "bio": "...",
    "institution": "...",
    "experienceYears": null,
    "questionnaireCompleted": false
  }
}

If response differs, adjust backend to this shape or map it in frontend.
