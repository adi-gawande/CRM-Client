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

const SpecialitiesPage = () => {
  const [specialities, setSpecialities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // bulk edit Save All spinner
  const [bulkSaving, setBulkSaving] = useState(false);

  // bulk add Save All spinner
  const [bulkAdding, setBulkAdding] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingSpeciality, setEditingSpeciality] = useState(null);
  const [specialityName, setSpecialityName] = useState("");

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

  // Fetch
  const fetchSpecialities = async () => {
    setLoading(true);
    try {
      const res = await get("/speciality");
      setSpecialities(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setSpecialities([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSpecialities();
  }, []);

  // Save Single
  const handleSave = async () => {
    if (!specialityName.trim()) {
      toast.error("Speciality name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingSpeciality) {
        await put(`/speciality/${editingSpeciality._id}`, {
          name: specialityName,
        });
        toast.success("Speciality updated");
      } else {
        await post("/speciality", { name: specialityName });
        toast.success("Speciality added");
      }

      setSpecialityName("");
      setEditingSpeciality(null);
      setOpenDialog(false);
      await fetchSpecialities();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s) => {
    setEditingSpeciality(s);
    setSpecialityName(s.name);
    setOpenDialog(true);
  };

  // Delete Flows
  const initiateDelete = (s) => {
    setDeleteTarget(s);
    setSingleDeleteOpen(true);
  };

  const confirmSingleDelete = async () => {
    try {
      await del(`/speciality/${deleteTarget._id}`);
      setSelected((prev) => prev.filter((i) => i !== deleteTarget._id));
      await fetchSpecialities();
      toast.success("Deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setSingleDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // Bulk Delete
  const initiateBulkDelete = () => {
    if (selected.length === 0) return toast.error("Select at least one item");
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      for (const id of selected) await del(`/speciality/${id}`);
      setSelected([]);
      setSelectAll(false);
      await fetchSpecialities();
      toast.success("Deleted selected");
    } catch (err) {
      console.error(err);
      toast.error("Bulk delete failed");
    } finally {
      setBulkDeleteOpen(false);
    }
  };

  // Select
  const handleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      setSelected(specialities.map((d) => d._id));
      setSelectAll(true);
    }
  };

  // ---------------- BULK EDIT ----------------
  const initiateBulkSave = () => {
    if (bulkData.some((d) => !d.name.trim()))
      return toast.error("Empty names not allowed");

    setBulkSaveCount(bulkData.length);
    setBulkSaveConfirmOpen(true);
  };

  const confirmBulkSave = async () => {
    setBulkSaving(true);
    setBulkSaveConfirmOpen(false);

    try {
      for (const d of bulkData)
        await put(`/speciality/${d._id}`, { name: d.name });
      setIsBulkEditing(false);
      await fetchSpecialities();
      toast.success("Bulk saved");
    } catch (err) {
      console.error(err);
      toast.error("Bulk save failed");
    } finally {
      setBulkSaving(false);
    }
  };

  // ---------------- BULK ADD ----------------
  const initiateBulkAdd = () => {
    const lines = bulkAddText
      .split("\n")
      .map((x) => x.trim())
      .filter((x) => x);

    if (lines.length === 0) return toast.error("Enter at least one speciality");

    setBulkAddLinesCache(lines);
    setBulkAddCount(lines.length);
    setBulkAddConfirmOpen(true);
  };

  const confirmBulkAdd = async () => {
    setBulkAddConfirmOpen(false);
    setBulkAdding(true);

    try {
      for (const name of bulkAddLinesCache) await post("/speciality", { name });

      setBulkAddText("");
      await fetchSpecialities();
      toast.success("Specialities added");
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
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Super Specialities Master</h2>

        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={initiateBulkDelete}>
              Delete Selected ({selected.length})
            </Button>
          )}

          {specialities.length > 0 && (
            <Button
              variant={isBulkEditing ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkEditing(!isBulkEditing);
                setBulkData(specialities.map((d) => ({ ...d })));
              }}
            >
              {isBulkEditing ? "Cancel" : "Bulk Edit"}
            </Button>
          )}

          {isBulkEditing && (
            <Button
              onClick={initiateBulkSave}
              disabled={bulkSaving}
              variant="default"
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

          <Button onClick={() => setOpenDialog(true)}>Add Speciality</Button>
        </div>
      </div>

      {/* Bulk Add Dialog */}
      <Dialog
        open={bulkAddOpen}
        onOpenChange={(o) => {
          if (!o && bulkAdding) return;
          setBulkAddOpen(o);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Add Specialities</DialogTitle>
          </DialogHeader>

          <textarea
            className="w-full min-h-[200px] border rounded p-2 text-sm"
            placeholder="Cardiology\nNeurology\nOrthopedics"
            value={bulkAddText}
            onChange={(e) => setBulkAddText(e.target.value)}
            disabled={bulkAdding}
          />

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setBulkAddOpen(false)}
              disabled={bulkAdding}
            >
              Cancel
            </Button>

            <Button onClick={initiateBulkAdd} disabled={bulkAdding}>
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
              <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
            </TableHead>
            <TableHead className="w-1/12 text-left">Sr No</TableHead>
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
          ) : specialities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>No specialities found.</TableCell>
            </TableRow>
          ) : (
            specialities.map((s, index) => (
              <TableRow
                key={s._id}
                className={isBulkEditing ? "bg-muted/40" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.includes(s._id)}
                    onCheckedChange={() => handleSelect(s._id)}
                  />
                </TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {isBulkEditing ? (
                    <Input
                      value={bulkData.find((x) => x._id === s._id)?.name || ""}
                      onChange={(e) => {
                        const name = e.target.value;
                        setBulkData((prev) =>
                          prev.map((x) =>
                            x._id === s._id ? { ...x, name } : x
                          )
                        );
                      }}
                      disabled={bulkSaving}
                    />
                  ) : (
                    s.name
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(s)}
                      disabled={bulkSaving}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => initiateDelete(s)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSpeciality ? "Edit Speciality" : "Add Speciality"}
            </DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Speciality name"
            value={specialityName}
            onChange={(e) => setSpecialityName(e.target.value)}
          />

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Spinner>
                  {editingSpeciality ? "Updating..." : "Adding..."}
                </Spinner>
              ) : editingSpeciality ? (
                "Update"
              ) : (
                "Add"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Single */}
      <AlertDialog open={singleDeleteOpen} onOpenChange={setSingleDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Speciality</AlertDialogTitle>
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

      {/* Delete Bulk */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Specialities</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{selected.length}</strong> items?
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

      {/* Bulk Edit Confirm */}
      <AlertDialog
        open={bulkSaveConfirmOpen}
        onOpenChange={setBulkSaveConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Bulk Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Save <strong>{bulkSaveCount}</strong> items?
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

      {/* Bulk Add Confirm */}
      <AlertDialog
        open={bulkAddConfirmOpen}
        onOpenChange={setBulkAddConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Add</AlertDialogTitle>
            <AlertDialogDescription>
              Add <strong>{bulkAddCount}</strong> specialit
              {bulkAddCount > 1 ? "ies" : "y"}?
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

export default SpecialitiesPage;
