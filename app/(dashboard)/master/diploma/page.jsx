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

const DiplomaPage = () => {
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // bulk-saving for edits (toolbar Save All spinner)
  const [bulkSaving, setBulkSaving] = useState(false);

  // bulk-adding for bulk add flow (big input dialog Save All spinner)
  const [bulkAdding, setBulkAdding] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingDiploma, setEditingDiploma] = useState(null);
  const [diplomaName, setDiplomaName] = useState("");
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

  const fetchDiplomas = async () => {
    setLoading(true);
    try {
      const res = await get("/diploma");
      setDiplomas(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setDiplomas([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDiplomas();
  }, []);

  const handleSave = async () => {
    if (!diplomaName.trim()) {
      toast.error("Diploma name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingDiploma) {
        await put(`/diploma/${editingDiploma._id}`, {
          name: diplomaName,
        });
        toast.success("Diploma updated");
      } else {
        await post("/diploma", { name: diplomaName });
        toast.success("Diploma added");
      }
      setDiplomaName("");
      setEditingDiploma(null);
      setOpenDialog(false);
      await fetchDiplomas();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (d) => {
    setEditingDiploma(d);
    setDiplomaName(d.name);
    setOpenDialog(true);
  };

  // Delete flows
  const initiateDelete = (d) => {
    setDeleteTarget(d);
    setSingleDeleteOpen(true);
  };

  const confirmSingleDelete = async () => {
    if (!deleteTarget) {
      setSingleDeleteOpen(false);
      return;
    }
    try {
      await del(`/diploma/${deleteTarget._id}`);
      setSelected((prev) => prev.filter((i) => i !== deleteTarget._id));
      await fetchDiplomas();
      toast.success("Diploma deleted");
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
      toast.error("Please select at least one diploma to delete.");
      return;
    }
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      for (const id of selected) {
        // eslint-disable-next-line no-await-in-loop
        await del(`/diploma/${id}`);
      }
      setSelected([]);
      setSelectAll(false);
      await fetchDiplomas();
      toast.success("Selected diplomas deleted");
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
      setSelected(diplomas.map((p) => p._id));
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
        await put(`/diploma/${d._id}`, { name: d.name });
      }
      setIsBulkEditing(false);
      await fetchDiplomas();
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
      toast.error("Please enter at least one diploma.");
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
        await post("/diploma", { name });
      }
      // clear and close big input after successful add
      setBulkAddText("");
      setBulkAddLinesCache([]);
      await fetchDiplomas();
      toast.success("Bulk diplomas added");
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
        <h2 className="text-xl font-semibold">Diploma Master</h2>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={initiateBulkDelete}>
              Delete Selected ({selected.length})
            </Button>
          )}
          {diplomas.length > 0 && (
            <Button
              variant={isBulkEditing ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkEditing((prev) => !prev);
                setBulkData(diplomas.map((d) => ({ ...d })));
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

          <Button onClick={() => setOpenDialog(true)}>Add Diploma</Button>
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
            <DialogTitle>Bulk Add Diplomas</DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              Paste a list of diploma names below — one per line.
            </p>
            <textarea
              className="w-full min-h-[200px] rounded-md border border-input bg-background p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={`Example:\nDiploma in Computer Applications\nDiploma in Electronics`}
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

            {/* Save All inside big-input dialog */}
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
          ) : diplomas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-left">
                No diplomas found.
              </TableCell>
            </TableRow>
          ) : (
            diplomas.map((diploma, index) => (
              <TableRow
                className={cn(
                  isBulkEditing &&
                    "bg-muted/40 hover:bg-muted/60 transition-colors"
                )}
                key={diploma._id}
              >
                <TableCell className="text-left">
                  <Checkbox
                    className={cn(
                      "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
                      "data-[state=unchecked]:bg-background data-[state=unchecked]:border-muted-foreground",
                      "hover:border-foreground transition-colors"
                    )}
                    checked={selected.includes(diploma._id)}
                    onCheckedChange={() => handleSelect(diploma._id)}
                    disabled={bulkAdding || bulkSaving}
                  />
                </TableCell>
                <TableCell className="text-left">{index + 1}</TableCell>
                <TableCell className="text-left">
                  {isBulkEditing ? (
                    <Input
                      value={
                        bulkData.find((item) => item._id === diploma._id)
                          ?.name || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setBulkData((prev) =>
                          prev.map((item) =>
                            item._id === diploma._id
                              ? { ...item, name: value }
                              : item
                          )
                        );
                      }}
                      disabled={bulkSaving || bulkAdding}
                    />
                  ) : (
                    diploma.name
                  )}
                </TableCell>

                <TableCell className="text-left">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(diploma)}
                      disabled={bulkSaving || bulkAdding}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => initiateDelete(diploma)}
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
              {editingDiploma ? "Edit Diploma" : "Add Diploma"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <Input
              placeholder="Diploma name"
              value={diplomaName}
              onChange={(e) => setDiplomaName(e.target.value)}
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
                  {editingDiploma ? "Updating..." : "Adding..."}
                </Spinner>
              ) : editingDiploma ? (
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
            <AlertDialogTitle>Delete Diploma</AlertDialogTitle>
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
            <AlertDialogTitle>Delete Selected Diplomas</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selected.length}</strong>{" "}
              selected diploma{selected.length > 1 ? "s" : ""}? This action will
              soft-delete them.
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
              Add <strong>{bulkAddCount}</strong> new diploma
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

export default DiplomaPage;
