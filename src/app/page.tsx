"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SHAPES = {
  circle: "Circle",
  square: "Square",
  rounded: "Rounded Square",
  triangle: "Triangle",
  triangleFlipped: "Triangle (Flipped)",
  diamond: "Diamond",
  hexagon: "Hexagon",
  octagon: "Octagon",
  pentagon: "Pentagon",
  heart: "Heart",
  star: "Star",
  plus: "Plus",
  cross: "Cross (X)"
};

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#64748b", // slate
  "#000000", // black
];

const DEFAULT_TITLE = "Page Icon Editor";
const DEFAULT_SHAPE = "circle";
const DEFAULT_COLOR = "#3b82f6";
const DEFAULT_CUSTOM_COLOR = "";

function generateFavicon(shape: string, color: string): string {
  const size = 32;
  const center = size / 2;

  let path = "";

  switch (shape) {
    case "circle":
      path = `<circle cx="${center}" cy="${center}" r="${center - 2}" fill="${color}"/>`;
      break;
    case "square":
      path = `<rect x="2" y="2" width="${size - 4}" height="${size - 4}" fill="${color}"/>`;
      break;
    case "rounded":
      path = `<rect x="2" y="2" width="${size - 4}" height="${size - 4}" rx="6" fill="${color}"/>`;
      break;
    case "triangle":
      path = `<polygon points="${center},4 ${size - 4},${size - 4} 4,${size - 4}" fill="${color}"/>`;
      break;
    case "triangleFlipped":
      path = `<polygon points="${center},${size - 4} ${size - 4},4 4,4" fill="${color}"/>`;
      break;
    case "diamond":
      path = `<polygon points="${center},4 ${size - 4},${center} ${center},${size - 4} 4,${center}" fill="${color}"/>`;
      break;
    case "hexagon": {
      const hexPoints = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const x = center + (center - 3) * Math.cos(angle);
        const y = center + (center - 3) * Math.sin(angle);
        hexPoints.push(`${x},${y}`);
      }
      path = `<polygon points="${hexPoints.join(' ')}" fill="${color}"/>`;
      break;
    }
    case "octagon": {
      const octPoints = [];
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i - Math.PI / 2;
        const x = center + (center - 3) * Math.cos(angle);
        const y = center + (center - 3) * Math.sin(angle);
        octPoints.push(`${x},${y}`);
      }
      path = `<polygon points="${octPoints.join(' ')}" fill="${color}"/>`;
      break;
    }
    case "pentagon": {
      const pentPoints = [];
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const x = center + (center - 3) * Math.cos(angle);
        const y = center + (center - 3) * Math.sin(angle);
        pentPoints.push(`${x},${y}`);
      }
      path = `<polygon points="${pentPoints.join(' ')}" fill="${color}"/>`;
      break;
    }
    case "heart":
      path = `<path d="M${center},${size - 6} c-${center - 4},-${center} -${center - 4},-${center - 8} 0,-${center - 8} s${center - 4},${center - 8} 0,${center - 8} c${center - 4},0 ${center - 4},${center - 8} 0,${center - 8}" fill="${color}"/>`;
      break;
    case "star": {
      const outerRadius = center - 3;
      const innerRadius = outerRadius * 0.4;
      const starPoints = [];
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        starPoints.push(`${x},${y}`);
      }
      path = `<polygon points="${starPoints.join(' ')}" fill="${color}"/>`;
      break;
    }
    case "plus": {
      const thickness = 8;
      const length = size - 8;
      const offset = (size - length) / 2;
      const midPoint = size / 2 - thickness / 2;
      path = `<path d="M${midPoint},${offset} h${thickness} v${midPoint - offset} h${midPoint - offset} v${thickness} h-${midPoint - offset} v${midPoint - offset} h-${thickness} v-${midPoint - offset} h-${midPoint - offset} v-${thickness} h${midPoint - offset} Z" fill="${color}"/>`;
      break;
    }
    case "cross": {
      const thickness = 6;
      const inset = 5;
      path = `<path d="M${inset},${inset} L${size - inset},${size - inset} M${size - inset},${inset} L${inset},${size - inset}" stroke="${color}" stroke-width="${thickness}" stroke-linecap="round"/>`;
      break;
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${path}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// URL parameter utilities
function getUrlParams() {
  if (typeof window === 'undefined') {
    return {
      title: DEFAULT_TITLE,
      shape: DEFAULT_SHAPE,
      color: DEFAULT_COLOR,
      customColor: DEFAULT_CUSTOM_COLOR
    };
  }
  const params = new URLSearchParams(window.location.search);
  return {
    title: params.get('title') || DEFAULT_TITLE,
    shape: params.get('shape') || DEFAULT_SHAPE,
    color: params.get('color') || DEFAULT_COLOR,
    customColor: params.get('customColor') || DEFAULT_CUSTOM_COLOR
  };
}

function updateUrl(title: string, shape: string, color: string, customColor: string) {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams();

  // Only add non-default values to keep URL clean
  if (title !== DEFAULT_TITLE) params.set('title', title);
  if (shape !== DEFAULT_SHAPE) params.set('shape', shape);
  if (color !== DEFAULT_COLOR) params.set('color', color);
  if (customColor) params.set('customColor', customColor);

  const newUrl = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;

  window.history.replaceState({}, '', newUrl);
}

export default function Home() {
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [shape, setShape] = useState(DEFAULT_SHAPE);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [customColor, setCustomColor] = useState(DEFAULT_CUSTOM_COLOR);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentColor = customColor || color;



  // Read query params after mount so hydration matches the static export.
  useEffect(() => {
    const params = getUrlParams();
    document.title = params.title;
    setTitle(params.title);
    setShape(params.shape);
    setColor(params.color);
    setCustomColor(params.customColor);
    setIsLoaded(true);
  }, []);

  // Update URL whenever state changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      updateUrl(title, shape, color, customColor);
    }
  }, [title, shape, color, customColor, isLoaded]);

  // Update document title whenever title state changes
  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    // Update favicon
    const favicon = generateFavicon(shape, currentColor);

    // Remove existing favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = favicon;
    document.head.appendChild(link);
  }, [shape, currentColor]);

  const handleReset = () => {
    setTitle(DEFAULT_TITLE);
    setShape(DEFAULT_SHAPE);
    setColor(DEFAULT_COLOR);
    setCustomColor(DEFAULT_CUSTOM_COLOR);
  };

  const copyCurrentUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Page Icon & Title Editor</h1>
          <p className="text-muted-foreground">Customize your page title and create a dynamic favicon</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Customize Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Page Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter page title..."
                  className="w-full"
                />
              </div>

              {/* Shape Selection */}
              <div className="space-y-2">
                <Label>Icon Shape</Label>
                <Select value={shape} onValueChange={setShape}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4"
                        style={{
                          backgroundImage: `url("${generateFavicon(shape, currentColor)}")`,
                          backgroundSize: "contain",
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "center"
                        }}
                      />
                      <span>{SHAPES[shape as keyof typeof SHAPES]}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SHAPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4"
                            style={{
                              backgroundImage: `url("${generateFavicon(key, currentColor)}")`,
                              backgroundSize: "contain",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center"
                            }}
                          />
                          <span>{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Selection */}
              <div className="space-y-3">
                <Label>Icon Color</Label>

                {/* Preset Colors */}
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_COLORS.map((presetColor) => (
                    <button
                      key={presetColor}
                      className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                        color === presetColor && !customColor
                          ? "border-primary ring-2 ring-primary/50"
                          : "border-border hover:border-primary/50"
                      }`}
                      style={{ backgroundColor: presetColor }}
                      onClick={() => {
                        setColor(presetColor);
                        setCustomColor("");
                      }}
                      title={presetColor}
                    />
                  ))}
                </div>

                {/* Custom Color */}
                <div className="space-y-2">
                  <Label htmlFor="custom-color" className="text-sm text-muted-foreground">
                    Or choose custom color:
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="custom-color"
                      type="color"
                      value={customColor || color}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full"
                >
                  Reset to Default
                </Button>

                <Button
                  onClick={copyCurrentUrl}
                  className="w-full"
                  variant="secondary"
                >
                  Copy Shareable Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Large Icon Preview */}
              <div className="flex flex-col items-center space-y-4">
                <div className="text-center">
                  <Label className="text-sm text-muted-foreground">Icon Preview</Label>
                </div>
                <div
                  className="w-24 h-24 border border-border rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "hsl(var(--card))" }}
                >
                  <div
                    className="w-16 h-16"
                    style={{
                      backgroundImage: `url("${generateFavicon(shape, currentColor)}")`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center"
                    }}
                  />
                </div>
              </div>

              {/* Browser Tab Preview */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Browser Tab Preview</Label>
                <div className="border border-border rounded-lg p-3 bg-muted/30">
                  <div className="flex items-center space-x-2 text-sm">
                    <div
                      className="w-4 h-4"
                      style={{
                        backgroundImage: `url("${generateFavicon(shape, currentColor)}")`,
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center"
                      }}
                    />
                    <span className="truncate max-w-[200px]">{title}</span>
                  </div>
                </div>
              </div>

              {/* Shareable URL Preview */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Shareable URL</Label>
                <div className="border border-border rounded-lg p-3 bg-muted/30">
                  <div className="text-xs text-muted-foreground break-all">
                    {isLoaded && typeof window !== 'undefined' ? window.location.href : 'Loading...'}
                  </div>
                </div>
              </div>

              {/* Current Settings */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Current Settings</Label>
                <div className="text-sm space-y-1">
                  <div><strong>Shape:</strong> {SHAPES[shape as keyof typeof SHAPES]}</div>
                  <div><strong>Color:</strong> {currentColor}</div>
                  <div><strong>Title:</strong> {title}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Changes are applied immediately and saved to the URL. Share the link to let others see your custom page!</p>
        </div>
      </div>
    </div>
  );
}
