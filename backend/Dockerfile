FROM public.ecr.aws/amazoncorretto/amazoncorretto:22

COPY target/*.jar api.jar

ENTRYPOINT ["java",  "-jar", "api.jar", "--spring.profiles.active=prod"]
