import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DbMenuItem } from "@/hooks/useMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const empty = { name: "", description: "", price: 0, prep_time: 10, category: "mains", cuisine: "Nigerian" };

export const MenuItemsTable = ({ items }: { items: DbMenuItem[] }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DbMenuItem | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (item: DbMenuItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      prep_time: item.prep_time,
      category: item.category,
      cuisine: item.cuisine,
    });
    setOpen(true);
  };

  const save = async () => {
    if (editing) {
      const { error } = await supabase.from("menu_items").update(form).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Item updated");
    } else {
      const { error } = await supabase.from("menu_items").insert({ ...form, sort_order: items.length + 1 });
      if (error) return toast.error(error.message);
      toast.success("Item added");
    }
    setOpen(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
  };

  const toggleAvailable = async (item: DbMenuItem) => {
    const { error } = await supabase.from("menu_items").update({ available: !item.available }).eq("id", item.id);
    if (error) toast.error(error.message);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Menu Items ({items.length})</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} size="sm"><Plus className="w-4 h-4 mr-1" /> Add Dish</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Dish" : "Add Dish"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Price (₦)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
                <div><Label>Prep time (min)</Label><Input type="number" value={form.prep_time} onChange={(e) => setForm({ ...form, prep_time: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="starters">Starters</option>
                    <option value="mains">Mains</option>
                    <option value="sides">Sides</option>
                    <option value="drinks">Drinks</option>
                    <option value="desserts">Desserts</option>
                  </select>
                </div>
                <div>
                  <Label>Cuisine</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })}>
                    <option>Nigerian</option>
                    <option>Continental</option>
                    <option>Italian</option>
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={save}>{editing ? "Save Changes" : "Add Dish"}</Button>
            </DialogFooter>
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
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="capitalize text-muted-foreground">{item.category}</TableCell>
                <TableCell>₦{item.price.toLocaleString()}</TableCell>
                <TableCell><Switch checked={item.available} onCheckedChange={() => toggleAvailable(item)} /></TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
