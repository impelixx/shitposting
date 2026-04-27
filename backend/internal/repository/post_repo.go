package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Post struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug"`
	Body        string    `json:"body"`
	Excerpt     string    `json:"excerpt"`
	Tags        []string  `json:"tags"`
	CoverImage  string    `json:"cover_image"`
	Published   bool      `json:"published"`
	Views       int64     `json:"views"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreatePostInput struct {
	Title      string   `json:"title"`
	Slug       string   `json:"slug"`
	Body       string   `json:"body"`
	Excerpt    string   `json:"excerpt"`
	Tags       []string `json:"tags"`
	CoverImage string   `json:"cover_image"`
	Published  bool     `json:"published"`
}

type UpdatePostInput struct {
	Title      string   `json:"title"`
	Slug       string   `json:"slug"`
	Body       string   `json:"body"`
	Excerpt    string   `json:"excerpt"`
	Tags       []string `json:"tags"`
	CoverImage string   `json:"cover_image"`
	Published  bool     `json:"published"`
}

type PostRepo struct {
	pool *pgxpool.Pool
}

func NewPostRepo(pool *pgxpool.Pool) *PostRepo {
	return &PostRepo{pool: pool}
}

func (r *PostRepo) Create(ctx context.Context, in CreatePostInput) (*Post, error) {
	var p Post
	err := r.pool.QueryRow(ctx, `
		INSERT INTO posts (title, slug, body, excerpt, tags, cover_image, published)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, title, slug, body, excerpt, tags, cover_image, published, views, created_at, updated_at`,
		in.Title, in.Slug, in.Body, in.Excerpt, in.Tags, in.CoverImage, in.Published,
	).Scan(&p.ID, &p.Title, &p.Slug, &p.Body, &p.Excerpt, &p.Tags, &p.CoverImage, &p.Published, &p.Views, &p.CreatedAt, &p.UpdatedAt)
	return &p, err
}

func (r *PostRepo) GetBySlug(ctx context.Context, slug string) (*Post, error) {
	var p Post
	err := r.pool.QueryRow(ctx, `
		SELECT id, title, slug, body, excerpt, tags, cover_image, published, views, created_at, updated_at
		FROM posts WHERE slug = $1 AND published = true`, slug,
	).Scan(&p.ID, &p.Title, &p.Slug, &p.Body, &p.Excerpt, &p.Tags, &p.CoverImage, &p.Published, &p.Views, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PostRepo) GetBySlugAdmin(ctx context.Context, slug string) (*Post, error) {
	var p Post
	err := r.pool.QueryRow(ctx, `
		SELECT id, title, slug, body, excerpt, tags, cover_image, published, views, created_at, updated_at
		FROM posts WHERE slug = $1`, slug,
	).Scan(&p.ID, &p.Title, &p.Slug, &p.Body, &p.Excerpt, &p.Tags, &p.CoverImage, &p.Published, &p.Views, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PostRepo) List(ctx context.Context, tag string, limit, offset int) ([]*Post, error) {
	var query string
	var args []any
	if tag != "" {
		query = `SELECT id, title, slug, body, excerpt, tags, cover_image, published, views, created_at, updated_at
		          FROM posts WHERE published = true AND $1 = ANY(tags)
		          ORDER BY created_at DESC LIMIT $2 OFFSET $3`
		args = []any{tag, limit, offset}
	} else {
		query = `SELECT id, title, slug, body, excerpt, tags, cover_image, published, views, created_at, updated_at
		          FROM posts WHERE published = true
		          ORDER BY created_at DESC LIMIT $1 OFFSET $2`
		args = []any{limit, offset}
	}
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	posts := make([]*Post, 0)
	for rows.Next() {
		var p Post
		if err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.Body, &p.Excerpt, &p.Tags, &p.CoverImage, &p.Published, &p.Views, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		posts = append(posts, &p)
	}
	return posts, rows.Err()
}

func (r *PostRepo) ListAll(ctx context.Context) ([]*Post, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, title, slug, body, excerpt, tags, cover_image, published, views, created_at, updated_at
		FROM posts ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	posts := make([]*Post, 0)
	for rows.Next() {
		var p Post
		if err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.Body, &p.Excerpt, &p.Tags, &p.CoverImage, &p.Published, &p.Views, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		posts = append(posts, &p)
	}
	return posts, rows.Err()
}

func (r *PostRepo) Update(ctx context.Context, slug string, in UpdatePostInput) (*Post, error) {
	var p Post
	err := r.pool.QueryRow(ctx, `
		UPDATE posts SET title=$1, slug=$2, body=$3, excerpt=$4, tags=$5, cover_image=$6, published=$7, updated_at=now()
		WHERE slug=$8
		RETURNING id, title, slug, body, excerpt, tags, cover_image, published, views, created_at, updated_at`,
		in.Title, in.Slug, in.Body, in.Excerpt, in.Tags, in.CoverImage, in.Published, slug,
	).Scan(&p.ID, &p.Title, &p.Slug, &p.Body, &p.Excerpt, &p.Tags, &p.CoverImage, &p.Published, &p.Views, &p.CreatedAt, &p.UpdatedAt)
	return &p, err
}

func (r *PostRepo) Delete(ctx context.Context, slug string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM posts WHERE slug = $1`, slug)
	return err
}

