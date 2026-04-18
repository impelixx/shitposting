// Package search provides a Meilisearch client wrapper.
package search

import (
	"fmt"

	"github.com/meilisearch/meilisearch-go"
)

// Client wraps a Meilisearch index for blog posts.
type Client struct {
	index meilisearch.IndexManager
}

// PostDocument is the shape of documents indexed in Meilisearch.
type PostDocument struct {
	ID      string   `json:"id"`
	Title   string   `json:"title"`
	Excerpt string   `json:"excerpt"`
	Body    string   `json:"body"`
	Slug    string   `json:"slug"`
	Tags    []string `json:"tags"`
}

// NewClient creates a Meilisearch client and configures the "posts" index.
// Sets "tags" as filterable attribute.
func NewClient(url, key string) *Client {
	svc := meilisearch.New(url, meilisearch.WithAPIKey(key))

	index := svc.Index("posts")

	filterableAttrs := []interface{}{"tags"}
	_, _ = index.UpdateFilterableAttributes(&filterableAttrs)

	return &Client{index: index}
}

// IndexPost adds or updates a post document in the index.
func (c *Client) IndexPost(doc PostDocument) error {
	docs := []PostDocument{doc}
	_, err := c.index.AddDocuments(docs, nil)
	if err != nil {
		return fmt.Errorf("indexing post: %w", err)
	}
	return nil
}

// DeletePost removes a post document from the index by ID.
func (c *Client) DeletePost(id string) error {
	_, err := c.index.DeleteDocument(id, nil)
	if err != nil {
		return fmt.Errorf("deleting post from index: %w", err)
	}
	return nil
}

// Search performs a full-text search, returning up to 20 results.
func (c *Client) Search(query string) ([]PostDocument, error) {
	resp, err := c.index.Search(query, &meilisearch.SearchRequest{
		Limit: 20,
	})
	if err != nil {
		return nil, fmt.Errorf("searching posts: %w", err)
	}

	results := make([]PostDocument, 0, len(resp.Hits))
	for _, hit := range resp.Hits {
		var doc PostDocument
		if err := hit.DecodeInto(&doc); err != nil {
			return nil, fmt.Errorf("decoding search hit: %w", err)
		}
		results = append(results, doc)
	}

	return results, nil
}
