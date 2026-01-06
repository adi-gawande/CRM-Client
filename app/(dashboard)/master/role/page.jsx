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

const RolePage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // bulk edit Save All spinner
  const [bulkSaving, setBulkSaving] = useState(false);

  // bulk add Save All spinner
  const [bulkAdding, setBulkAdding] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleName, setRoleName] = useState("");

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkData, setBulkData] = useState([]);

  // Bulk Add
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [bulkAddText, setBulkAddText] = useState("");

  // Delete dialogs
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Confirm dialogs
  const [bulkSaveConfirmOpen, setBulkSaveConfirmOpen] = useState(false);
  const [bulkAddConfirmOpen, setBulkAddConfirmOpen] = useState(false);

  const [bulkSaveCount, setBulkSaveCount] = useState(0);
  const [bulkAddCount, setBulkAddCount] = useState(0);

  const [bulkAddLinesCache, setBulkAddLinesCache] = useState([]);

  // Fetch roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await get("/role");
      setRoles(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setRoles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Save single
  const handleSave = async () => {
    if (!roleName.trim()) return toast.error("Role name is required");

    setSaving(true);
    try {
      if (editingRole) {
        await put(`/role/${editingRole._id}`, { name: roleName });
        toast.success("Role updated");
      } else {
        await post("/role", { name: roleName });
        toast.success("Role added");
      }

      setRoleName("");
      setEditingRole(null);
      setOpenDialog(false);
      await fetchRoles();
    } catch (err) {
      console.error(err);
      toast.error("Error saving role");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setOpenDialog(true);
  };

  // Delete flows
  const initiateDelete = (role) => {
    setDeleteTarget(role);
    setSingleDeleteOpen(true);
  };

  const confirmSingleDelete = async () => {
    try {
      await del(`/role/${deleteTarget._id}`);
      setSelected((prev) => prev.filter((i) => i !== deleteTarget._id));
      await fetchRoles();
      toast.success("Role deleted");
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setDeleteTarget(null);
      setSingleDeleteOpen(false);
    }
  };

  // Bulk delete
  const initiateBulkDelete = () => {
    if (selected.length === 0) return toast.error("Select at least one role");
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      for (const id of selected) await del(`/role/${id}`);
      setSelected([]);
      setSelectAll(false);
      await fetchRoles();
      toast.success("Selected roles deleted");
    } catch (err) {
      toast.error("Bulk delete failed");
    } finally {
      setBulkDeleteOpen(false);
    }
  };

  // Selection
  const handleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      setSelected(roles.map((r) => r._id));
      setSelectAll(true);
    }
  };

  // ---------------- BULK EDIT ----------------
  const initiateBulkSave = () => {
    if (bulkData.some((d) => !d.name.trim()))
      return toast.error("Empty names are not allowed");

    setBulkSaveCount(bulkData.length);
    setBulkSaveConfirmOpen(true);
  };

  const confirmBulkSave = async () => {
    setBulkSaving(true);
    setBulkSaveConfirmOpen(false);

    try {
      for (const r of bulkData) await put(`/role/${r._id}`, { name: r.name });

      setIsBulkEditing(false);
      await fetchRoles();
      toast.success("Bulk save complete");
    } catch (err) {
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

    if (lines.length === 0) return toast.error("Enter at least one role");

    setBulkAddLinesCache(lines);
    setBulkAddCount(lines.length);
    setBulkAddConfirmOpen(true);
  };

  const confirmBulkAdd = async () => {
    setBulkAddConfirmOpen(false);
    setBulkAdding(true);

    try {
      for (const name of bulkAddLinesCache) await post("/role", { name });

      setBulkAddText("");
      await fetchRoles();
      toast.success("Roles added");
      setBulkAddOpen(false);
    } catch (err) {
      toast.error("Bulk add failed");
    } finally {
      setBulkAdding(false);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Employee Role Master</h2>

        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={initiateBulkDelete}>
              Delete Selected ({selected.length})
            </Button>
          )}

          {roles.length > 0 && (
            <Button
              variant={isBulkEditing ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkEditing(!isBulkEditing);
                setBulkData(roles.map((r) => ({ ...r })));
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
            disabled={bulkAdding}
          >
            Bulk Add
          </Button>

          <Button onClick={() => setOpenDialog(true)}>Add Role</Button>
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
            <DialogTitle>Bulk Add Roles</DialogTitle>
          </DialogHeader>

          <textarea
            className="w-full min-h-[200px] border rounded p-2 text-sm"
            placeholder={`Admin\nNurse\nDoctor\nReceptionist`}
            value={bulkAddText}
            onChange={(e) => setBulkAddText(e.target.value)}
            disabled={bulkAdding}
          />

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setBulkAddOpen(false)}>
              Cancel
            </Button>

            <Button onClick={initiateBulkAdd} disabled={bulkAdding}>
              {bulkAdding ? <Spinner>Adding...</Spinner> : "Save All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Table */}
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/12">
              <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
            </TableHead>
            <TableHead className="w-1/12">Sr No</TableHead>
            <TableHead className="w-7/12">Name</TableHead>
            <TableHead className="w-3/12">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Loading />
              </TableCell>
            </TableRow>
          ) : roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>No roles found.</TableCell>
            </TableRow>
          ) : (
            roles.map((role, index) => (
              <TableRow
                key={role._id}
                className={isBulkEditing ? "bg-muted/40" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.includes(role._id)}
                    onCheckedChange={() => handleSelect(role._id)}
                  />
                </TableCell>

                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  {isBulkEditing ? (
                    <Input
                      value={
                        bulkData.find((x) => x._id === role._id)?.name || ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setBulkData((prev) =>
                          prev.map((x) =>
                            x._id === role._id ? { ...x, name: val } : x
                          )
                        );
                      }}
                    />
                  ) : (
                    role.name
                  )}
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(role)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => initiateDelete(role)}
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
            <DialogTitle>{editingRole ? "Edit Role" : "Add Role"}</DialogTitle>
          </DialogHeader>

          <Input
            placeholder="Role name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Spinner>{editingRole ? "Updating..." : "Adding..."}</Spinner>
              ) : editingRole ? (
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
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
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
            <AlertDialogTitle>Delete Selected Roles</AlertDialogTitle>
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

      {/* Confirm Bulk Save */}
      <AlertDialog
        open={bulkSaveConfirmOpen}
        onOpenChange={setBulkSaveConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Bulk Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Save <strong>{bulkSaveCount}</strong> updated role
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

      {/* Confirm Bulk Add */}
      <AlertDialog
        open={bulkAddConfirmOpen}
        onOpenChange={setBulkAddConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Add</AlertDialogTitle>
            <AlertDialogDescription>
              Add <strong>{bulkAddCount}</strong> new role
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

export default RolePage;
