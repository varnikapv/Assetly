import type { AssetCollection } from "../types";
import { classifyImages } from "./imageClassifier";

/**
 * Accepts raw image URL strings from the page and returns them classified
 * into five categories using deterministic heuristics.
 */
export function analyzeImages(rawImages: string[]): AssetCollection {
  return classifyImages(rawImages);
}
