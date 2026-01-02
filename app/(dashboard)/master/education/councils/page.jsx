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

const CouncilsPage = () => {
  const [councils, setCouncils] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // bulk edit Save All spinner
  const [bulkSaving, setBulkSaving] = useState(false);

  // bulk add Save All spinner
  const [bulkAdding, setBulkAdding] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingCouncil, setEditingCouncil] = useState(null);
  const [councilName, setCouncilName] = useState("");

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkData, setBulkData] = useState([]);

  // Bulk Add
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [bulkAddText, setBulkAddText] = useState("");

  // Delete dialogs
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Confirm dialogs
  const [bulkSaveConfirmOpen, setBulkSaveConfirmOpen] = useState(false);
  const [bulkAddConfirmOpen, setBulkAddConfirmOpen] = useState(false);
  const [bulkSaveCount, setBulkSaveCount] = useState(0);
  const [bulkAddCount, setBulkAddCount] = useState(0);
  const [bulkAddLinesCache, setBulkAddLinesCache] = useState([]);

  // Fetch councils
  const fetchCouncils = async () => {
    setLoading(true);
    try {
      const res = await get("/council");
      setCouncils(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setCouncils([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCouncils();
  }, []);

  // Single save (add / update)
  const handleSave = async () => {
    if (!councilName.trim()) {
      toast.error("Council name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingCouncil) {
        await put(`/council/${editingCouncil._id}`, { name: councilName });
        toast.success("Council updated");
      } else {
        await post("/council", { name: councilName });
        toast.success("Council added");
      }
      setCouncilName("");
      setEditingCouncil(null);
      setOpenDialog(false);
      await fetchCouncils();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setEditingCouncil(c);
    setCouncilName(c.name);
    setOpenDialog(true);
  };

  // Single delete
  const initiateDelete = (c) => {
    setDeleteTarget(c);
    setSingleDeleteOpen(true);
  };

  const confirmSingleDelete = async () => {
    if (!deleteTarget) {
      setSingleDeleteOpen(false);
      return;
    }
    try {
      await del(`/council/${deleteTarget._id}`);
      setSelected((prev) => prev.filter((i) => i !== deleteTarget._id));
      await fetchCouncils();
      toast.success("Council deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeleteTarget(null);
      setSingleDeleteOpen(false);
    }
  };

  // Bulk delete
  const initiateBulkDelete = () => {
    if (selected.length === 0) {
      toast.error("Please select at least one council to delete.");
      return;
    }
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      for (const id of selected) {
        // eslint-disable-next-line no-await-in-loop
        await del(`/council/${id}`);
      }
      setSelected([]);
      setSelectAll(false);
      await fetchCouncils();
      toast.success("Selected councils deleted");
    } catch (err) {
      console.error(err);
      toast.error("Bulk delete failed");
    } finally {
      setBulkDeleteOpen(false);
    }
  };

  // Selection handlers
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
      setSelected(councils.map((c) => c._id));
      setSelectAll(true);
    }
  };

  // ---------------- BULK EDIT ----------------
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
    setBulkSaveConfirmOpen(true);
  };

  const confirmBulkSave = async () => {
    setBulkSaving(true);
    setBulkSaveConfirmOpen(false);
    try {
      for (const d of bulkData) {
        // eslint-disable-next-line no-await-in-loop
        await put(`/council/${d._id}`, { name: d.name });
      }
      setIsBulkEditing(false);
      await fetchCouncils();
      toast.success("Bulk changes saved");
    } catch (err) {
      console.error("Bulk save error:", err);
      toast.error("Bulk save failed");
    } finally {
      setBulkSaving(false);
    }
  };

  // ---------------- BULK ADD ----------------
  const initiateBulkAdd = () => {
    const lines = bulkAddText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      toast.error("Please enter at least one council.");
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
        // eslint-disable-next-line no-await-in-loop
        await post("/council", { name });
      }
      setBulkAddText("");
      setBulkAddLinesCache([]);
      await fetchCouncils();
      toast.success("Bulk councils added");
      setBulkAddOpen(false);
    } catch (err) {
      console.error("Bulk add error:", err);
      toast.error("Bulk add failed");
      // keep big-input open for retry
    } finally {
      setBulkAdding(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Councils Master</h2>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={initiateBulkDelete}>
              Delete Selected ({selected.length})
            </Button>
          )}
          {councils.length > 0 && (
            <Button
              variant={isBulkEditing ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkEditing((prev) => !prev);
                setBulkData(councils.map((d) => ({ ...d })));
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

          <Button onClick={() => setOpenDialog(true)}>Add Council</Button>
        </div>
      </div>

      {/* Bulk Add Dialog (big input box) */}
      <Dialog
        open={bulkAddOpen}
        onOpenChange={(open) => {
          if (bulkAdding && !open) return;
          setBulkAddOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Add Councils</DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              Paste a list of council names below — one per line.
            </p>
            <textarea
              className="w-full min-h-[200px] rounded-md border border-input bg-background p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={`Example:\nMedical Council\nNursing Council\nPharmacy Council`}
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
          ) : councils.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-left">
                No councils found.
              </TableCell>
            </TableRow>
          ) : (
            councils.map((council, index) => (
              <TableRow
                className={cn(
                  isBulkEditing &&
                    "bg-muted/40 hover:bg-muted/60 transition-colors"
                )}
                key={council._id}
              >
                <TableCell className="text-left">
                  <Checkbox
                    className={cn(
                      "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
                      "data-[state=unchecked]:bg-background data-[state=unchecked]:border-muted-foreground",
                      "hover:border-foreground transition-colors"
                    )}
                    checked={selected.includes(council._id)}
                    onCheckedChange={() => handleSelect(council._id)}
                    disabled={bulkAdding || bulkSaving}
                  />
                </TableCell>
                <TableCell className="text-left">{index + 1}</TableCell>
                <TableCell className="text-left">
                  {isBulkEditing ? (
                    <Input
                      value={
                        bulkData.find((item) => item._id === council._id)
                          ?.name || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setBulkData((prev) =>
                          prev.map((item) =>
                            item._id === council._id
                              ? { ...item, name: value }
                              : item
                          )
                        );
                      }}
                      disabled={bulkSaving || bulkAdding}
                    />
                  ) : (
                    council.name
                  )}
                </TableCell>

                <TableCell className="text-left">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(council)}
                      disabled={bulkSaving || bulkAdding}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => initiateDelete(council)}
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
              {editingCouncil ? "Edit Council" : "Add Council"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <Input
              placeholder="Council name"
              value={councilName}
              onChange={(e) => setCouncilName(e.target.value)}
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
                  {editingCouncil ? "Updating..." : "Adding..."}
                </Spinner>
              ) : editingCouncil ? (
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
            <AlertDialogTitle>Delete Council</AlertDialogTitle>
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
            <AlertDialogTitle>Delete Selected Councils</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selected.length}</strong>{" "}
              selected council{selected.length > 1 ? "s" : ""}? This action will
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
        onOpenChange={(open) => setBulkAddConfirmOpen(open)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Add</AlertDialogTitle>
            <AlertDialogDescription>
              Add <strong>{bulkAddCount}</strong> new council
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

export default CouncilsPage;
