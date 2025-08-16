package com.agiletools.estimo.config.persistence;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy;

import javax.sql.DataSource;

@Configuration()
public class PersistenceConfig {

    @Bean(name = "readerInstance")
    @ConfigurationProperties("spring.datasource.reader")
    public DataSource readingDataSource(){
        DataSource readerDataSource = DataSourceBuilder.create().build();
        return readerDataSource;
    }

    @Bean(name = "writerInstance")
    @ConfigurationProperties("spring.datasource.writer")
    public DataSource writingDataSource(){
        DataSource writerDataSource = DataSourceBuilder.create().build();
        return writerDataSource;
    }

    @Primary
    @Bean
    public DataSource lazyDataSource(){
        var lazyDataSource = new LazyConnectionDataSourceProxy(writingDataSource());
        lazyDataSource.setReadOnlyDataSource(readingDataSource());

        return lazyDataSource;
    }
}
