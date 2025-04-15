
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCVContext } from "@/contexts/CVContext";
import { ChevronUp, Minus, Move, Palette } from "lucide-react";
import { CVTheme } from "@/types/cv";

export function ThemePalette() {
  const { cvTheme, updateTheme } = useCVContext();
  const [isOpen, setIsOpen] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const paletteRef = useRef<HTMLDivElement>(null);

  // Predefined colors
  const presetColors = [
    "#0170c4", // blue
    "#10b981", // green
    "#ef4444", // red
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#64748b", // slate
    "#000000", // black
  ];

  // Theme options
  const fontOptions = [
    { value: "roboto", label: "Roboto (Sans Serif)" },
    { value: "playfair", label: "Playfair (Serif)" },
  ];

  const photoPositionOptions = [
    { value: "top", label: "En Haut" },
    { value: "left", label: "À Gauche" },
    { value: "right", label: "À Droite" },
  ];

  const photoSizeOptions = [
    { value: "small", label: "Petite" },
    { value: "medium", label: "Moyenne" },
    { value: "large", label: "Grande" },
  ];

  const titleStyleOptions = [
    { value: "plain", label: "Simple" },
    { value: "underline", label: "Soulignement" },
    { value: "background", label: "Arrière-plan" },
    { value: "border", label: "Bordure" },
  ];

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target instanceof HTMLElement && e.target.classList.contains('drag-handle')) {
      setIsDragging(true);
      
      const rect = paletteRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Check boundary constraints
      const maxX = window.innerWidth - (paletteRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (paletteRef.current?.offsetHeight || 0);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={paletteRef}
      className="fixed shadow-md rounded-lg bg-white border z-50 overflow-hidden flex flex-col transition-all duration-300"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '280px',
        height: isOpen ? 'auto' : '40px',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header / Drag Handle */}
      <div className="bg-primary/90 text-white p-2 flex items-center justify-between cursor-move drag-handle">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          <span className="text-sm font-medium">Personnalisation</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" 
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/20"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <Minus className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
          <Move className="h-4 w-4 opacity-50" />
        </div>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-4 space-y-4 max-h-[calc(100vh-150px)] overflow-y-auto">
          {/* Colors */}
          <div className="space-y-2">
            <Label>Couleur principale</Label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  className="h-6 w-6 rounded-full border overflow-hidden focus:outline-none focus:ring-2 ring-offset-2"
                  style={{ 
                    backgroundColor: color,
                    boxShadow: cvTheme.primaryColor === color ? "0 0 0 2px white, 0 0 0 4px " + color : "none" 
                  }}
                  onClick={() => updateTheme('primaryColor', color)}
                />
              ))}

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="h-6 w-6 rounded-full border overflow-hidden flex items-center justify-center bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary ring-offset-2"
                  >
                    +
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-3">
                  <div className="space-y-2">
                    <Label htmlFor="custom-color">Couleur personnalisée</Label>
                    <input
                      id="custom-color"
                      type="color"
                      value={cvTheme.primaryColor}
                      onChange={(e) => updateTheme('primaryColor', e.target.value)}
                      className="w-full h-8"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Couleur d'arrière-plan</Label>
            <input
              type="color"
              value={cvTheme.backgroundColor}
              onChange={(e) => updateTheme('backgroundColor', e.target.value)}
              className="w-full h-8"
            />
          </div>

          {/* Fonts */}
          <div className="space-y-2">
            <Label htmlFor="title-font">Police des titres</Label>
            <Select
              value={cvTheme.titleFont}
              onValueChange={(value) => updateTheme('titleFont', value)}
            >
              <SelectTrigger id="title-font">
                <SelectValue placeholder="Choisir une police" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="text-font">Police du texte principal</Label>
            <Select
              value={cvTheme.textFont}
              onValueChange={(value) => updateTheme('textFont', value)}
            >
              <SelectTrigger id="text-font">
                <SelectValue placeholder="Choisir une police" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Photo Options */}
          <div className="space-y-2">
            <Label htmlFor="photo-position">Position de la photo</Label>
            <Select
              value={cvTheme.photoPosition}
              onValueChange={(value: "top" | "left" | "right") => updateTheme('photoPosition', value)}
            >
              <SelectTrigger id="photo-position">
                <SelectValue placeholder="Choisir une position" />
              </SelectTrigger>
              <SelectContent>
                {photoPositionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo-size">Taille de la photo</Label>
            <Select
              value={cvTheme.photoSize}
              onValueChange={(value: "small" | "medium" | "large") => updateTheme('photoSize', value)}
            >
              <SelectTrigger id="photo-size">
                <SelectValue placeholder="Choisir une taille" />
              </SelectTrigger>
              <SelectContent>
                {photoSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title-style">Style des titres</Label>
            <Select
              value={cvTheme.titleStyle}
              onValueChange={(value: "plain" | "underline" | "background" | "border") => updateTheme('titleStyle', value)}
            >
              <SelectTrigger id="title-style">
                <SelectValue placeholder="Choisir un style" />
              </SelectTrigger>
              <SelectContent>
                {titleStyleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
