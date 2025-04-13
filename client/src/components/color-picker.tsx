import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const COLORS = [
  "#f3f4f6", // Gris claro (default user)
  "#e5e7eb", // Gris (default assistant)
  "#fee2e2", // Rojo claro
  "#fef3c7", // Amarillo claro
  "#d1fae5", // Verde claro
  "#dbeafe", // Azul claro
  "#f5d0fe", // Púrpura claro
  "#4f46e5", // Indigo
  "#2563eb", // Azul
  "#0891b2", // Cyan
  "#059669", // Verde
  "#d97706", // Ámbar
  "#dc2626", // Rojo
  "#7c3aed", // Violeta
  "#c026d3", // Fucsia
  "#475569", // Gris oscuro
];

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start"
          style={{ height: "40px" }}
        >
          <div className="flex items-center space-x-2">
            <div
              className="w-5 h-5 rounded-full border"
              style={{ backgroundColor: color }}
            />
            <span>{color}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-4 gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              className="w-full h-8 rounded-md border"
              style={{ backgroundColor: c }}
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}