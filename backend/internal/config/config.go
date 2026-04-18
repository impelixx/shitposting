package config

import "os"

type Config struct {
	DatabaseURL       string
	JWTSecret         string
	AdminUsername     string
	AdminPassword     string
	MeilisearchURL    string
	MeilisearchKey    string
	R2AccountID       string
	R2AccessKeyID     string
	R2SecretAccessKey string
	R2Bucket          string
	R2PublicURL       string
	Port              string
}

func Load() Config {
	return Config{
		DatabaseURL:       mustEnv("DATABASE_URL"),
		JWTSecret:         mustEnv("JWT_SECRET"),
		AdminUsername:     mustEnv("ADMIN_USERNAME"),
		AdminPassword:     mustEnv("ADMIN_PASSWORD"),
		MeilisearchURL:    getEnv("MEILISEARCH_URL", "http://localhost:7700"),
		MeilisearchKey:    getEnv("MEILISEARCH_KEY", "masterKey"),
		R2AccountID:       os.Getenv("R2_ACCOUNT_ID"),
		R2AccessKeyID:     os.Getenv("R2_ACCESS_KEY_ID"),
		R2SecretAccessKey: os.Getenv("R2_SECRET_ACCESS_KEY"),
		R2Bucket:          os.Getenv("R2_BUCKET"),
		R2PublicURL:       os.Getenv("R2_PUBLIC_URL"),
		Port:              getEnv("PORT", "8080"),
	}
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		panic("missing required env var: " + key)
	}
	return v
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
