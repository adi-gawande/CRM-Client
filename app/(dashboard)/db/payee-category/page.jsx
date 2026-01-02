"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { get, post, put, del } from "@/lib/api";
import { toast } from "sonner";
import Loading from "@/components/loading";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const PayeeCategoryPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // bulk edit
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkData, setBulkData] = useState([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkSaveConfirmOpen, setBulkSaveConfirmOpen] = useState(false);

  // bulk add
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkLines, setBulkLines] = useState([]);
  const [bulkAddConfirmOpen, setBulkAddConfirmOpen] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);

  // delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await get("/payee-category");
      setData(Array.isArray(res) ? res : []);
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------- Single Save ----------
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Payee category name is required");
      return;
    }

    try {
      if (editing) {
        await put(`/payee-category/${editing._id}`, { name });
        toast.success("Updated");
      } else {
        await post("/payee-category", { name });
        toast.success("Added");
      }

      setOpenDialog(false);
      setName("");
      setEditing(null);
      fetchData();
    } catch {
      toast.error("Operation failed");
    }
  };

  // ---------- Selection ----------
  const handleSelect = (id) => {
    setSelected((p) =>
      p.includes(id) ? p.filter((i) => i !== id) : [...p, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      setSelected(data.map((d) => d._id));
      setSelectAll(true);
    }
  };

  // ---------- Bulk Edit ----------
  const initiateBulkSave = () => {
    if (bulkData.some((d) => !d.name.trim())) {
      toast.error("All names must be filled");
      return;
    }
    setBulkSaveConfirmOpen(true);
  };

  const confirmBulkSave = async () => {
    setBulkSaving(true);
    setBulkSaveConfirmOpen(false);
    try {
      for (const d of bulkData) {
        await put(`/payee-category/${d._id}`, { name: d.name });
      }
      toast.success("Bulk changes saved");
      setIsBulkEditing(false);
      fetchData();
    } catch {
      toast.error("Bulk save failed");
    } finally {
      setBulkSaving(false);
    }
  };

  // ---------- Bulk Add ----------
  const initiateBulkAdd = () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (!lines.length) {
      toast.error("No payee categories entered");
      return;
    }

    setBulkLines(lines);
    setBulkAddConfirmOpen(true);
  };

  const confirmBulkAdd = async () => {
    setBulkAdding(true);
    setBulkAddConfirmOpen(false);
    try {
      for (const name of bulkLines) {
        await post("/payee-category", { name });
      }
      toast.success("Bulk payee categories added");
      setBulkAddOpen(false);
      setBulkText("");
      fetchData();
    } catch {
      toast.error("Bulk add failed");
    } finally {
      setBulkAdding(false);
    }
  };

  // ---------- Delete ----------
  const confirmSingleDelete = async () => {
    await del(`/payee-category/${deleteTarget._id}`);
    setSingleDeleteOpen(false);
    fetchData();
    toast.success("Deleted");
  };

  const confirmBulkDelete = async () => {
    for (const id of selected) {
      await del(`/payee-category/${id}`);
    }
    setSelected([]);
    setSelectAll(false);
    setBulkDeleteOpen(false);
    fetchData();
    toast.success("Selected deleted");
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Payee Category Master</h2>

        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
              Delete Selected ({selected.length})
            </Button>
          )}

          {data.length > 0 && (
            <Button
              variant={isBulkEditing ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkEditing((p) => !p);
                setBulkData(data.map((d) => ({ ...d })));
              }}
            >
              {isBulkEditing ? "Cancel Bulk Edit" : "Bulk Edit"}
            </Button>
          )}

          {isBulkEditing && (
            <Button onClick={initiateBulkSave} disabled={bulkSaving}>
              {bulkSaving ? <Spinner /> : "Save All"}
            </Button>
          )}

          <Button variant="outline" onClick={() => setBulkAddOpen(true)}>
            Bulk Add
          </Button>

          <Button onClick={() => setOpenDialog(true)}>
            Add Payee Category
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
            </TableHead>
            <TableHead>Sr</TableHead>
            <TableHead>Payee Category</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4}><Loading /></TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>No payee categories found.</TableCell>
            </TableRow>
          ) : (
            data.map((d, i) => (
              <TableRow key={d._id} className={cn(isBulkEditing && "bg-muted/40")}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(d._id)}
                    onCheckedChange={() => handleSelect(d._id)}
                  />
                </TableCell>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  {isBulkEditing ? (
                    <Input
                      value={
                        bulkData.find((b) => b._id === d._id)?.name || ""
                      }
                      onChange={(e) =>
                        setBulkData((prev) =>
                          prev.map((b) =>
                            b._id === d._id
                              ? { ...b, name: e.target.value }
                              : b
                          )
                        )
                      }
                    />
                  ) : (
                    d.name
                  )}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(d);
                      setName(d.name);
                      setOpenDialog(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setDeleteTarget(d);
                      setSingleDeleteOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* dialogs */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Payee Category" : "Add Payee Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <Input
              placeholder="Payee category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* confirm dialogs */}
      <AlertDialog open={singleDeleteOpen} onOpenChange={setSingleDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payee Category</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{deleteTarget?.name}</strong>?
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

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected</AlertDialogTitle>
            <AlertDialogDescription>
              Delete {selected.length} selected payee categories?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bulkSaveConfirmOpen}
        onOpenChange={setBulkSaveConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Bulk Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Save changes for {bulkData.length} items?
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

      <AlertDialog
        open={bulkAddConfirmOpen}
        onOpenChange={setBulkAddConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Add</AlertDialogTitle>
            <AlertDialogDescription>
              Add {bulkLines.length} payee categories?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkAdd}>
              Add
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PayeeCategoryPage;
