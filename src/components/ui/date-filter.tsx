"use client";

import { useState } from "react";
import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DateFilterProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
}

export function DateFilter({ value, onChange, placeholder = "Filtrer par date", className }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (date) {
      // Format the date to match the expected format
      const formattedDate = format(new Date(date), "dd MMM yyyy", { locale: fr });
      onChange(formattedDate);
    } else {
      onChange("");
    }
    setIsOpen(false);
  };

  const clearDate = () => {
    onChange("");
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          type="text"
          value={value}
          onClick={() => setIsOpen(!isOpen)}
          placeholder={placeholder}
          readOnly
          className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground pr-10 cursor-pointer"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              onClick={clearDate}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 z-50">
          <div className="glass-card rounded-xl border border-white/10 p-4 min-w-[280px]">
            <input
              type="date"
              onChange={handleDateChange}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-orange-accent/50"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="border-white/10 text-white hover:bg-white/5"
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
