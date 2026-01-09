import { Minus, Plus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NumberInputProps {
  value: number;
  step?: number;
  min?: number;
  onChange: (value: number) => void;
}

export const NumberInput = ({
  value,
  onChange,
  step = 1,
  min,
}: NumberInputProps) => {
  const increment = () => onChange(value + step);
  const decrement = () => {
    const next = value - step;
    onChange(min === undefined ? next : Math.max(min, next));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseFloat(e.target.value);
    onChange(Number.isNaN(next) ? 0 : next);
  };

  return (
    <div className="flex items-center">
      <Button
        onClick={decrement}
        variant="outline"
        className="p-2 rounded-r-none border-r-0"
        size="icon"
      >
        <Minus className="size-4" />
      </Button>
      <Input
        onChange={handleChange}
        value={value}
        type="number"
        className="w-[60px] h-8 focus-visible:ring-offset-0 focus-visible:ring-0 rounded-none"
      />
      <Button
        onClick={increment}
        variant="outline"
        className="p-2 rounded-l-none border-l-0"
        size="icon"
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
};
