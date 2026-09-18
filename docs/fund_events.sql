CREATE TABLE fund_events (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  fund_type ENUM('retirement', 'benefits', 'admin') NOT NULL,
  event VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  event_date DATE NOT NULL,
  status ENUM('Recorded', 'Approved', 'Cancelled') NOT NULL DEFAULT 'Recorded',
    created_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_fund_events_type_date (fund_type, event_date),
    KEY idx_fund_events_status (status),
    KEY idx_fund_events_created_by (created_by)
);
