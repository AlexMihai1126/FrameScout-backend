# FrameScout – Backend API

This repository contains the production REST API for the **FrameScout** ecosystem. It handles multi-criteria location searches, user-authenticated favorite graphs, multipart media processing, and spatial asset management.

---

## 🚀 How to Start (Docker Ecosystem)

The entire environment (Node.js API + MongoDB Database Container) is fully dockerized and ready for local development.

### Prerequisites

- Docker
- Docker Compose
- `.env` configuration file
- Firebase service account key placed at:

```text
./serviceAccountKey.json
```

### Build the containers

```bash
docker compose build
```

### Start the application stack

```bash
docker compose up
```

This will start:

- FrameScout API (Node.js + Express)
- MongoDB Database Container

### Stop the stack

```bash
docker compose down
```

### Reset database persistence

To completely remove persisted MongoDB data:

```bash
docker compose down -v
```

---

## 🛠️ Technology Stack & Architecture

### Runtime Environment

- Node.js
- TypeScript
- Alpine-based Docker image

### Backend Framework

- Express.js
- Async request processing pipeline

### Database Layer

- MongoDB 8.0
- Mongoose ODM

### Authentication

- Firebase Admin SDK
- JWT / Firebase ID Token verification

### Media Processing

- Multer (memory storage)
- Multi-resolution image generation
- Local asset storage
- Maximum upload size: 20 MB

Generated image variants:

- Original
- Preview
- High Resolution Preview

---

## 💾 Database Schemas (MongoDB)

The application uses three main collections inside the `framescout` database.

### 1. photo_spots

Stores photography location metadata.

#### Search Features

A text-search system is implemented using:

- MongoDB indexes
- Normalized fields
- Regex-based filtering

A `pre("save")` hook automatically generates:

- lowercase variants
- diacritic-insensitive values

for efficient searching.

#### Main Fields

```text
title
description
city
county
country
```

#### Spatial Fields

```text
latitude
longitude
mapsUrl
```

#### File Integrity Fields

```text
sha256
mimeType
```

The `sha256` hash is unique and prevents duplicate image uploads.

#### Relationships

```text
tags -> references Tag documents
```

---

### 2. tags

Stores photo spot categories.

#### Fields

```text
name
displayName
```

Example:

```text
name: landscape
displayName: Landscape
```

Rules:

- unique
- lowercase
- slug formatted
- alphanumeric with dash support

---

### 3. favorite_spots

Stores user favorite mappings.

#### Compound Unique Index

```javascript
{
  userId: 1,
  photoSpotId: 1
}
```

Prevents duplicate favorites caused by repeated user actions.

---

## 🛣️ API Endpoints

### 🌍 Public Endpoints

#### GET /api/photos

Returns a paginated collection of photography spots.

##### Supported Query Parameters

| Parameter | Description |
|------------|------------|
| page | Pagination page |
| limit | Items per page |
| q | Search text |
| tagIds | Filter by tags |
| matchAllTags | Use `$all` instead of `$in` |
| latestFirst | Sort by creation date |
| mine | Return only authenticated user's uploads |

##### Search Logic

The search term is normalized and matched against:

- title
- city
- county
- country

using regex-based MongoDB queries.

---

#### GET /api/photos/:id

Returns complete details for a specific photography spot.

Features:

- Tag population
- Full image URLs
- Thumbnail URLs
- Metadata enrichment

---

#### GET /api/all-tags

Returns all available category tags sorted alphabetically.

---

## 🔐 Authenticated Endpoints

All routes below require a valid Firebase ID Token.

Authentication is enforced through the `checkAuth` middleware.

---

### POST /api/photos

Creates a new photography spot.

#### Responsibilities

- Receives Multipart/Form-Data
- Validates tag IDs
- Generates SHA-256 checksum
- Detects duplicate uploads
- Creates optimized image variants
- Stores metadata
- Associates the upload with the authenticated user

---

### DELETE /api/photos/:photoSpotId

Deletes a photography spot.

#### Security Check

```text
uploadedByUserId === authenticatedUserId
```

#### Operations

- Remove metadata record
- Delete favorite mappings
- Delete image files from storage
- Remove generated previews

---

### POST /api/favorites/:photoSpotId

Adds a photo spot to the user's favorites.

Uses atomic MongoDB upsert logic:

```javascript
$setOnInsert
```

to prevent duplicates.

---

### DELETE /api/favorites/:photoSpotId

Removes a photo spot from favorites.

---

### GET /api/favorites

Returns a paginated list of the authenticated user's favorite spots.

Sorting:

```text
Newest favorites first
```

---

## ⚡ Admin Endpoints

### POST /admin/tags

Bulk category ingestion endpoint.

#### Features

- Accepts single objects
- Accepts arrays
- Sanitizes input
- Generates normalized values
- Ignores duplicate entries

Implementation:

```javascript
insertMany({
  ordered: false
})
```

This allows fast bulk insertion while continuing execution when duplicate key errors occur.

---

## 📦 Core Features

- Firebase Authentication
- MongoDB Text Search
- Multi-Criteria Filtering
- Pagination
- Favorite Management
- Duplicate Image Detection
- SHA-256 File Integrity Validation
- Multi-Resolution Image Generation
- Local Asset Storage
- Ownership-Based Authorization
- Dockerized Development Environment
- Admin Bulk Tag Management