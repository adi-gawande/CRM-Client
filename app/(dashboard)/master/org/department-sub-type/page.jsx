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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DepartmentSubTypePage = () => {
  const [items, setItems] = useState([]); // department sub-types
  const [deptTypes, setDeptTypes] = useState([]); // department types for dropdown
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // bulk save for edit
  const [bulkSaving, setBulkSaving] = useState(false);

  // bulk add
  const [bulkAdding, setBulkAdding] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemDeptType, setItemDeptType] = useState(""); // id

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkData, setBulkData] = useState([]); // each item: {_id, name, departmentType: id }

  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [bulkAddText, setBulkAddText] = useState("");

  // delete
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Confirm dialogs
  const [bulkSaveConfirmOpen, setBulkSaveConfirmOpen] = useState(false);
  const [bulkAddConfirmOpen, setBulkAddConfirmOpen] = useState(false);
  const [bulkSaveCount, setBulkSaveCount] = useState(0);
  const [bulkAddCount, setBulkAddCount] = useState(0);
  const [bulkAddLinesCache, setBulkAddLinesCache] = useState([]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await get("/department-sub-type");
      setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setItems([]);
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

  useEffect(() => {
    fetchDeptTypes();
    fetchItems();
  }, []);

  const handleSave = async () => {
    if (!itemName.trim()) {
      toast.error("Sub-Type name is required");
      return;
    }
    if (!itemDeptType) {
      toast.error("Please select Department Type");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await put(`/department-sub-type/${editingItem._id}`, {
          name: itemName,
          departmentType: itemDeptType,
        });
        toast.success("Department Sub-Type updated");
      } else {
        await post("/department-sub-type", {
          name: itemName,
          departmentType: itemDeptType,
        });
        toast.success("Department Sub-Type added");
      }

      setItemName("");
      setItemDeptType("");
      setEditingItem(null);
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
    setItemName(item.name || "");
    setItemDeptType(item.departmentType?._id || item.departmentType || "");
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
      await del(`/department-sub-type/${deleteTarget._id}`);
      setSelected((prev) => prev.filter((i) => i !== deleteTarget._id));
      await fetchItems();
      toast.success("Department Sub-Type deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setSingleDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const initiateBulkDelete = () => {
    if (selected.length === 0) {
      toast.error("Please select at least one");
      return;
    }
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      for (const id of selected) {
        await del(`/department-sub-type/${id}`);
      }
      setSelected([]);
      setSelectAll(false);
      await fetchItems();
      toast.success("Selected Department Sub-Types deleted");
    } catch (err) {
      console.error(err);
      toast.error("Bulk delete failed");
    } finally {
      setBulkDeleteOpen(false);
    }
  };

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
      setSelected(items.map((i) => i._id));
      setSelectAll(true);
    }
  };

  // Bulk Edit
  const initiateBulkSave = () => {
    if (!bulkData.length) {
      toast.error("No items to save.");
      return;
    }

    const empty = bulkData.some((d) => !d.name.trim() || !d.departmentType);
    if (empty) {
      toast.error("All names and department types must be non-empty.");
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
        await put(`/department-sub-type/${d._id}`, {
          name: d.name,
          departmentType: d.departmentType,
        });
      }
      setIsBulkEditing(false);
      await fetchItems();
      toast.success("Bulk changes saved");
    } catch (err) {
      console.error(err);
      toast.error("Bulk save failed");
    } finally {
      setBulkSaving(false);
    }
  };

  // Bulk Add
  // Accept lines either "SubTypeName|DepartmentTypeName" or "SubTypeName" (only when exactly 1 dept type exists)
  const initiateBulkAdd = () => {
    const lines = bulkAddText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l !== "");

    if (!lines.length) {
      toast.error("Please enter at least one name");
      return;
    }

    // Parse lines
    const parsed = [];
    const missingDeptTypes = new Set();

    for (const line of lines) {
      if (line.includes("|")) {
        const [namePart, deptTypePart] = line.split("|").map((s) => s.trim());
        if (!namePart) {
          toast.error("Invalid line format, missing name.");
          return;
        }
        // find deptType by name (case-insensitive)
        const found = deptTypes.find(
          (dt) => dt.name.toLowerCase() === deptTypePart.toLowerCase()
        );
        if (!found) {
          missingDeptTypes.add(deptTypePart);
        } else {
          parsed.push({ name: namePart, departmentType: found._id });
        }
      } else {
        // no pipe
        if (deptTypes.length === 1) {
          parsed.push({ name: line, departmentType: deptTypes[0]._id });
        } else {
          // ambiguous — require explicit department type when multiple exist
          toast.error(
            `When multiple Department Types exist, each line must be "SubTypeName|DepartmentTypeName". Example: "Serology|Diagnostic".`
          );
          return;
        }
      }
    }

    if (missingDeptTypes.size > 0) {
      toast.error(
        `Unknown Department Type(s): ${[...missingDeptTypes].join(", ")}`
      );
      return;
    }

    setBulkAddLinesCache(parsed);
    setBulkAddCount(parsed.length);
    setBulkAddConfirmOpen(true);
  };

  const confirmBulkAdd = async () => {
    setBulkAddConfirmOpen(false);
    setBulkAdding(true);

    try {
      for (const p of bulkAddLinesCache) {
        await post("/department-sub-type", {
          name: p.name,
          departmentType: p.departmentType,
        });
      }

      setBulkAddText("");
      setBulkAddLinesCache([]);
      await fetchItems();
      toast.success("Bulk items added");
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
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Department Sub-Type Master</h2>

        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={initiateBulkDelete}>
              Delete Selected ({selected.length})
            </Button>
          )}

          {items.length > 0 && (
            <Button
              variant={isBulkEditing ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkEditing((prev) => !prev);
                // normalize bulkData to have departmentType as id
                setBulkData(
                  items.map((d) => ({
                    ...d,
                    departmentType:
                      (d.departmentType && d.departmentType._id) ||
                      d.departmentType ||
                      "",
                  }))
                );
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
          >
            Bulk Add
          </Button>

          <Button
            onClick={() => {
              // prepare dropdown default when opening add dialog
              if (deptTypes.length === 1) {
                setItemDeptType(deptTypes[0]._id);
              } else {
                setItemDeptType("");
              }
              setItemName("");
              setEditingItem(null);
              setOpenDialog(true);
            }}
          >
            Add
          </Button>
        </div>
      </div>

      {/* BULK ADD DIALOG */}
      <Dialog
        open={bulkAddOpen}
        onOpenChange={(open) => {
          if (bulkAdding && !open) return;
          setBulkAddOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bulk Add Department Sub-Types</DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            <p className="text-sm text-muted-foreground mb-2">
              Paste one sub-type per line. Format options:
            </p>
            <ul className="text-sm list-disc ml-5 mb-2">
              <li>
                <code>SubTypeName|DepartmentTypeName</code> — recommended when
                you have multiple Department Types.
              </li>
              <li>
                <code>SubTypeName</code> — allowed only if there is exactly one
                Department Type in the system (it will be assigned
                automatically).
              </li>
            </ul>

            <textarea
              className="w-full min-h-[200px] border p-2 text-sm rounded-md"
              placeholder={`Serology|Diagnostic\nMicrobiology|Diagnostic\nHistopathology|Diagnostic`}
              value={bulkAddText}
              onChange={(e) => setBulkAddText(e.target.value)}
              disabled={bulkAdding}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={initiateBulkAdd} disabled={bulkAdding}>
              {bulkAdding ? <Spinner>Adding...</Spinner> : "Save All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TABLE */}
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/12 text-left">
              <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
            </TableHead>
            <TableHead className="w-1/12 text-left">Sr</TableHead>
            <TableHead className="w-4/12 text-left">Name</TableHead>
            <TableHead className="w-4/12 text-left">Department Type</TableHead>
            <TableHead className="w-2/12 text-left">Actions</TableHead>
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
                <TableCell>
                  <Checkbox
                    checked={selected.includes(item._id)}
                    onCheckedChange={() => handleSelect(item._id)}
                  />
                </TableCell>

                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  {isBulkEditing ? (
                    <Input
                      value={
                        bulkData.find((d) => d._id === item._id)?.name || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setBulkData((prev) =>
                          prev.map((d) =>
                            d._id === item._id ? { ...d, name: value } : d
                          )
                        );
                      }}
                    />
                  ) : (
                    item.name
                  )}
                </TableCell>

                <TableCell>
                  {isBulkEditing ? (
                    <select
                      className="w-full rounded-md border p-2 text-sm"
                      value={
                        bulkData.find((d) => d._id === item._id)
                          ?.departmentType || ""
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setBulkData((prev) =>
                          prev.map((d) =>
                            d._id === item._id
                              ? { ...d, departmentType: value }
                              : d
                          )
                        );
                      }}
                    >
                      <option value="">Select Department Type</option>
                      {deptTypes.map((dt) => (
                        <option key={dt._id} value={dt._id}>
                          {dt.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    // show name if populated
                    (item.departmentType && item.departmentType.name) ||
                    item.departmentType ||
                    "-"
                  )}
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
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? "Edit Department Sub-Type"
                : "Add Department Sub-Type"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <Input
              placeholder="Sub-Type name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />

            <Select value={itemDeptType} onValueChange={setItemDeptType}>
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
            <AlertDialogTitle>Delete Department Sub-Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>?
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

      {/* BULK DELETE */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{selected.length}</strong> selected item
              {selected.length > 1 ? "s" : ""}?
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

      {/* BULK SAVE CONFIRM */}
      <AlertDialog
        open={bulkSaveConfirmOpen}
        onOpenChange={setBulkSaveConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Bulk Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Save <strong>{bulkSaveCount}</strong> changes?
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

      {/* BULK ADD CONFIRM */}
      <AlertDialog
        open={bulkAddConfirmOpen}
        onOpenChange={setBulkAddConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Add</AlertDialogTitle>
            <AlertDialogDescription>
              Add <strong>{bulkAddCount}</strong> new item
              {bulkAddCount > 1 ? "s" : ""}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkAdd}>Add</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DepartmentSubTypePage;
