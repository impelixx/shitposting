package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file, reading from environment")
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("server starting on :%s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
