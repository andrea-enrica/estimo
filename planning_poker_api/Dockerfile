FROM public.ecr.aws/amazoncorretto/amazoncorretto:22

COPY target/*.jar api.jar
ARG drop_schema=false
ENV DROP_SCHEMA=${drop_schema}

ENTRYPOINT ["java",  "-jar", "api.jar", "--spring.liquibase.dropFirst=${DROP_SCHEMA}", "--spring.profiles.active=prod"]
