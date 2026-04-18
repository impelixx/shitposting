package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Comment struct {
	ID        string    `json:"id"`
	PostID    string    `json:"post_id"`
	Author    string    `json:"author"`
	Body      string    `json:"body"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateCommentInput struct {
	Author string `json:"author"`
	Body   string `json:"body"`
}

type CommentRepo struct {
	pool *pgxpool.Pool
}

func NewCommentRepo(pool *pgxpool.Pool) *CommentRepo {
	return &CommentRepo{pool: pool}
}

func (r *CommentRepo) Create(ctx context.Context, postID string, in CreateCommentInput) (*Comment, error) {
	var c Comment
	err := r.pool.QueryRow(ctx, `
		INSERT INTO comments (post_id, author, body)
		VALUES ($1, $2, $3)
		RETURNING id, post_id, author, body, created_at`,
		postID, in.Author, in.Body,
	).Scan(&c.ID, &c.PostID, &c.Author, &c.Body, &c.CreatedAt)
	return &c, err
}

func (r *CommentRepo) ListByPostID(ctx context.Context, postID string) ([]*Comment, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, post_id, author, body, created_at
		FROM comments WHERE post_id = $1 ORDER BY created_at ASC`, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	comments := make([]*Comment, 0)
	for rows.Next() {
		var c Comment
		if err := rows.Scan(&c.ID, &c.PostID, &c.Author, &c.Body, &c.CreatedAt); err != nil {
			return nil, err
		}
		comments = append(comments, &c)
	}
	return comments, rows.Err()
}

func (r *CommentRepo) CountByPostID(ctx context.Context, postID string) (int, error) {
	var n int
	err := r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM comments WHERE post_id = $1`, postID).Scan(&n)
	return n, err
}
