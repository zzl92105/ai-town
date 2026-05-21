import { useEffect, useRef } from "react";
import townMapTileset from "../assets/ai/town-map.png";

const MAP_WIDTH = 1600;
const MAP_HEIGHT = 2653;
const TILE_SIZE = 256;

type Tile = {
  sourceX: number;
  sourceY: number;
  width: number;
  height: number;
};

const tileMap = createTileMap();

export function TownMapEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = new Image();
    image.src = townMapTileset;
    image.onload = () => {
      if (cancelled) return;
      renderTileMap(canvas, image);
    };

    return () => {
      cancelled = true;
    };
  }, []);

  return <canvas ref={canvasRef} className="town-map-engine" aria-label="AI 小镇地图" />;
}

function createTileMap() {
  const tiles: Tile[] = [];

  for (let sourceY = 0; sourceY < MAP_HEIGHT; sourceY += TILE_SIZE) {
    for (let sourceX = 0; sourceX < MAP_WIDTH; sourceX += TILE_SIZE) {
      tiles.push({
        sourceX,
        sourceY,
        width: Math.min(TILE_SIZE, MAP_WIDTH - sourceX),
        height: Math.min(TILE_SIZE, MAP_HEIGHT - sourceY),
      });
    }
  }

  return tiles;
}

function renderTileMap(canvas: HTMLCanvasElement, image: HTMLImageElement) {
  const pixelRatio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = Math.round(MAP_WIDTH * pixelRatio);
  canvas.height = Math.round(MAP_HEIGHT * pixelRatio);

  const context = canvas.getContext("2d");
  if (!context) return;

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  drawLayerBackground(context);
  drawLayerTiles(context, image);
  drawLayerVignette(context);
}

function drawLayerBackground(context: CanvasRenderingContext2D) {
  context.fillStyle = "#0a0f0e";
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
}

function drawLayerTiles(context: CanvasRenderingContext2D, image: HTMLImageElement) {
  for (const tile of tileMap) {
    context.drawImage(
      image,
      tile.sourceX,
      tile.sourceY,
      tile.width,
      tile.height,
      tile.sourceX,
      tile.sourceY,
      tile.width,
      tile.height,
    );
  }
}

function drawLayerVignette(context: CanvasRenderingContext2D) {
  const vignette = context.createRadialGradient(
    MAP_WIDTH / 2,
    MAP_HEIGHT * 0.42,
    MAP_WIDTH * 0.12,
    MAP_WIDTH / 2,
    MAP_HEIGHT * 0.42,
    MAP_HEIGHT * 0.62,
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(0.72, "rgba(0, 0, 0, 0.06)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.18)");

  context.fillStyle = vignette;
  context.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
}
