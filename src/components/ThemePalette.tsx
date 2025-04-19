
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCVContext } from "@/contexts/CVContext";
import { ChevronUp, Minus, Move, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export function ThemePalette() {
  const { cvTheme, updateTheme } = useCVContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
    { value: "merriweather", label: "Merriweather (Serif)" },
    { value: "montserrat", label: "Montserrat (Sans Serif)" },
    { value: "lato", label: "Lato (Sans Serif)" },
    { value: "opensans", label: "Open Sans (Sans Serif)" },
    { value: "source", label: "Source Sans (Sans Serif)" },
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

  // Fixed position for mobile devices
  useEffect(() => {
    if (isMobile) {
      setPosition({ x: 10, y: window.innerHeight - 350 });
    }
  }, [isMobile]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (isMobile) return; // Disable dragging on mobile
    
    if (e.target instanceof HTMLElement && 
        (e.target.classList.contains('drag-handle') || 
         e.target.closest('.drag-handle'))) {
      setIsDragging(true);
      
      const rect = paletteRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      
      // Prevent text selection during drag
      e.preventDefault();
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

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isMobile) return; // Disable dragging on mobile
    
    if (e.target instanceof HTMLElement && 
        (e.target.classList.contains('drag-handle') || 
         e.target.closest('.drag-handle'))) {
      setIsDragging(true);
      
      const touch = e.touches[0];
      const rect = paletteRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top,
        });
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      const newX = touch.clientX - dragOffset.x;
      const newY = touch.clientY - dragOffset.y;
      
      // Check boundary constraints
      const maxX = window.innerWidth - (paletteRef.current?.offsetWidth || 0);
      const maxY = window.innerHeight - (paletteRef.current?.offsetHeight || 0);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
      
      // Prevent scrolling while dragging
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  // Ensure type safety when updating theme properties
  const handleUpdateTitleFont = (value: string) => {
    updateTheme("titleFont", value);
    console.log("Updated title font to:", value);
    
    if (!isMobile) {
      toast({
        title: "Style mis à jour",
        description: `Police des titres changée.`,
      });
    }
  };

  const handleUpdateTextFont = (value: string) => {
    updateTheme("textFont", value);
    console.log("Updated text font to:", value);
    
    if (!isMobile) {
      toast({
        title: "Style mis à jour",
        description: `Police du texte changée.`,
      });
    }
  };

  const handleUpdatePhotoPosition = (value: string) => {
    if (value === "top" || value === "left" || value === "right") {
      updateTheme("photoPosition", value);
      console.log("Updated photo position to:", value);
      
      if (!isMobile) {
        toast({
          title: "Style mis à jour",
          description: `Position de la photo changée.`,
        });
      }
    }
  };

  const handleUpdatePhotoSize = (value: string) => {
    if (value === "small" || value === "medium" || value === "large") {
      updateTheme("photoSize", value);
      console.log("Updated photo size to:", value);
      
      if (!isMobile) {
        toast({
          title: "Style mis à jour",
          description: `Taille de la photo changée.`,
        });
      }
    }
  };

  const handleUpdateTitleStyle = (value: string) => {
    if (value === "plain" || value === "underline" || value === "background" || value === "border") {
      updateTheme("titleStyle", value);
      console.log("Updated title style to:", value);
      
      if (!isMobile) {
        toast({
          title: "Style mis à jour",
          description: `Style des titres changé.`,
        });
      }
    }
  };

  const handleColorChange = (color: string) => {
    updateTheme("primaryColor", color);
    console.log("Updated primary color to:", color);
    
    if (!isMobile) {
      toast({
        title: "Couleur mise à jour",
        description: "La couleur principale a été changée.",
      });
    }
  };

  const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    updateTheme("backgroundColor", color);
    console.log("Updated background color to:", color);
    
    if (!isMobile) {
      toast({
        title: "Couleur mise à jour",
        description: "La couleur d'arrière-plan a été changée.",
      });
    }
  };

  return (
    <div
      ref={paletteRef}
      className="fixed shadow-md rounded-lg bg-white border z-50 overflow-hidden flex flex-col transition-all duration-300"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '280px',
        height: isOpen ? 'auto' : '40px',
        maxHeight: isMobile ? '350px' : 'none',
        touchAction: isDragging ? 'none' : 'auto',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Header / Drag Handle */}
      <div className="bg-primary/90 text-white p-2 flex items-center justify-between cursor-move drag-handle select-none">
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
        <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: isMobile ? '290px' : 'calc(100vh - 150px)' }}>
          {/* Colors */}
          <div className="space-y-2">
            <Label>Couleur principale</Label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  className="h-6 w-6 rounded-full border overflow-hidden focus:outline-none focus:ring-2 ring-offset-2 touch-target"
                  style={{ 
                    backgroundColor: color,
                    boxShadow: cvTheme.primaryColor === color ? "0 0 0 2px white, 0 0 0 4px " + color : "none" 
                  }}
                  onClick={() => handleColorChange(color)}
                  aria-label={`Couleur ${color}`}
                />
              ))}

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="h-6 w-6 rounded-full border overflow-hidden flex items-center justify-center bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary ring-offset-2 touch-target"
                    aria-label="Couleur personnalisée"
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
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-full h-8 touch-target"
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
              onChange={handleBackgroundColorChange}
              className="w-full h-8 touch-target"
            />
          </div>

          {/* Fonts */}
          <div className="space-y-2">
            <Label htmlFor="title-font">Police des titres</Label>
            <Select
              value={cvTheme.titleFont}
              onValueChange={handleUpdateTitleFont}
            >
              <SelectTrigger id="title-font" className="touch-target">
                <SelectValue placeholder="Choisir une police" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value} className="touch-target">
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
              onValueChange={handleUpdateTextFont}
            >
              <SelectTrigger id="text-font" className="touch-target">
                <SelectValue placeholder="Choisir une police" />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value} className="touch-target">
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
              onValueChange={handleUpdatePhotoPosition}
            >
              <SelectTrigger id="photo-position" className="touch-target">
                <SelectValue placeholder="Choisir une position" />
              </SelectTrigger>
              <SelectContent>
                {photoPositionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="touch-target">
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
              onValueChange={handleUpdatePhotoSize}
            >
              <SelectTrigger id="photo-size" className="touch-target">
                <SelectValue placeholder="Choisir une taille" />
              </SelectTrigger>
              <SelectContent>
                {photoSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="touch-target">
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
              onValueChange={handleUpdateTitleStyle}
            >
              <SelectTrigger id="title-style" className="touch-target">
                <SelectValue placeholder="Choisir un style" />
              </SelectTrigger>
              <SelectContent>
                {titleStyleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="touch-target">
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
