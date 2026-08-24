package com.frauddetection.backend.config;

import com.frauddetection.backend.config.properties.MlServiceProperties;
import io.netty.channel.ChannelOption;
import io.netty.handler.timeout.ReadTimeoutHandler;
import io.netty.handler.timeout.WriteTimeoutHandler;
import java.util.concurrent.TimeUnit;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

/**
 * Configures the {@link WebClient} used to call the Python ML microservice.
 * This is the ONLY outbound HTTP client this application defines.
 */
@Configuration
public class WebClientConfig {

    @Bean
    public WebClient mlServiceWebClient(MlServiceProperties properties) {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, properties.connectTimeoutMs())
                .doOnConnected(connection -> connection
                        .addHandlerLast(new ReadTimeoutHandler(properties.responseTimeoutMs(), TimeUnit.MILLISECONDS))
                        .addHandlerLast(new WriteTimeoutHandler(properties.responseTimeoutMs(), TimeUnit.MILLISECONDS)));

        return WebClient.builder()
                .baseUrl(properties.baseUrl())
                .clientConnector(new org.springframework.http.client.reactive.ReactorClientHttpConnector(httpClient))
                .build();
    }
}
