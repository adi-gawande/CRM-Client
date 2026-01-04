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

const GraduationPage = () => {
  const [graduations, setGraduations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // bulk-saving for edits (toolbar Save All spinner)
  const [bulkSaving, setBulkSaving] = useState(false);

  // bulk-adding for bulk add flow (big input dialog Save All spinner)
  const [bulkAdding, setBulkAdding] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingGraduation, setEditingGraduation] = useState(null);
  const [graduationName, setGraduationName] = useState("");
  const [selected, setSelected] = useState([]); // selected ids
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkData, setBulkData] = useState([]);

  // Bulk Add dialog (the big input box)
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [bulkAddText, setBulkAddText] = useState("");

  // Delete confirmations
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Bulk confirm dialogs
  const [bulkSaveConfirmOpen, setBulkSaveConfirmOpen] = useState(false);
  const [bulkAddConfirmOpen, setBulkAddConfirmOpen] = useState(false);
  const [bulkSaveCount, setBulkSaveCount] = useState(0);
  const [bulkAddCount, setBulkAddCount] = useState(0);
  const [bulkAddLinesCache, setBulkAddLinesCache] = useState([]);

  const fetchGraduations = async () => {
    setLoading(true);
    try {
      const res = await get("/graduation");
      setGraduations(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setGraduations([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGraduations();
  }, []);

  const handleSave = async () => {
    if (!graduationName.trim()) {
      toast.error("Graduation name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingGraduation) {
        await put(`/graduation/${editingGraduation._id}`, {
          name: graduationName,
        });
        toast.success("Graduation updated");
      } else {
        await post("/graduation", { name: graduationName });
        toast.success("Graduation added");
      }
      setGraduationName("");
      setEditingGraduation(null);
      setOpenDialog(false);
      await fetchGraduations();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (g) => {
    setEditingGraduation(g);
    setGraduationName(g.name);
    setOpenDialog(true);
  };

  // Delete flows
  const initiateDelete = (g) => {
    setDeleteTarget(g);
    setSingleDeleteOpen(true);
  };

  const confirmSingleDelete = async () => {
    if (!deleteTarget) {
      setSingleDeleteOpen(false);
      return;
    }
    try {
      await del(`/graduation/${deleteTarget._id}`);
      setSelected((prev) => prev.filter((i) => i !== deleteTarget._id));
      await fetchGraduations();
      toast.success("Graduation deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeleteTarget(null);
      setSingleDeleteOpen(false);
    }
  };

  const initiateBulkDelete = () => {
    if (selected.length === 0) {
      toast.error("Please select at least one graduation to delete.");
      return;
    }
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      for (const id of selected) {
        // eslint-disable-next-line no-await-in-loop
        await del(`/graduation/${id}`);
      }
      setSelected([]);
      setSelectAll(false);
      await fetchGraduations();
      toast.success("Selected graduations deleted");
    } catch (err) {
      console.error(err);
      toast.error("Bulk delete failed");
    } finally {
      setBulkDeleteOpen(false);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      return [...prev, id];
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      setSelected(graduations.map((p) => p._id));
      setSelectAll(true);
    }
  };

  // Bulk edit - open confirm dialog only (no spinner)
  const initiateBulkSave = () => {
    if (!Array.isArray(bulkData) || bulkData.length === 0) {
      toast.error("No items to save.");
      return;
    }
    const empty = bulkData.some((d) => !d.name || !d.name.trim());
    if (empty) {
      toast.error("All names must be non-empty before saving.");
      return;
    }
    setBulkSaveCount(bulkData.length);
    setBulkSaveConfirmOpen(true); // open confirm dialog
  };

  // When user clicks Save in the confirm dialog, start network save,
  // close dialog and show toolbar Save All spinner (bulkSaving)
  const confirmBulkSave = async () => {
    setBulkSaving(true); // show spinner on toolbar Save All
    setBulkSaveConfirmOpen(false); // close confirm dialog
    try {
      for (const d of bulkData) {
        // eslint-disable-next-line no-await-in-loop
        await put(`/graduation/${d._id}`, { name: d.name });
      }
      setIsBulkEditing(false);
      await fetchGraduations();
      toast.success("Bulk changes saved");
    } catch (err) {
      console.error("Bulk save error:", err);
      toast.error("Bulk save failed");
    } finally {
      setBulkSaving(false);
    }
  };

  // --------------------------
  // Bulk ADD flow (big input dialog)
  // --------------------------

  // When user clicks Save All inside the big input dialog -> just validate and open confirm dialog
  const initiateBulkAdd = () => {
    const lines = bulkAddText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      toast.error("Please enter at least one graduation.");
      return;
    }

    setBulkAddLinesCache(lines);
    setBulkAddCount(lines.length);
    setBulkAddConfirmOpen(true); // show confirm modal (no spinner yet)
  };

  // When user clicks Add in the confirmation dialog -> start network add,
  // close confirm dialog, keep big-input dialog open, show spinner on that dialog's Save All button
  const confirmBulkAdd = async () => {
    setBulkAddConfirmOpen(false); // close confirm dialog
    setBulkAdding(true); // show spinner on big-input dialog's Save All button
    try {
      for (const name of bulkAddLinesCache) {
        // eslint-disable-next-line no-await-in-loop
        await post("/graduation", { name });
      }
      // clear and close big input after successful add
      setBulkAddText("");
      setBulkAddLinesCache([]);
      await fetchGraduations();
      toast.success("Bulk graduations added");
      setBulkAddOpen(false);
    } catch (err) {
      console.error("Bulk add error:", err);
      toast.error("Bulk add failed");
      // keep big-input open for user to retry/edit
    } finally {
      setBulkAdding(false); // stop spinner
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Graduation Master</h2>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={initiateBulkDelete}>
              Delete Selected ({selected.length})
            </Button>
          )}
          {graduations.length > 0 && (
            <Button
              variant={isBulkEditing ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkEditing((prev) => !prev);
                setBulkData(graduations.map((d) => ({ ...d })));
              }}
            >
              {isBulkEditing ? "Cancel Bulk Edit" : "Bulk Edit"}
            </Button>
          )}

          {isBulkEditing && (
            <Button
              variant="default"
              onClick={initiateBulkSave}
              disabled={bulkSaving}
            >
              {bulkSaving ? <Spinner>Saving...</Spinner> : "Save All"}
            </Button>
          )}

          {/* Bulk Add - opens big-input dialog */}
          <Button
            variant="outline"
            onClick={() => {
              setBulkAddText("");
              setBulkAddOpen(true);
            }}
            disabled={bulkAdding}
          >
            Bulk Add
          </Button>

          <Button onClick={() => setOpenDialog(true)}>Add Graduation</Button>
        </div>
      </div>

      {/* Bulk Add Dialog (big input box) */}
      <Dialog
        open={bulkAddOpen}
        onOpenChange={(open) => {
          // prevent closing while bulkAdding to avoid UI-confusion
          if (bulkAdding && !open) return;
          setBulkAddOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Add Graduations</DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              Paste a list of graduation names below — one per line.
            </p>
            <textarea
              className="w-full min-h-[200px] rounded-md border border-input bg-background p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={`Example:\nBachelor of Science\nBachelor of Arts\nB.E.`}
              value={bulkAddText}
              onChange={(e) => setBulkAddText(e.target.value)}
              disabled={bulkAdding}
            />
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setBulkAddOpen(false)}
              disabled={bulkAdding || saving}
            >
              Cancel
            </Button>

            {/* This is the Save All inside big-input dialog.
                It shows spinner (bulkAdding) AFTER confirmation is clicked. */}
            <Button onClick={initiateBulkAdd} disabled={bulkAdding || saving}>
              {bulkAdding ? <Spinner>Adding...</Spinner> : "Save All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/12 text-left">
              <Checkbox
                className={cn(
                  "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
                  "data-[state=unchecked]:bg-background data-[state=unchecked]:border-muted-foreground",
                  "hover:border-foreground transition-colors"
                )}
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="w-1/12 text-left">Sr No</TableHead>
            <TableHead className="w-7/12 text-left">Name</TableHead>
            <TableHead className="w-4/12 text-left">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-left">
                <Loading />
              </TableCell>
            </TableRow>
          ) : graduations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-left">
                No graduations found.
              </TableCell>
            </TableRow>
          ) : (
            graduations.map((graduation, index) => (
              <TableRow
                className={cn(
                  isBulkEditing &&
                    "bg-muted/40 hover:bg-muted/60 transition-colors"
                )}
                key={graduation._id}
              >
                <TableCell className="text-left">
                  <Checkbox
                    className={cn(
                      "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
                      "data-[state=unchecked]:bg-background data-[state=unchecked]:border-muted-foreground",
                      "hover:border-foreground transition-colors"
                    )}
                    checked={selected.includes(graduation._id)}
                    onCheckedChange={() => handleSelect(graduation._id)}
                    disabled={bulkAdding || bulkSaving}
                  />
                </TableCell>
                <TableCell className="text-left">{index + 1}</TableCell>
                <TableCell className="text-left">
                  {isBulkEditing ? (
                    <Input
                      value={
                        bulkData.find((item) => item._id === graduation._id)
                          ?.name || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setBulkData((prev) =>
                          prev.map((item) =>
                            item._id === graduation._id
                              ? { ...item, name: value }
                              : item
                          )
                        );
                      }}
                      disabled={bulkSaving || bulkAdding}
                    />
                  ) : (
                    graduation.name
                  )}
                </TableCell>

                <TableCell className="text-left">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(graduation)}
                      disabled={bulkSaving || bulkAdding}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => initiateDelete(graduation)}
                      disabled={bulkSaving || bulkAdding}
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {editingGraduation ? "Edit Graduation" : "Add Graduation"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <Input
              placeholder="Graduation name"
              value={graduationName}
              onChange={(e) => setGraduationName(e.target.value)}
            />
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Spinner>
                  {editingGraduation ? "Updating..." : "Adding..."}
                </Spinner>
              ) : editingGraduation ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Delete AlertDialog */}
      <AlertDialog open={singleDeleteOpen} onOpenChange={setSingleDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Graduation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>? This action can be undone
              by restoring on the server only (soft-delete).
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

      {/* Bulk Delete AlertDialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Graduations</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selected.length}</strong>{" "}
              selected graduation{selected.length > 1 ? "s" : ""}? This action
              will soft-delete them.
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

      {/* Bulk Save Confirm AlertDialog (for edits) */}
      <AlertDialog
        open={bulkSaveConfirmOpen}
        onOpenChange={(open) => setBulkSaveConfirmOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Bulk Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Save changes for <strong>{bulkSaveCount}</strong> item
              {bulkSaveCount > 1 ? "s" : ""}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkSave} disabled={bulkSaving}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Add Confirm AlertDialog (for big-input Save All confirmation) */}
      <AlertDialog
        open={bulkAddConfirmOpen}
        onOpenChange={(open) => {
          // if user dismisses confirm dialog by outside click, just close it
          setBulkAddConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Add</AlertDialogTitle>
            <AlertDialogDescription>
              Add <strong>{bulkAddCount}</strong> new graduation
              {bulkAddCount > 1 ? "s" : ""}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkAdding}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkAdd} disabled={bulkAdding}>
              Add
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GraduationPage;
