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
import Loading from "@/components/loading";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DepartmentPage = () => {
  const [items, setItems] = useState([]); // departments
  const [deptTypes, setDeptTypes] = useState([]); // department types for dropdown
  const [deptSubTypes, setDeptSubTypes] = useState([]); // department subtypes for dropdown
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [departmentType, setDepartmentType] = useState(""); // id
  const [departmentSubType, setDepartmentSubType] = useState(""); // id
  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");

  // delete
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await get("/department");
      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setItems([]);
      toast.error("Failed to fetch departments");
    }
    setLoading(false);
  };

  const fetchDeptTypes = async () => {
    try {
      const res = await get("/department-type");
      setDeptTypes(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to fetch department types", err);
      setDeptTypes([]);
    }
  };

  const fetchDeptSubTypes = async () => {
    try {
      const res = await get("/department-sub-type");
      setDeptSubTypes(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to fetch department sub-types", err);
      setDeptSubTypes([]);
    }
  };

  useEffect(() => {
    fetchDeptTypes();
    fetchDeptSubTypes();
    fetchItems();
  }, []);

  const resetForm = () => {
    setDepartmentType("");
    setDepartmentSubType("");
    setDepartmentName("");
    setDepartmentCode("");
    setEditingItem(null);
  };

  const handleSave = async () => {
    if (!departmentType) {
      toast.error("Please select Department Type");
      return;
    }
    if (!departmentSubType) {
      toast.error("Please select Department Sub-Type");
      return;
    }
    if (!departmentName.trim()) {
      toast.error("Department Name is required");
      return;
    }
    if (!departmentCode.trim()) {
      toast.error("Department Code is required");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await put(`/department/${editingItem._id}`, {
          departmentType,
          departmentSubType,
          departmentName,
          departmentCode,
        });
        toast.success("Department updated");
      } else {
        await post("/department", {
          departmentType,
          departmentSubType,
          departmentName,
          departmentCode,
        });
        toast.success("Department added");
      }

      resetForm();
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
    setDepartmentType(item.departmentType?._id || item.departmentType || "");
    setDepartmentSubType(
      item.departmentSubType?._id || item.departmentSubType || ""
    );
    setDepartmentName(item.departmentName || "");
    setDepartmentCode(item.departmentCode || "");
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
      await del(`/department/${deleteTarget._id}`);
      await fetchItems();
      toast.success("Department deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setSingleDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Department Master</h2>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              // prepare default when opening add dialog
              resetForm();
              setOpenDialog(true);
            }}
          >
            Add
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/12 text-left">Sr</TableHead>
            <TableHead className="w-3/12 text-left">Department Name</TableHead>
            <TableHead className="w-2/12 text-left">Code</TableHead>
            <TableHead className="w-3/12 text-left">
              Department Type / Sub-Type
            </TableHead>
            <TableHead className="w-3/12 text-left">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5}>
                <Loading />
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>No records found.</TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => (
              <TableRow key={item._id}>
                <TableCell>{index + 1}</TableCell>

                <TableCell>{item.departmentName}</TableCell>

                <TableCell>{item.departmentCode}</TableCell>

                <TableCell>
                  <div className="text-sm">
                    <div>
                      {item.departmentType?.name || item.departmentType || "-"}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {item.departmentSubType?.name ||
                        item.departmentSubType ||
                        "-"}
                    </div>
                  </div>
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
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Department" : "Add Department"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <div>
              <Select value={departmentType} onValueChange={setDepartmentType}>
                <SelectTrigger className="w-full rounded-md border p-2 text-sm">
                  <SelectValue placeholder="Select Department Type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {deptTypes.map((dt) => (
                      <SelectItem key={dt._id} value={dt._id}>
                        {dt.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={departmentSubType}
                onValueChange={setDepartmentSubType}
              >
                <SelectTrigger className="w-full rounded-md border p-2 text-sm">
                  <SelectValue placeholder="Select Department Sub-Type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {deptSubTypes.map((st) => (
                      <SelectItem key={st._id} value={st._id}>
                        {st.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Input
              placeholder="Department name"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
            />

            <Input
              placeholder="Department code"
              value={departmentCode}
              onChange={(e) => setDepartmentCode(e.target.value)}
            />
          </div>

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
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.departmentName}</strong>?
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
    </div>
  );
};

export default DepartmentPage;
