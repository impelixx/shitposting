package main

import (
	"context"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	"github.com/impelix/blogik-backend/internal/config"
	"github.com/impelix/blogik-backend/internal/db"
	"github.com/impelix/blogik-backend/internal/handler"
	"github.com/impelix/blogik-backend/internal/middleware"
	"github.com/impelix/blogik-backend/internal/repository"
	"github.com/impelix/blogik-backend/internal/search"
	"github.com/impelix/blogik-backend/internal/storage"
)

func main() {
	_ = godotenv.Load()
	cfg := config.Load()
	ctx := context.Background()

	pool, err := db.NewPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer pool.Close()

	if err := db.RunMigrations(pool); err != nil {
		log.Fatalf("migrations: %v", err)
	}

	postRepo := repository.NewPostRepo(pool)
	commentRepo := repository.NewCommentRepo(pool)
	tagRepo := repository.NewTagRepo(pool)

	searchClient := search.NewClient(cfg.MeilisearchURL, cfg.MeilisearchKey)

	// Index all published posts on startup so search works from day one.
	go func() {
		posts, err := postRepo.ListAll(ctx)
		if err != nil {
			log.Printf("reindex: list posts: %v", err)
			return
		}
		indexed := 0
		for _, p := range posts {
			if !p.Published {
				continue
			}
			if err := searchClient.IndexPost(search.PostDocument{
				ID:      p.ID,
				Title:   p.Title,
				Excerpt: p.Excerpt,
				Body:    p.Body,
				Slug:    p.Slug,
				Tags:    p.Tags,
			}); err != nil {
				log.Printf("reindex: %s: %v", p.Slug, err)
			} else {
				indexed++
			}
		}
		log.Printf("reindex: indexed %d posts", indexed)
	}()

	r2, err := storage.NewR2Client(cfg.R2AccountID, cfg.R2AccessKeyID, cfg.R2SecretAccessKey, cfg.R2Bucket, cfg.R2PublicURL)
	if err != nil {
		log.Fatalf("r2: %v", err)
	}

	authH := handler.NewAuthHandler(cfg)
	postsH := handler.NewPostsHandler(postRepo, searchClient)
	commentsH := handler.NewCommentsHandler(postRepo, commentRepo)
	tagsH := handler.NewTagsHandler(tagRepo)
	searchH := handler.NewSearchHandler(searchClient, postRepo)
	statsH := handler.NewStatsHandler(postRepo)
	uploadH := handler.NewUploadHandler(r2)

	r := chi.NewRouter()
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			if req.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, req)
		})
	})

	r.Post("/api/auth/login", authH.Login)

	r.Get("/api/posts", postsH.List)
	r.Get("/api/posts/{slug}", postsH.Get)
	r.Post("/api/posts/{slug}/view", postsH.View)
	r.Get("/api/posts/{slug}/comments", commentsH.List)
	r.Post("/api/posts/{slug}/comments", commentsH.Create)
	r.Get("/api/tags", tagsH.List)
	r.Get("/api/search", searchH.Search)
	r.Get("/api/stats", statsH.Get)

	r.Group(func(r chi.Router) {
		r.Use(middleware.RequireAuth(cfg.JWTSecret))
		r.Get("/api/admin/posts", postsH.ListAll)
		r.Post("/api/posts", postsH.Create)
		r.Put("/api/posts/{slug}", postsH.Update)
		r.Delete("/api/posts/{slug}", postsH.Delete)
		r.Post("/api/upload", uploadH.Upload)
	})

	log.Printf("listening on :%s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, r))
}
