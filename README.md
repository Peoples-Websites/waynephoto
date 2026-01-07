# Gallery System – Architecture & Rationale

This document explains how the gallery system in this Astro project is structured, **why it is structured this way**, and how the different pieces fit together. It is written primarily for future maintainers (including Future Me).

---

## High-level goals

The gallery system is designed to:

* Keep **content separate from presentation**
* Allow galleries and images to be defined in a **human-editable YAML file**
* Use **Astro’s static image pipeline** for performance and optimisation
* Make future enhancements (EXIF data, sorting, new galleries) easy to add

---

## Big-picture data flow

```
gallery.yaml
   ↓
(galleryData.ts)
   ↓
(imageStore.ts)
   ↓
(components / pages)
```

In words:

1. **gallery.yaml** defines what images exist and how they are grouped
2. **galleryData.ts** loads and types that data
3. **imageStore.ts** resolves images to Astro assets and prepares them for rendering
4. Components such as **PhotoGrid.astro** render the images and attach behaviour (e.g. GLightbox)

---

## Content layer: `gallery.yaml`

The YAML file is the *single source of truth* for gallery content.

It defines:

* Which collections exist (e.g. `featured`, `landscapes`)
* Which images exist
* The metadata for each image (title, description, collections)

This allows non-code changes (adding images, reassigning collections) without touching TypeScript or Astro components.

---

## Content schema & loading: `galleryData.ts`

### Purpose

`galleryData.ts` is responsible for **content structure**, not rendering.

It:

* Defines TypeScript interfaces that describe the shape of the YAML data
* Loads and parses the YAML file from disk

It deliberately **does not**:

* Import images
* Know about Astro components
* Know about layout or presentation

### Key types

* `GalleryData` – the full YAML structure
* `Collection` – a named group of images
* `GalleryImage` – a single image entry from YAML
* `Meta` – title, description, and collection membership
* `ImageExif` – optional EXIF metadata (future use)

### Why this separation matters

By keeping this layer pure:

* The YAML schema is easy to reason about
* Content can be validated independently of rendering
* The system remains flexible if the frontend changes

---

## Integration layer: `imageStore.ts`

### Purpose

`imageStore.ts` is the **bridge** between content and rendering.

It takes:

* YAML-defined image entries
* Astro’s static image imports

…and produces:

* Fully resolved, render-ready image objects

### Responsibilities

* Load gallery data via `galleryData.ts`
* Validate that images reference valid collections
* Filter images by collection
* Sort images (optionally)
* Resolve image paths to Astro `ImageMetadata`

This file is the **single source of truth for renderable images**.

---

## Image importing strategy

Astro requires images to be statically discoverable at build time.

This project uses:

```ts
import.meta.glob('/src/**/*.{jpg,jpeg,png,gif}', { eager: true })
```

This eagerly imports all images under `/src`, allowing:

* Astro image optimisation
* Type-safe access to width, height, and format
* Reliable build-time errors for missing images

YAML image paths must correspond exactly to these imported paths.

---

## Built-in collections

Some collections are **editorial**, not content-driven.

Example:

* `featured` – used for homepage highlights

These are defined in code (not YAML) so that they can be changed without modifying content files.

---

## EXIF data (future enhancement)

The system is designed to support EXIF metadata such as:

* Capture date
* Camera model
* Lens
* Aperture / ISO

At present:

* EXIF data is optional
* EXIF parsing is not implemented
* Sorting by EXIF date only works if data is manually provided

The types exist to support future enhancements without restructuring the system.

---

## Presentation layer: components

### `PhotoGrid.astro`

Responsible only for:

* Laying out images
* Rendering thumbnails
* Providing markup for GLightbox

It does **not**:

* Load data
* Filter images
* Know about collections or YAML

This keeps presentation clean and reusable.

---

## GLightbox integration

GLightbox is used to provide a lightbox view for images.

Key points:

* Markup is provided via `.glightbox` anchors
* Initialisation occurs on the client
* Navigation icons are provided by GLightbox itself

Styling is intentionally minimal to avoid fighting library internals.

---

## Why this architecture works well

* Content is editable without touching code
* Rendering logic is clean and predictable
* Astro’s strengths (static optimisation) are fully used
* The system scales naturally as galleries grow

This structure prioritises **clarity over cleverness**.

---

## Notes for future maintainers

If something feels redundant:

1. Check whether it is **future-facing** (EXIF, sorting)
2. Check whether it belongs to a different layer
3. Prefer deleting unused code over keeping speculative abstractions

When in doubt:

> Make the data flow obvious, even if it means writing it down twice.

---

*Last updated after gallery system cleanup and documentation pass.*
