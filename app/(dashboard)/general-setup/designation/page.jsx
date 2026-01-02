"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const DesignationPage = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // bulk-saving for edits (toolbar Save All spinner)
  const [bulkSaving, setBulkSaving] = useState(false);

  // bulk-adding for bulk add flow (big input dialog Save All spinner)
  const [bulkAdding, setBulkAdding] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [formData, setFormData] = useState({
    employeeRole: "",
    designationName: "",
    designationCode: "",
    description: "",
  });
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

  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const res = await get("/designation");
      setDesignations(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setDesignations([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const handleSave = async () => {
    if (!formData.employeeRole.trim() || !formData.designationName.trim() || !formData.designationCode.trim()) {
      toast.error("Employee Role, Designation Name, and Designation Code are required");
      return;
    }

    setSaving(true);
    try {
      if (editingDesignation) {
        await put(`/designation/${editingDesignation._id}`, formData);
        toast.success("Designation updated");
      } else {
        await post("/designation", formData);
        toast.success("Designation added");
      }
      setFormData({
        employeeRole: "",
        designationName: "",
        designationCode: "",
        description: "",
      });
      setEditingDesignation(null);
      setOpenDialog(false);
      await fetchDesignations();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (d) => {
    setEditingDesignation(d);
    setFormData({
      employeeRole: d.employeeRole,
      designationName: d.designationName,
      designationCode: d.designationCode,
      description: d.description || "",
    });
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
      await del(`/designation/${deleteTarget._id}`);
      setSelected((prev) => prev.filter((i) => i !== deleteTarget._id));
      await fetchDesignations();
      toast.success("Designation deleted");
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
      toast.error("Please select at least one designation to delete.");
      return;
    }
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      for (const id of selected) {
        // eslint-disable-next-line no-await-in-loop
        await del(`/designation/${id}`);
      }
      setSelected([]);
      setSelectAll(false);
      await fetchDesignations();
      toast.success("Selected designations deleted");
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
      setSelected(designations.map((p) => p._id));
      setSelectAll(true);
    }
  };

  // Bulk edit - open confirm dialog only (no spinner)
  const initiateBulkSave = () => {
    if (!Array.isArray(bulkData) || bulkData.length === 0) {
      toast.error("No items to save.");
      return;
    }
    const empty = bulkData.some((d) => !d.employeeRole || !d.designationName || !d.designationCode || 
      !d.employeeRole.trim() || !d.designationName.trim() || !d.designationCode.trim());
    if (empty) {
      toast.error("All required fields must be filled before saving.");
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
        await put(`/designation/${d._id}`, {
          employeeRole: d.employeeRole,
          designationName: d.designationName,
          designationCode: d.designationCode,
          description: d.description,
        });
      }
      setIsBulkEditing(false);
      await fetchDesignations();
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
      toast.error("Please enter at least one designation.");
      return;
    }

    // Validate format: each line should have at least 3 parts separated by commas
    const invalidLines = lines.filter(line => {
      const parts = line.split(",").map(p => p.trim());
      return parts.length < 3 || !parts[0] || !parts[1] || !parts[2];
    });

    if (invalidLines.length > 0) {
      toast.error("Each line must have: Employee Role, Designation Name, Designation Code (comma-separated)");
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
      for (const line of bulkAddLinesCache) {
        const parts = line.split(",").map(p => p.trim());
        const [employeeRole, designationName, designationCode, description = ""] = parts;
        // eslint-disable-next-line no-await-in-loop
        await post("/designation", { 
          employeeRole, 
          designationName, 
          designationCode, 
          description 
        });
      }
      // clear and close big input after successful add
      setBulkAddText("");
      setBulkAddLinesCache([]);
      await fetchDesignations();
      toast.success("Bulk designations added");
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
        <h2 className="text-xl font-semibold">Designation Master</h2>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={initiateBulkDelete}>
              Delete Selected ({selected.length})
            </Button>
          )}
          {designations.length > 0 && (
            <Button
              variant={isBulkEditing ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkEditing((prev) => !prev);
                setBulkData(designations.map((d) => ({ ...d })));
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

          <Button onClick={() => setOpenDialog(true)}>Add Designation</Button>
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bulk Add Designations</DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              Paste a list of designations below — one per line in format: Employee Role, Designation Name, Designation Code, Description (optional)
            </p>
            <textarea
              className="w-full min-h-[200px] rounded-md border border-input bg-background p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder={`Example:\nDoctor, Senior Consultant, SC001, Senior level consultant\nNurse, Staff Nurse, SN001, General nursing staff\nAdmin, Manager, MGR001, Administrative manager`}
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
            <TableHead className="w-2/12 text-left">Employee Role</TableHead>
            <TableHead className="w-2/12 text-left">Designation Name</TableHead>
            <TableHead className="w-2/12 text-left">Designation Code</TableHead>
            <TableHead className="w-2/12 text-left">Description</TableHead>
            <TableHead className="w-2/12 text-left">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-left">
                <Loading />
              </TableCell>
            </TableRow>
          ) : designations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-left">
                No designations found.
              </TableCell>
            </TableRow>
          ) : (
            designations.map((designation, index) => (
              <TableRow
                className={cn(
                  isBulkEditing &&
                    "bg-muted/40 hover:bg-muted/60 transition-colors"
                )}
                key={designation._id}
              >
                <TableCell className="text-left">
                  <Checkbox
                    className={cn(
                      "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
                      "data-[state=unchecked]:bg-background data-[state=unchecked]:border-muted-foreground",
                      "hover:border-foreground transition-colors"
                    )}
                    checked={selected.includes(designation._id)}
                    onCheckedChange={() => handleSelect(designation._id)}
                    disabled={bulkAdding || bulkSaving}
                  />
                </TableCell>
                <TableCell className="text-left">{index + 1}</TableCell>
                <TableCell className="text-left">
                  {isBulkEditing ? (
                    <Input
                      value={
                        bulkData.find((item) => item._id === designation._id)
                          ?.employeeRole || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setBulkData((prev) =>
                          prev.map((item) =>
                            item._id === designation._id
                              ? { ...item, employeeRole: value }
                              : item
                          )
                        );
                      }}
                      disabled={bulkSaving || bulkAdding}
                    />
                  ) : (
                    designation.employeeRole
                  )}
                </TableCell>
                <TableCell className="text-left">
                  {isBulkEditing ? (
                    <Input
                      value={
                        bulkData.find((item) => item._id === designation._id)
                          ?.designationName || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setBulkData((prev) =>
                          prev.map((item) =>
                            item._id === designation._id
                              ? { ...item, designationName: value }
                              : item
                          )
                        );
                      }}
                      disabled={bulkSaving || bulkAdding}
                    />
                  ) : (
                    designation.designationName
                  )}
                </TableCell>
                <TableCell className="text-left">
                  {isBulkEditing ? (
                    <Input
                      value={
                        bulkData.find((item) => item._id === designation._id)
                          ?.designationCode || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setBulkData((prev) =>
                          prev.map((item) =>
                            item._id === designation._id
                              ? { ...item, designationCode: value }
                              : item
                          )
                        );
                      }}
                      disabled={bulkSaving || bulkAdding}
                    />
                  ) : (
                    designation.designationCode
                  )}
                </TableCell>
                <TableCell className="text-left">
                  {isBulkEditing ? (
                    <Input
                      value={
                        bulkData.find((item) => item._id === designation._id)
                          ?.description || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setBulkData((prev) =>
                          prev.map((item) =>
                            item._id === designation._id
                              ? { ...item, description: value }
                              : item
                          )
                        );
                      }}
                      disabled={bulkSaving || bulkAdding}
                    />
                  ) : (
                    designation.description || "-"
                  )}
                </TableCell>

                <TableCell className="text-left">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(designation)}
                      disabled={bulkSaving || bulkAdding}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => initiateDelete(designation)}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingDesignation ? "Edit Designation" : "Add Designation"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium">Employee Role *</label>
              <Input
                placeholder="Employee Role"
                value={formData.employeeRole}
                onChange={(e) => setFormData(prev => ({ ...prev, employeeRole: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Designation Name *</label>
              <Input
                placeholder="Designation Name"
                value={formData.designationName}
                onChange={(e) => setFormData(prev => ({ ...prev, designationName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Designation Code *</label>
              <Input
                placeholder="Designation Code"
                value={formData.designationCode}
                onChange={(e) => setFormData(prev => ({ ...prev, designationCode: e.target.value.toUpperCase() }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
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
                  {editingDesignation ? "Updating..." : "Adding..."}
                </Spinner>
              ) : editingDesignation ? (
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
            <AlertDialogTitle>Delete Designation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.designationName}</strong>? This action can be undone
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
            <AlertDialogTitle>Delete Selected Designations</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selected.length}</strong>{" "}
              selected designation{selected.length > 1 ? "s" : ""}? This action
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
              Add <strong>{bulkAddCount}</strong> new designation
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

export default DesignationPage;