import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { MessageSquare, Check } from "lucide-react";
import { SpecialInstructions, commonInstructionOptions } from "@/types/menu";

interface ItemInstructionsProps {
  itemName: string;
  currentInstructions?: SpecialInstructions;
  onSave: (instructions: SpecialInstructions) => void;
}

export const ItemInstructions = ({
  itemName,
  currentInstructions,
  onSave,
}: ItemInstructionsProps) => {
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    currentInstructions?.commonOptions || []
  );
  const [customNote, setCustomNote] = useState(currentInstructions?.customNote || "");

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleSave = () => {
    onSave({
      commonOptions: selectedOptions,
      customNote,
    });
    setOpen(false);
  };

  const hasInstructions =
    (currentInstructions?.commonOptions?.length ?? 0) > 0 ||
    (currentInstructions?.customNote?.length ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={hasInstructions ? "secondary" : "ghost"}
          size="sm"
          className="h-6 px-2 text-xs gap-1"
        >
          <MessageSquare className="w-3 h-3" />
          {hasInstructions ? "Edit" : "Add"} Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Special Instructions</DialogTitle>
          <DialogDescription>
            Add cooking preferences for <span className="font-medium">{itemName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Quick Options</h4>
            <div className="flex flex-wrap gap-2">
              {commonInstructionOptions.map((option) => (
                <Badge
                  key={option}
                  variant={selectedOptions.includes(option) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedOptions.includes(option)
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/10"
                  }`}
                  onClick={() => toggleOption(option)}
                >
                  {selectedOptions.includes(option) && <Check className="w-3 h-3 mr-1" />}
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Custom Note</h4>
            <Textarea
              placeholder="Any specific requests? (e.g., 'extra sauce on the side', 'well done meat')"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Instructions</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};