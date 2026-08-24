package com.frauddetection.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI 3 / Swagger UI configuration.
 *
 * <p>This class is documentation-only: it configures metadata for the
 * already-existing REST API surface (Modules 7-8) and changes nothing
 * about request handling, validation, or business logic. With
 * {@code springdoc-openapi-starter-webmvc-ui} on the classpath, this
 * configuration is picked up automatically to serve:
 * <ul>
 *   <li>Swagger UI at {@code /swagger-ui.html} (redirects to {@code /swagger-ui/index.html})</li>
 *   <li>The raw OpenAPI 3 document at {@code /v3/api-docs}</li>
 * </ul>
 *
 * <p><b>Contact object note:</b> OpenAPI's {@code Contact} schema supports
 * only {@code name}, {@code url}, and {@code email} - it has no dedicated
 * field for a role/title. "Final Year Computer Engineering Project" is
 * therefore folded into the top-level API description below rather than
 * invented as a non-standard Contact field.
 *
 * <p><b>Security scheme note:</b> per this module's explicit scope,
 * authentication is not implemented, and no JWT/OAuth security scheme is
 * declared here - a real {@code SecurityScheme} component would imply
 * infrastructure that does not exist yet. The description below states
 * plainly that authentication is planned for a future module, without
 * documenting a scheme that isn't real.
 */
@Configuration
public class OpenApiConfig {

    private static final String API_DESCRIPTION = """
            REST API for an AI-Powered Financial Fraud Detection System.

            The backend orchestrates transaction processing, communicates with the \
            Python XGBoost prediction service, calculates confidence and risk levels, \
            creates alerts, stores prediction history, and exposes REST endpoints to \
            frontend applications.

            Built by Ayush Kumar as a Final Year Computer Engineering Project.

            Authentication is not yet implemented. All endpoints are currently \
            unauthenticated; authentication (JWT-based) will be added in a future module.""";

    @Bean
    public OpenAPI fraudDetectionOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("AI-Powered Financial Fraud Detection System API")
                        .version("v1.0")
                        .description(API_DESCRIPTION)
                        .contact(new Contact()
                                .name("Ayush Kumar")
                                .email("placeholder@example.com"))
                        .license(new License()
                                .name("Educational Project")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Development"),
                        new Server()
                                .url("https://api.example.com")
                                .description("Production (placeholder - not yet deployed)")
                ));
    }
}
