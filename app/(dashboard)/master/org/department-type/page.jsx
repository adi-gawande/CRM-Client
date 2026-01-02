"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { del, get, post, put } from "@/lib/api";
import { Checkbox } from "@/components/ui/checkbox";
import Loading from "@/components/loading";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DepartmentTypePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // bulk save for edit
  const [bulkSaving, setBulkSaving] = useState(false);

  // bulk add
  const [bulkAdding, setBulkAdding] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState("");

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkData, setBulkData] = useState([]);

  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [bulkAddText, setBulkAddText] = useState("");

  // delete
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Confirm dialogs
  const [bulkSaveConfirmOpen, setBulkSaveConfirmOpen] = useState(false);
  const [bulkAddConfirmOpen, setBulkAddConfirmOpen] = useState(false);
  const [bulkSaveCount, setBulkSaveCount] = useState(0);
  const [bulkAddCount, setBulkAddCount] = useState(0);
  const [bulkAddLinesCache, setBulkAddLinesCache] = useState([]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await get("/department-type");
      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async () => {
    if (!itemName.trim()) {
      toast.error("Department Type name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await put(`/department-type/${editingItem._id}`, { name: itemName });
        toast.success("Department Type updated");
      } else {
        await post("/department-type", { name: itemName });
        toast.success("Department Type added");
      }

      setItemName("");
      setEditingItem(null);
      setOpenDialog(false);
      await fetchItems();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setOpenDialog(true);
  };

  // Delete
  const initiateDelete = (item) => {
    setDeleteTarget(item);
    setSingleDeleteOpen(true);
  };

  const confirmSingleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await del(`/department-type/${deleteTarget._id}`);
      setSelected((prev) => prev.filter((i) => i !== deleteTarget._id));
      await fetchItems();
      toast.success("Department Type deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setSingleDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const initiateBulkDelete = () => {
    if (selected.length === 0) {
      toast.error("Please select at least one");
      return;
    }
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      for (const id of selected) {
        await del(`/department-type/${id}`);
      }
      setSelected([]);
      setSelectAll(false);
      await fetchItems();
      toast.success("Selected Department Types deleted");
    } catch (err) {
      console.error(err);
      toast.error("Bulk delete failed");
    } finally {
      setBulkDeleteOpen(false);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      setSelected(items.map((i) => i._id));
      setSelectAll(true);
    }
  };

  // Bulk Edit
  const initiateBulkSave = () => {
    if (!bulkData.length) {
      toast.error("No items to save.");
      return;
    }

    const empty = bulkData.some((d) => !d.name.trim());
    if (empty) {
      toast.error("All names must be non-empty.");
      return;
    }

    setBulkSaveCount(bulkData.length);
    setBulkSaveConfirmOpen(true);
  };

  const confirmBulkSave = async () => {
    setBulkSaving(true);
    setBulkSaveConfirmOpen(false);

    try {
      for (const d of bulkData) {
        await put(`/department-type/${d._id}`, { name: d.name });
      }
      setIsBulkEditing(false);
      await fetchItems();
      toast.success("Bulk changes saved");
    } catch (err) {
      console.error(err);
      toast.error("Bulk save failed");
    } finally {
      setBulkSaving(false);
    }
  };

  // Bulk Add
  const initiateBulkAdd = () => {
    const lines = bulkAddText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l !== "");

    if (!lines.length) {
      toast.error("Please enter at least one name");
      return;
    }

    setBulkAddLinesCache(lines);
    setBulkAddCount(lines.length);
    setBulkAddConfirmOpen(true);
  };

  const confirmBulkAdd = async () => {
    setBulkAddConfirmOpen(false);
    setBulkAdding(true);

    try {
      for (const name of bulkAddLinesCache) {
        await post("/department-type", { name });
      }

      setBulkAddText("");
      setBulkAddLinesCache([]);
      await fetchItems();
      toast.success("Bulk items added");
      setBulkAddOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Bulk add failed");
    } finally {
      setBulkAdding(false);
    }
  };

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Department Type Master</h2>

        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={initiateBulkDelete}>
              Delete Selected ({selected.length})
            </Button>
          )}

          {items.length > 0 && (
            <Button
              variant={isBulkEditing ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkEditing((prev) => !prev);
                setBulkData(items.map((d) => ({ ...d })));
              }}
            >
              {isBulkEditing ? "Cancel Bulk Edit" : "Bulk Edit"}
            </Button>
          )}

          {isBulkEditing && (
            <Button onClick={initiateBulkSave} disabled={bulkSaving}>
              {bulkSaving ? <Spinner>Saving...</Spinner> : "Save All"}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setBulkAddText("");
              setBulkAddOpen(true);
            }}
          >
            Bulk Add
          </Button>

          <Button onClick={() => setOpenDialog(true)}>Add</Button>
        </div>
      </div>

      {/* BULK ADD DIALOG */}
      <Dialog
        open={bulkAddOpen}
        onOpenChange={(open) => {
          if (bulkAdding && !open) return;
          setBulkAddOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Add Department Types</DialogTitle>
          </DialogHeader>

          <textarea
            className="w-full min-h-[200px] border p-2 text-sm rounded-md"
            placeholder={`Cardiology\nRadiology\nPathology`}
            value={bulkAddText}
            onChange={(e) => setBulkAddText(e.target.value)}
            disabled={bulkAdding}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={initiateBulkAdd} disabled={bulkAdding}>
              {bulkAdding ? <Spinner>Adding...</Spinner> : "Save All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TABLE */}
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/12 text-left">
              <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
            </TableHead>
            <TableHead className="w-1/12 text-left">Sr</TableHead>
            <TableHead className="w-7/12 text-left">Name</TableHead>
            <TableHead className="w-4/12 text-left">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Loading />
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>No records found.</TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => (
              <TableRow key={item._id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(item._id)}
                    onCheckedChange={() => handleSelect(item._id)}
                  />
                </TableCell>

                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  {isBulkEditing ? (
                    <Input
                      value={
                        bulkData.find((d) => d._id === item._id)?.name || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setBulkData((prev) =>
                          prev.map((d) =>
                            d._id === item._id ? { ...d, name: value } : d
                          )
                        );
                      }}
                    />
                  ) : (
                    item.name
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => initiateDelete(item)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Department Type" : "Add Department Type"}
            </DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Department Type name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Spinner>{editingItem ? "Updating..." : "Adding..."}</Spinner>
              ) : editingItem ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SINGLE DELETE */}
      <AlertDialog open={singleDeleteOpen} onOpenChange={setSingleDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSingleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* BULK DELETE */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{selected.length}</strong> selected item
              {selected.length > 1 ? "s" : ""}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete}>
              Delete Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* BULK SAVE CONFIRM */}
      <AlertDialog
        open={bulkSaveConfirmOpen}
        onOpenChange={setBulkSaveConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Bulk Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Save <strong>{bulkSaveCount}</strong> changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkSave}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* BULK ADD CONFIRM */}
      <AlertDialog
        open={bulkAddConfirmOpen}
        onOpenChange={setBulkAddConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Add</AlertDialogTitle>
            <AlertDialogDescription>
              Add <strong>{bulkAddCount}</strong> new item
              {bulkAddCount > 1 ? "s" : ""}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkAdd}>Add</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepartmentTypePage;
