"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
import { Label } from "@/components/ui/label";

const PositionPage = () => {
  const authState = useSelector((state) => state.auth.auth);
  const companyId = authState?.companyId;

  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  
  const [positionName, setPositionName] = useState("");

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkData, setBulkData] = useState([]);

  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const [bulkSaveConfirmOpen, setBulkSaveConfirmOpen] = useState(false);
  const [bulkSaveCount, setBulkSaveCount] = useState(0);

  const fetchPositions = async () => {
    if (!companyId) {
      toast.error("Company ID not found");
      return;
    }

    setLoading(true);
    try {
      const res = await get(`/position?companyId=${companyId}`);
      setPositions(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setPositions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPositions();
  }, [companyId]);

  const resetForm = () => {
    setPositionName("");
    setEditingPosition(null);
  };

  const handleSave = async () => {
    if (!positionName.trim()) {
      toast.error("Position name is required");
      return;
    }

    if (!companyId) {
      toast.error("Company ID not found");
      return;
    }

    setSaving(true);
    try {
      if (editingPosition) {
        await put(`/position/${editingPosition._id}`, {
          positionName,
          companyId,
        });
        toast.success("Position updated");
      } else {
        await post("/position", {
          positionName,
          companyId,
        });
        toast.success("Position added");
      }
      resetForm();
      setOpenDialog(false);
      await fetchPositions();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (position) => {
    setEditingPosition(position);
    setPositionName(position.positionName);
    setOpenDialog(true);
  };

  const initiateDelete = (position) => {
    setDeleteTarget(position);
    setSingleDeleteOpen(true);
  };

  const confirmSingleDelete = async () => {
    if (!deleteTarget) {
      setSingleDeleteOpen(false);
      return;
    }

    if (!companyId) {
      toast.error("Company ID not found");
      setSingleDeleteOpen(false);
      return;
    }

    try {
      await del(`/position/${deleteTarget._id}`, { companyId });
      setSelected((prev) => prev.filter((i) => i !== deleteTarget._id));
      await fetchPositions();
      toast.success("Position deleted");
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
      toast.error("Please select at least one item to delete.");
      return;
    }
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (!companyId) {
      toast.error("Company ID not found");
      setBulkDeleteOpen(false);
      return;
    }

    try {
      await Promise.all(
        selected.map(id => del(`/position/${id}`, { companyId }))
      );
      setSelected([]);
      setSelectAll(false);
      await fetchPositions();
      toast.success("Selected positions deleted");
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
      setSelected(positions.map((p) => p._id));
      setSelectAll(true);
    }
  };

  const initiateBulkSave = () => {
    if (!Array.isArray(bulkData) || bulkData.length === 0) {
      toast.error("No items to save.");
      return;
    }
    
    const invalid = bulkData.some((d) => !d.positionName?.trim());
    
    if (invalid) {
      toast.error("Position name must be filled before saving.");
      return;
    }
    
    setBulkSaveCount(bulkData.length);
    setBulkSaveConfirmOpen(true);
  };

  const confirmBulkSave = async () => {
    if (!companyId) {
      toast.error("Company ID not found");
      setBulkSaveConfirmOpen(false);
      return;
    }

    setBulkSaving(true);
    setBulkSaveConfirmOpen(false);
    
    try {
      await Promise.all(
        bulkData.map(d => 
          put(`/position/${d._id}`, {
            positionName: d.positionName,
            companyId,
          })
        )
      );
      setIsBulkEditing(false);
      await fetchPositions();
      toast.success("Bulk changes saved");
    } catch (err) {
      console.error("Bulk save error:", err);
      toast.error("Bulk save failed");
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Position Master</h2>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={initiateBulkDelete}>
              Delete Selected ({selected.length})
            </Button>
          )}
          
          {positions.length > 0 && (
            <Button
              variant={isBulkEditing ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkEditing((prev) => !prev);
                setBulkData(positions.map((d) => ({ ...d })));
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

          <Button onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}>
            Add Position
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="table-fixed w-full min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
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
              <TableHead className="w-[60px]">Sr No</TableHead>
              <TableHead className="w-[300px]">Position Name</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <Loading />
                </TableCell>
              </TableRow>
            ) : positions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No positions found.
                </TableCell>
              </TableRow>
            ) : (
              positions.map((position, index) => (
                <TableRow
                  className={cn(
                    isBulkEditing &&
                      "bg-muted/40 hover:bg-muted/60 transition-colors"
                  )}
                  key={position._id}
                >
                  <TableCell>
                    <Checkbox
                      className={cn(
                        "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
                        "data-[state=unchecked]:bg-background data-[state=unchecked]:border-muted-foreground",
                        "hover:border-foreground transition-colors"
                      )}
                      checked={selected.includes(position._id)}
                      onCheckedChange={() => handleSelect(position._id)}
                      disabled={bulkSaving}
                    />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  
                  <TableCell>
                    {isBulkEditing ? (
                      <Input
                        value={
                          bulkData.find((item) => item._id === position._id)
                            ?.positionName || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setBulkData((prev) =>
                            prev.map((item) =>
                              item._id === position._id
                                ? { ...item, positionName: value }
                                : item
                            )
                          );
                        }}
                        disabled={bulkSaving}
                        className="min-w-[250px]"
                      />
                    ) : (
                      position.positionName
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(position)}
                        disabled={bulkSaving}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => initiateDelete(position)}
                        disabled={bulkSaving}
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
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              {editingPosition ? "Edit Position" : "Add Position"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="positionName">Position Name <span className="text-red-500">*</span></Label>
              <Input
                id="positionName"
                placeholder="Enter position name"
                value={positionName}
                onChange={(e) => setPositionName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setOpenDialog(false);
              }}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Spinner>{editingPosition ? "Updating..." : "Adding..."}</Spinner>
              ) : editingPosition ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={singleDeleteOpen} onOpenChange={setSingleDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Position</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete position{" "}
              <strong>{deleteTarget?.positionName}</strong>? This action can be undone
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

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Positions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selected.length}</strong>{" "}
              selected position{selected.length > 1 ? "s" : ""}? This action will
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
    </div>
  );
};

export default PositionPage;