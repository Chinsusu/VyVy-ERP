-- Create production_tasks table
CREATE TABLE IF NOT EXISTS production_tasks (
    id BIGSERIAL PRIMARY KEY,
    material_request_id BIGINT NOT NULL,

    -- Task info
    category VARCHAR(50) NOT NULL DEFAULT 'other',
    task_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Assignment
    assigned_to BIGINT,

    -- Timeline
    planned_start DATE,
    planned_end DATE,
    actual_start DATE,
    actual_end DATE,

    -- Progress
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    progress_percent INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,

    -- Notes
    notes TEXT,

    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by BIGINT,

    FOREIGN KEY (material_request_id) REFERENCES material_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE INDEX idx_production_tasks_mr ON production_tasks(material_request_id);
CREATE INDEX idx_production_tasks_assigned ON production_tasks(assigned_to);
CREATE INDEX idx_production_tasks_status ON production_tasks(status);