func (r *PostRepo) IncrementViews(ctx context.Context, slug string) (int64, error) {
	var views int64
	err := r.pool.QueryRow(ctx,
		`UPDATE posts SET views = views + 1 WHERE slug = $1 AND published = true RETURNING views`,
		slug,
	).Scan(&views)
	return views, err
}

type Stats struct {
	TotalPosts    int64       `json:"total_posts"`
	TotalViews    int64       `json:"total_views"`
	TotalComments int64       `json:"total_comments"`
	PostsPerDay   []DayCount  `json:"posts_per_day"`
}

type DayCount struct {
	Day   string `json:"day"`
	Count int    `json:"count"`
}

func (r *PostRepo) GetStats(ctx context.Context) (*Stats, error) {
	s := &Stats{PostsPerDay: []DayCount{}} // never nil → always marshals as []
	err := r.pool.QueryRow(ctx, `
		SELECT
			COUNT(*) FILTER (WHERE published = true),
			COALESCE(SUM(views) FILTER (WHERE published = true), 0)
		FROM posts`,
	).Scan(&s.TotalPosts, &s.TotalViews)
	if err != nil {
		return nil, err
	}
	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM comments`).Scan(&s.TotalComments)

	rows, err := r.pool.Query(ctx, `
		SELECT DATE(created_at)::text, COUNT(*)
		FROM posts
		WHERE published = true AND created_at > NOW() - INTERVAL '112 days'
		GROUP BY DATE(created_at)
		ORDER BY DATE(created_at)`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var dc DayCount
			if rows.Scan(&dc.Day, &dc.Count) == nil {
				s.PostsPerDay = append(s.PostsPerDay, dc)
			}
		}
	}
	return s, nil
}

func (r *PostRepo) Search(ctx context.Context, q string) ([]*Post, error) {
	like := "%" + q + "%"
	rows, err := r.pool.Query(ctx, `
		SELECT id, title, slug, body, excerpt, tags, cover_image, published, views, created_at, updated_at
		FROM posts
		WHERE published = true AND (
			title ILIKE $1 OR
			excerpt ILIKE $1 OR
			body ILIKE $1 OR
			EXISTS (SELECT 1 FROM unnest(tags) t WHERE t ILIKE $1)
		)
		ORDER BY
			CASE WHEN title ILIKE $1 THEN 0
			     WHEN excerpt ILIKE $1 THEN 1
			     ELSE 2 END,
			created_at DESC
		LIMIT 20`, like)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	posts := make([]*Post, 0)
	for rows.Next() {
		var p Post
		if err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.Body, &p.Excerpt, &p.Tags, &p.CoverImage, &p.Published, &p.Views, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		posts = append(posts, &p)
	}
	return posts, rows.Err()
}
