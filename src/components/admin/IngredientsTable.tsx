import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DbIngredient } from "@/hooks/useMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const empty = { name: "", category: "protein", price: 500 };

export const IngredientsTable = ({ ingredients }: { ingredients: DbIngredient[] }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DbIngredient | null>(null);
  const [form, setForm] = useState(empty);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (i: DbIngredient) => { setEditing(i); setForm({ name: i.name, category: i.category, price: i.price }); setOpen(true); };

  const save = async () => {
    if (editing) {
      const { error } = await supabase.from("ingredients").update(form).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Ingredient updated");
    } else {
      const { error } = await supabase.from("ingredients").insert(form);
      if (error) return toast.error(error.message);
      toast.success("Ingredient added");
    }
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this ingredient?")) return;
    const { error } = await supabase.from("ingredients").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
  };

  const toggle = async (ing: DbIngredient) => {
    const { error } = await supabase.from("ingredients").update({ available: !ing.available }).eq("id", ing.id);
    if (error) toast.error(error.message);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Custom Meal Ingredients ({ingredients.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" /> Add Ingredient</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Ingredient</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div>
                <Label>Category</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="protein">Protein</option>
                  <option value="carb">Carb</option>
                  <option value="vegetable">Vegetable</option>
                  <option value="sauce">Sauce</option>
                  <option value="extra">Extra</option>
                </select>
              </div>
              <div><Label>Price (₦)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
            </div>
            <DialogFooter><Button onClick={save}>{editing ? "Save" : "Add"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.map((i) => (
              <TableRow key={i.id}>
                <TableCell>{i.name}</TableCell>
                <TableCell className="capitalize text-muted-foreground">{i.category}</TableCell>
                <TableCell>₦{i.price.toLocaleString()}</TableCell>
                <TableCell><Switch checked={i.available} onCheckedChange={() => toggle(i)} /></TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(i)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(i.id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
