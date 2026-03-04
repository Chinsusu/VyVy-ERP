CREATE TABLE IF NOT EXISTS po_documents (
    id           BIGSERIAL PRIMARY KEY,
    po_id        BIGINT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    file_name    VARCHAR(500) NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    file_size    BIGINT NOT NULL,
    mime_type    VARCHAR(100) NOT NULL,
    uploaded_by  BIGINT REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_po_documents_po_id ON po_documents(po_id);
