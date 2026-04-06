# Spring Boot Backend Changes (Google Login + Editable Profiles)

This document gives copy-ready backend changes for your separate Spring Boot project.

## 1. Add Maven Dependencies

Update your `pom.xml` with these dependencies (if not already present):

```xml
<dependencies>
    <!-- Existing deps... -->

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-crypto</artifactId>
    </dependency>

    <dependency>
        <groupId>com.google.api-client</groupId>
        <artifactId>google-api-client</artifactId>
        <version>2.7.2</version>
    </dependency>

    <dependency>
        <groupId>com.google.http-client</groupId>
        <artifactId>google-http-client-gson</artifactId>
        <version>1.45.0</version>
    </dependency>
</dependencies>
```

## 2. Add Application Properties

In `application.properties` (or `application.yml`):

```properties
google.client-id=your_google_client_id.apps.googleusercontent.com
```

## 3. Update `User` Entity

In your existing `User` entity, add these fields if missing:

```java
@Column(unique = true, nullable = false)
private String email;

private String phone;
private String bio;
private String institution;
private String specialization;
private Integer experienceYears;

private Boolean questionnaireCompleted = false;

@Column(nullable = false)
private String provider = "local"; // local | google

@Column(unique = true)
private String googleSub;
```

If you use Flyway/Liquibase, add migration for these columns.

## 4. Repository Methods

In `UserRepository` add:

```java
Optional<User> findByEmailIgnoreCase(String email);
Optional<User> findByGoogleSub(String googleSub);
boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
List<User> findByRole(UserRole role);
```

If your `id` type is not `Long`, change the generic accordingly.

## 5. DTOs

Create DTOs under `dto` package.

### 5.1 `GoogleAuthRequest.java`

```java
package com.careerportal.career_backend.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequest {
    @NotBlank
    private String token;

    private String role;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
```

### 5.2 `UpdateProfileRequest.java`

```java
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
```

## 6. Google Token Verification Service

Create `service/GoogleTokenService.java`:

```java
package com.careerportal.career_backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleTokenService {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenService(@Value("${google.client-id}") String googleClientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
            .setAudience(Collections.singletonList(googleClientId))
            .build();
    }

    public GoogleIdToken.Payload verify(String idToken) throws Exception {
        GoogleIdToken token = verifier.verify(idToken);
        if (token == null) {
            throw new IllegalArgumentException("Invalid Google token");
        }
        return token.getPayload();
    }
}
```

## 7. Auth Service Changes

In your auth service, add method `loginWithGoogle`:

```java
public User loginWithGoogle(String token, String requestedRole) throws Exception {
    GoogleIdToken.Payload payload = googleTokenService.verify(token);

    String email = String.valueOf(payload.getEmail()).trim().toLowerCase();
    String googleSub = payload.getSubject();
    String name = payload.get("name") != null ? String.valueOf(payload.get("name")) : email.split("@")[0];

    User user = userRepository.findByGoogleSub(googleSub)
        .or(() -> userRepository.findByEmailIgnoreCase(email))
        .orElseGet(User::new);

    if (user.getId() == null) {
        user.setRole(parseRole(requestedRole));
        user.setQuestionnaireCompleted(false);
    }

    user.setName(name);
    user.setEmail(email);
    user.setGoogleSub(googleSub);
    user.setProvider("google");

    return userRepository.save(user);
}
```

`parseRole` should map to your enum (`STUDENT`, `COUNSELOR`, `ADMIN`) and default to `STUDENT`.

## 8. Auth Controller Endpoint

In your auth controller add:

```java
@PostMapping("/api/auth/google")
public ResponseEntity<?> googleAuth(@Valid @RequestBody GoogleAuthRequest request) {
    try {
        User user = authService.loginWithGoogle(request.getToken(), request.getRole());
        return ResponseEntity.ok(Map.of("user", user));
    } catch (Exception ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("message", "Google authentication failed", "error", ex.getMessage()));
    }
}
```

## 9. User Profile Update Endpoint

In your user controller add update endpoint compatible with frontend:

```java
@PutMapping({"/api/users/{id}", "/api/auth/users/{id}", "/api/admin/users/{id}"})
public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateProfileRequest request) {
    return userRepository.findById(id)
        .map(existing -> {
            String email = request.getEmail().trim().toLowerCase();
            if (userRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already exists"));
            }

            existing.setName(request.getName().trim());
            existing.setEmail(email);
            existing.setPhone(request.getPhone());
            existing.setBio(request.getBio());
            existing.setInstitution(request.getInstitution());
            existing.setSpecialization(request.getSpecialization());
            existing.setExperienceYears(request.getExperienceYears());
            if (request.getQuestionnaireCompleted() != null) {
                existing.setQuestionnaireCompleted(request.getQuestionnaireCompleted());
            }

            User saved = userRepository.save(existing);
            return ResponseEntity.ok(Map.of("user", saved));
        })
        .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("message", "User not found")));
}
```

## 10. List Users / Students Endpoints (if missing)

Frontend uses these reads for dashboards:

- `GET /api/users`
- `GET /api/auth/users`
- `GET /api/admin/users`
- `GET /api/users/students`
- `GET /api/auth/users/students`

They should return:

```json
{ "users": [ ... ] }
```

## 11. Frontend Env Needed

In frontend `.env`:

```properties
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## 12. Notes for Your Current Frontend

- Google button is added on signup page and posts token to `POST /api/auth/google`.
- Student and counselor profile edit dialogs now call `PUT /api/users/{id}`.
- API response expected shape for user operations is:

```json
{ "user": { ... } }
```

If your backend returns different structure, adjust either frontend mapping or controller response.
