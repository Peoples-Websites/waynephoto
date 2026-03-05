/**
 * galleryData.ts
 *
 * This module defines the structure of the gallery content
 * and provides a helper to load it from a YAML file.
 *
 * Responsibilities:
 * - Define the schema for collections and images
 * - Load and parse gallery.yaml
 */

import path from 'path';
import { promises as fs } from 'fs';
import * as yaml from 'js-yaml';


// GalleryData: the structure of gallery.yaml
export interface GalleryData {
  collections: Collection[];
  images: GalleryImage[];
}

// Collection: details of a named collection of images (e.g. Travel)
export interface Collection {
	id: string;
	name: string;
}

// GalleryImage: a single image entry
export interface GalleryImage {
  path: string;           // relative path to the image file
  date: string;           // date photograph was taken in readable format, for display
  location: string;       // location where photograph was taken, for display
  title: string;          // title (also used as alt text)
  description: string;    // photographer's comments about the image
  collections: string[];  // an array of the collection IDs that the image belongs to
  exif?: ImageExif;       // not implemented
}

// ImageExif: optional EXIF metadata for an image
export interface ImageExif {
	focalLength?: number;
	iso?: number;
	fNumber?: number;
	shutterSpeed?: number;
	captureDate?: Date;
	model?: string;
	lensModel?: string;
}


/**
 * Loads and parses gallery.yaml from disk. Does not validate
 * image paths or collections — only returns the raw structured data.
 */
export const loadGallery = async (galleryPath: string): Promise<GalleryData> => {
	const yamlPath = path.resolve(process.cwd(), galleryPath);
	const content = await fs.readFile(yamlPath, 'utf8');
	return yaml.load(content) as GalleryData;
};
