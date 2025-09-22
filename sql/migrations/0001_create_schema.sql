-- 0001_create_schema.sql
-- Ensure base schema and extensions for Sociometria project

create schema if not exists sociometria;

-- Extensions needed for UUID generation and case-insensitive text comparisons
create extension if not exists "pgcrypto" with schema public;
create extension if not exists "uuid-ossp" with schema public;
create extension if not exists "citext" with schema public;
