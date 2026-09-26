import type { Category } from "@/lib/artworks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ArtworkForm } from "@/components/studio/types/artwork-form";

interface ArtworkFormFieldsProps {
  idPrefix: string;
  form: ArtworkForm;
  onChange: (next: ArtworkForm) => void;
}

/** The title/category/medium/size/year/description fields shared by the
 * "New artwork" and "Edit artwork" dialogs. */
export default function ArtworkFormFields({ idPrefix, form, onChange }: ArtworkFormFieldsProps) {
  return (
    <>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-title`}>Title</Label>
        <Input
          id={`${idPrefix}-title`}
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={form.category} onValueChange={(v) => onChange({ ...form, category: v as Category })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="graphite">Pencil &amp; Charcoal</SelectItem>
            <SelectItem value="acrylic">Acrylic</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-medium`}>Medium</Label>
        <Input
          id={`${idPrefix}-medium`}
          placeholder="e.g. Charcoal on paper"
          value={form.medium}
          onChange={(e) => onChange({ ...form, medium: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-width`}>
          Size <span className="text-muted-foreground">(optional)</span>
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id={`${idPrefix}-width`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder="Width"
            value={form.width}
            onChange={(e) => onChange({ ...form, width: e.target.value })}
          />
          <span className="text-muted-foreground">×</span>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            placeholder="Height"
            value={form.height}
            onChange={(e) => onChange({ ...form, height: e.target.value })}
          />
          <span className="shrink-0 text-sm text-muted-foreground">cm</span>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-year`}>Year</Label>
        <Input
          id={`${idPrefix}-year`}
          placeholder="e.g. 2025"
          value={form.year}
          onChange={(e) => onChange({ ...form, year: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-description`}
          rows={3}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
        />
      </div>
    </>
  );
}
