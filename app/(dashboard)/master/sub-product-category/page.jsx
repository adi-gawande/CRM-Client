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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const SubProductCategoryPage = () => {
  const { companyId } = useSelector((state) => state.auth.auth);

  const [subProductCategories, setSubProductCategories] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [productCategoryId, setProductCategoryId] = useState("");
  const [subProductName, setSubProductName] = useState("");

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkData, setBulkData] = useState([]);

  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const [bulkSaveConfirmOpen, setBulkSaveConfirmOpen] = useState(false);
  const [bulkSaveCount, setBulkSaveCount] = useState(0);

  const fetchSubProductCategories = async () => {
    if (!companyId) {
      toast.error("Company ID not found");
      return;
    }

    setLoading(true);
    try {
      const res = await get(`/sub-product-category?companyId=${companyId}`);
      setSubProductCategories(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setSubProductCategories([]);
    }
    setLoading(false);
  };

  const fetchProductCategories = async () => {
    if (!companyId) return;

    try {
      const res = await get(`/product-category?companyId=${companyId}`);
      setProductCategories(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setProductCategories([]);
    }
  };

  useEffect(() => {
    fetchSubProductCategories();
    fetchProductCategories();
  }, [companyId]);

  const resetForm = () => {
    setProductCategoryId("");
    setSubProductName("");
    setEditingCategory(null);
  };

  const handleSave = async () => {
    if (!productCategoryId || !subProductName.trim()) {
      toast.error("Product category and sub product name are required");
      return;
    }

    if (!companyId) {
      toast.error("Company ID not found");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await put(`/sub-product-category/${editingCategory._id}`, {
          productCategoryId,
          subProductName,
          companyId,
        });
        toast.success("Sub product category updated");
      } else {
        await post("/sub-product-category", {
          productCategoryId,
          subProductName,
          companyId,
        });
        toast.success("Sub product category added");
      }
      resetForm();
      setOpenDialog(false);
      await fetchSubProductCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setProductCategoryId(category.productCategoryId._id);
    setSubProductName(category.subProductName);
    setOpenDialog(true);
  };

  const initiateDelete = (category) => {
    setDeleteTarget(category);
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
      await del(`/sub-product-category/${deleteTarget._id}`, { companyId });
      setSelected((prev) => prev.filter((i) => i !== deleteTarget._id));
      await fetchSubProductCategories();
      toast.success("Sub product category deleted");
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
        selected.map(id => del(`/sub-product-category/${id}`, { companyId }))
      );
      setSelected([]);
      setSelectAll(false);
      await fetchSubProductCategories();
      toast.success("Selected sub product categories deleted");
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
      setSelected(subProductCategories.map((c) => c._id));
      setSelectAll(true);
    }
  };

  const initiateBulkSave = () => {
    if (!Array.isArray(bulkData) || bulkData.length === 0) {
      toast.error("No items to save.");
      return;
    }
    
    const invalid = bulkData.some((d) => !d.subProductName?.trim() || !d.productCategoryId);
    
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
          put(`/sub-product-category/${d._id}`, {
            productCategoryId: d.productCategoryId,
            subProductName: d.subProductName,
            companyId,
          })
        )
      );
      setIsBulkEditing(false);
      await fetchSubProductCategories();
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
        <h2 className="text-xl font-semibold">Sub Product Category Master</h2>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={initiateBulkDelete}>
              Delete Selected ({selected.length})
            </Button>
          )}
          
          {subProductCategories.length > 0 && (
            <Button
              variant={isBulkEditing ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkEditing((prev) => !prev);
                setBulkData(subProductCategories.map((d) => ({ 
                  ...d, 
                  productCategoryId: d.productCategoryId._id 
                })));
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
            Add Sub Product Category
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="table-fixed w-full min-w-[800px]">
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
              <TableHead className="w-[200px]">Product Name</TableHead>
              <TableHead className="w-[250px]">Sub Product Name</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <Loading />
                </TableCell>
              </TableRow>
            ) : subProductCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No sub product categories found.
                </TableCell>
              </TableRow>
            ) : (
              subProductCategories.map((category, index) => (
                <TableRow
                  className={cn(
                    isBulkEditing &&
                      "bg-muted/40 hover:bg-muted/60 transition-colors"
                  )}
                  key={category._id}
                >
                  <TableCell>
                    <Checkbox
                      className={cn(
                        "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
                        "data-[state=unchecked]:bg-background data-[state=unchecked]:border-muted-foreground",
                        "hover:border-foreground transition-colors"
                      )}
                      checked={selected.includes(category._id)}
                      onCheckedChange={() => handleSelect(category._id)}
                      disabled={bulkSaving}
                    />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  
                  <TableCell>
                    {isBulkEditing ? (
                      <Select
                        value={
                          bulkData.find((item) => item._id === category._id)
                            ?.productCategoryId || ""
                        }
                        onValueChange={(value) => {
                          setBulkData((prev) =>
                            prev.map((item) =>
                              item._id === category._id
                                ? { ...item, productCategoryId: value }
                                : item
                            )
                          );
                        }}
                        disabled={bulkSaving}
                      >
                        <SelectTrigger className="min-w-[180px]">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {productCategories.map((pc) => (
                            <SelectItem key={pc._id} value={pc._id}>
                              {pc.productName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      category.productCategoryId?.productName || "N/A"
                    )}
                  </TableCell>

                  <TableCell>
                    {isBulkEditing ? (
                      <Input
                        value={
                          bulkData.find((item) => item._id === category._id)
                            ?.subProductName || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setBulkData((prev) =>
                            prev.map((item) =>
                              item._id === category._id
                                ? { ...item, subProductName: value }
                                : item
                            )
                          );
                        }}
                        disabled={bulkSaving}
                        className="min-w-[200px]"
                      />
                    ) : (
                      category.subProductName
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(category)}
                        disabled={bulkSaving}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => initiateDelete(category)}
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
              {editingCategory ? "Edit Sub Product Category" : "Add Sub Product Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="productCategory">Product Name <span className="text-red-500">*</span></Label>
              <Select value={productCategoryId} onValueChange={setProductCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product category" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((pc) => (
                    <SelectItem key={pc._id} value={pc._id}>
                      {pc.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subProductName">Sub Product Name <span className="text-red-500">*</span></Label>
              <Input
                id="subProductName"
                placeholder="Enter sub product name"
                value={subProductName}
                onChange={(e) => setSubProductName(e.target.value)}
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
                <Spinner>{editingCategory ? "Updating..." : "Adding..."}</Spinner>
              ) : editingCategory ? (
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
            <AlertDialogTitle>Delete Sub Product Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete sub product category{" "}
              <strong>{deleteTarget?.subProductName}</strong>? This action can be undone
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
            <AlertDialogTitle>Delete Selected Sub Product Categories</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selected.length}</strong>{" "}
              selected sub product categor{selected.length > 1 ? "ies" : "y"}? This action will
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

export default SubProductCategoryPage;