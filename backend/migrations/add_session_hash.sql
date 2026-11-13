-- ============================================================
-- Migration: Tambah kolom session_hash ke tabel users
-- ============================================================
-- Jalankan query ini di MySQL untuk menambahkan kolom session_hash
-- yang digunakan untuk sesi login unik per user.
--
-- Cara menjalankan:
--   mysql -u root unus < backend/migrations/add_session_hash.sql
--
-- Atau jalankan langsung di phpMyAdmin / MySQL CLI:
-- ============================================================

ALTER TABLE users
ADD COLUMN session_hash VARCHAR(64) DEFAULT NULL AFTER role;

-- Index untuk pencarian cepat berdasarkan session_hash
CREATE INDEX idx_users_session_hash ON users (session_hash);
