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

const LeadStatusPage = () => {
  const { companyId } = useSelector((state) => state.auth.auth);

  const [leadStatuses, setLeadStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  
  const [leadStatus, setLeadStatus] = useState("");
  const [shortForm, setShortForm] = useState("");
  const [colorCode, setColorCode] = useState("#000000");

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkData, setBulkData] = useState([]);

  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const [bulkSaveConfirmOpen, setBulkSaveConfirmOpen] = useState(false);
  const [bulkSaveCount, setBulkSaveCount] = useState(0);

  const fetchLeadStatuses = async () => {
    if (!companyId) {
      toast.error("Company ID not found");
      return;
    }

    setLoading(true);
    try {
      const res = await get(`/lead-status?companyId=${companyId}`);
      setLeadStatuses(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setLeadStatuses([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeadStatuses();
  }, [companyId]);

  const resetForm = () => {
    setLeadStatus("");
    setShortForm("");
    setColorCode("#000000");
    setEditingStatus(null);
  };

  const handleSave = async () => {
    if (!leadStatus.trim() || !shortForm.trim() || !colorCode.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (!companyId) {
      toast.error("Company ID not found");
      return;
    }

    setSaving(true);
    try {
      if (editingStatus) {
        await put(`/lead-status/${editingStatus._id}`, {
          leadStatus,
          shortForm,
          colorCode,
          companyId,
        });
        toast.success("Lead status updated");
      } else {
        await post("/lead-status", {
          leadStatus,
          shortForm,
          colorCode,
          companyId,
        });
        toast.success("Lead status added");
      }
      resetForm();
      setOpenDialog(false);
      await fetchLeadStatuses();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (status) => {
    setEditingStatus(status);
    setLeadStatus(status.leadStatus);
    setShortForm(status.shortForm);
    setColorCode(status.colorCode);
    setOpenDialog(true);
  };

  const initiateDelete = (status) => {
    setDeleteTarget(status);
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
      await del(`/lead-status/${deleteTarget._id}`, { companyId });
      setSelected((prev) => prev.filter((i) => i !== deleteTarget._id));
      await fetchLeadStatuses();
      toast.success("Lead status deleted");
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
        selected.map(id => del(`/lead-status/${id}`, { companyId }))
      );
      setSelected([]);
      setSelectAll(false);
      await fetchLeadStatuses();
      toast.success("Selected lead statuses deleted");
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
      setSelected(leadStatuses.map((s) => s._id));
      setSelectAll(true);
    }
  };

  const initiateBulkSave = () => {
    if (!Array.isArray(bulkData) || bulkData.length === 0) {
      toast.error("No items to save.");
      return;
    }
    
    const invalid = bulkData.some((d) => !d.leadStatus?.trim() || !d.shortForm?.trim() || !d.colorCode?.trim());
    
    if (invalid) {
      toast.error("All fields must be filled before saving.");
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
          put(`/lead-status/${d._id}`, {
            leadStatus: d.leadStatus,
            shortForm: d.shortForm,
            colorCode: d.colorCode,
            companyId,
          })
        )
      );
      setIsBulkEditing(false);
      await fetchLeadStatuses();
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
        <h2 className="text-xl font-semibold">Lead Status Master</h2>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={initiateBulkDelete}>
              Delete Selected ({selected.length})
            </Button>
          )}
          
          {leadStatuses.length > 0 && (
            <Button
              variant={isBulkEditing ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkEditing((prev) => !prev);
                setBulkData(leadStatuses.map((d) => ({ ...d })));
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
            Add Lead Status
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="table-fixed w-full min-w-[900px]">
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
              <TableHead className="w-[250px]">Lead Status</TableHead>
              <TableHead className="w-[150px]">Short Form</TableHead>
              <TableHead className="w-[120px]">Color Code</TableHead>
              <TableHead className="w-[80px]">Color</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <Loading />
                </TableCell>
              </TableRow>
            ) : leadStatuses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No lead statuses found.
                </TableCell>
              </TableRow>
            ) : (
              leadStatuses.map((status, index) => (
                <TableRow
                  className={cn(
                    isBulkEditing &&
                      "bg-muted/40 hover:bg-muted/60 transition-colors"
                  )}
                  key={status._id}
                >
                  <TableCell>
                    <Checkbox
                      className={cn(
                        "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
                        "data-[state=unchecked]:bg-background data-[state=unchecked]:border-muted-foreground",
                        "hover:border-foreground transition-colors"
                      )}
                      checked={selected.includes(status._id)}
                      onCheckedChange={() => handleSelect(status._id)}
                      disabled={bulkSaving}
                    />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  
                  <TableCell>
                    {isBulkEditing ? (
                      <Input
                        value={
                          bulkData.find((item) => item._id === status._id)
                            ?.leadStatus || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setBulkData((prev) =>
                            prev.map((item) =>
                              item._id === status._id
                                ? { ...item, leadStatus: value }
                                : item
                            )
                          );
                        }}
                        disabled={bulkSaving}
                        className="min-w-[200px]"
                      />
                    ) : (
                      status.leadStatus
                    )}
                  </TableCell>

                  <TableCell>
                    {isBulkEditing ? (
                      <Input
                        value={
                          bulkData.find((item) => item._id === status._id)
                            ?.shortForm || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setBulkData((prev) =>
                            prev.map((item) =>
                              item._id === status._id
                                ? { ...item, shortForm: value }
                                : item
                            )
                          );
                        }}
                        disabled={bulkSaving}
                        className="min-w-[120px]"
                      />
                    ) : (
                      status.shortForm
                    )}
                  </TableCell>

                  <TableCell>
                    {isBulkEditing ? (
                      <Input
                        type="color"
                        value={
                          bulkData.find((item) => item._id === status._id)
                            ?.colorCode || "#000000"
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setBulkData((prev) =>
                            prev.map((item) =>
                              item._id === status._id
                                ? { ...item, colorCode: value }
                                : item
                            )
                          );
                        }}
                        disabled={bulkSaving}
                        className="w-[80px] h-8"
                      />
                    ) : (
                      status.colorCode
                    )}
                  </TableCell>

                  <TableCell>
                    <div
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: status.colorCode }}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(status)}
                        disabled={bulkSaving}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => initiateDelete(status)}
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingStatus ? "Edit Lead Status" : "Add Lead Status"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="leadStatus">Lead Status <span className="text-red-500">*</span></Label>
              <Input
                id="leadStatus"
                placeholder="Enter lead status"
                value={leadStatus}
                onChange={(e) => setLeadStatus(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortForm">Short Form <span className="text-red-500">*</span></Label>
              <Input
                id="shortForm"
                placeholder="Enter short form"
                value={shortForm}
                onChange={(e) => setShortForm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="colorCode">Color Code <span className="text-red-500">*</span></Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  id="colorCode"
                  value={colorCode}
                  onChange={(e) => setColorCode(e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={colorCode}
                  onChange={(e) => setColorCode(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
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
                <Spinner>{editingStatus ? "Updating..." : "Adding..."}</Spinner>
              ) : editingStatus ? (
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
            <AlertDialogTitle>Delete Lead Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete lead status{" "}
              <strong>{deleteTarget?.leadStatus}</strong>? This action can be undone
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
            <AlertDialogTitle>Delete Selected Lead Statuses</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selected.length}</strong>{" "}
              selected lead status{selected.length > 1 ? "es" : ""}? This action will
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

export default LeadStatusPage;