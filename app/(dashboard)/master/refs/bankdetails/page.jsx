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

const BankDetailsPage = () => {
  const { companyId } = useSelector((state) => state.auth.auth);

  const [bankDetails, setBankDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  
  // Form fields
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upi, setUpi] = useState("");

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkData, setBulkData] = useState([]);

  // Delete confirmations
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Bulk save confirm
  const [bulkSaveConfirmOpen, setBulkSaveConfirmOpen] = useState(false);
  const [bulkSaveCount, setBulkSaveCount] = useState(0);

  const fetchBankDetails = async () => {
    if (!companyId) {
      toast.error("Company ID not found");
      return;
    }

    setLoading(true);
    try {
      const res = await get(`/bank-details?companyId=${companyId}`);
      setBankDetails(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      setBankDetails([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBankDetails();
  }, [companyId]);

  const resetForm = () => {
    setAccountName("");
    setAccountNumber("");
    setBankName("");
    setBranch("");
    setIfsc("");
    setUpi("");
    setEditingBank(null);
  };

  const handleSave = async () => {
    if (!accountName.trim() || !accountNumber.trim() || !bankName.trim() || !branch.trim() || !ifsc.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!companyId) {
      toast.error("Company ID not found");
      return;
    }

    setSaving(true);
    try {
      if (editingBank) {
        await put(`/bank-details/${editingBank._id}`, {
          accountName,
          accountNumber,
          bankName,
          branch,
          ifsc,
          upi,
          companyId,
        });
        toast.success("Bank details updated");
      } else {
        await post("/bank-details", {
          accountName,
          accountNumber,
          bankName,
          branch,
          ifsc,
          upi,
          companyId,
        });
        toast.success("Bank details added");
      }
      resetForm();
      setOpenDialog(false);
      await fetchBankDetails();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (bank) => {
    setEditingBank(bank);
    setAccountName(bank.accountName);
    setAccountNumber(bank.accountNumber);
    setBankName(bank.bankName);
    setBranch(bank.branch);
    setIfsc(bank.ifsc);
    setUpi(bank.upi || "");
    setOpenDialog(true);
  };

  // Delete flows
  const initiateDelete = (bank) => {
    setDeleteTarget(bank);
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
      await del(`/bank-details/${deleteTarget._id}`, { companyId });
      setSelected((prev) => prev.filter((i) => i !== deleteTarget._id));
      await fetchBankDetails();
      toast.success("Bank details deleted");
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
      for (const id of selected) {
        // eslint-disable-next-line no-await-in-loop
        await del(`/bank-details/${id}`, { companyId });
      }
      setSelected([]);
      setSelectAll(false);
      await fetchBankDetails();
      toast.success("Selected bank details deleted");
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
      setSelected(bankDetails.map((b) => b._id));
      setSelectAll(true);
    }
  };

  const initiateBulkSave = () => {
    if (!Array.isArray(bulkData) || bulkData.length === 0) {
      toast.error("No items to save.");
      return;
    }
    
    const invalid = bulkData.some(
      (d) => !d.accountName?.trim() || !d.accountNumber?.trim() || 
             !d.bankName?.trim() || !d.branch?.trim() || !d.ifsc?.trim()
    );
    
    if (invalid) {
      toast.error("All required fields must be filled before saving.");
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
      for (const d of bulkData) {
        // eslint-disable-next-line no-await-in-loop
        await put(`/bank-details/${d._id}`, {
          accountName: d.accountName,
          accountNumber: d.accountNumber,
          bankName: d.bankName,
          branch: d.branch,
          ifsc: d.ifsc,
          upi: d.upi,
          companyId,
        });
      }
      setIsBulkEditing(false);
      await fetchBankDetails();
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
        <h2 className="text-xl font-semibold">Bank Details Master</h2>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={initiateBulkDelete}>
              Delete Selected ({selected.length})
            </Button>
          )}
          
          {bankDetails.length > 0 && (
            <Button
              variant={isBulkEditing ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkEditing((prev) => !prev);
                setBulkData(bankDetails.map((d) => ({ ...d })));
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
            Add Bank Details
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="table-fixed w-full min-w-[1000px]">
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
              <TableHead className="w-[150px]">Account Name</TableHead>
              <TableHead className="w-[140px]">Account Number</TableHead>
              <TableHead className="w-[140px]">Bank Name</TableHead>
              <TableHead className="w-[120px]">Branch</TableHead>
              <TableHead className="w-[100px]">IFSC</TableHead>
              <TableHead className="w-[120px]">UPI</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  <Loading />
                </TableCell>
              </TableRow>
            ) : bankDetails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  No bank details found.
                </TableCell>
              </TableRow>
            ) : (
              bankDetails.map((bank, index) => (
                <TableRow
                  className={cn(
                    isBulkEditing &&
                      "bg-muted/40 hover:bg-muted/60 transition-colors"
                  )}
                  key={bank._id}
                >
                  <TableCell>
                    <Checkbox
                      className={cn(
                        "data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground",
                        "data-[state=unchecked]:bg-background data-[state=unchecked]:border-muted-foreground",
                        "hover:border-foreground transition-colors"
                      )}
                      checked={selected.includes(bank._id)}
                      onCheckedChange={() => handleSelect(bank._id)}
                      disabled={bulkSaving}
                    />
                  </TableCell>
                  <TableCell>{index + 1}</TableCell>
                  
                  <TableCell>
                    {isBulkEditing ? (
                      <Input
                        value={
                          bulkData.find((item) => item._id === bank._id)
                            ?.accountName || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setBulkData((prev) =>
                            prev.map((item) =>
                              item._id === bank._id
                                ? { ...item, accountName: value }
                                : item
                            )
                          );
                        }}
                        disabled={bulkSaving}
                        className="min-w-[120px]"
                      />
                    ) : (
                      bank.accountName
                    )}
                  </TableCell>

                  <TableCell>
                    {isBulkEditing ? (
                      <Input
                        value={
                          bulkData.find((item) => item._id === bank._id)
                            ?.accountNumber || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setBulkData((prev) =>
                            prev.map((item) =>
                              item._id === bank._id
                                ? { ...item, accountNumber: value }
                                : item
                            )
                          );
                        }}
                        disabled={bulkSaving}
                        className="min-w-[120px]"
                      />
                    ) : (
                      bank.accountNumber
                    )}
                  </TableCell>

                  <TableCell>
                    {isBulkEditing ? (
                      <Input
                        value={
                          bulkData.find((item) => item._id === bank._id)
                            ?.bankName || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setBulkData((prev) =>
                            prev.map((item) =>
                              item._id === bank._id
                                ? { ...item, bankName: value }
                                : item
                            )
                          );
                        }}
                        disabled={bulkSaving}
                        className="min-w-[120px]"
                      />
                    ) : (
                      bank.bankName
                    )}
                  </TableCell>

                  <TableCell>
                    {isBulkEditing ? (
                      <Input
                        value={
                          bulkData.find((item) => item._id === bank._id)
                            ?.branch || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setBulkData((prev) =>
                            prev.map((item) =>
                              item._id === bank._id
                                ? { ...item, branch: value }
                                : item
                            )
                          );
                        }}
                        disabled={bulkSaving}
                        className="min-w-[100px]"
                      />
                    ) : (
                      bank.branch
                    )}
                  </TableCell>

                  <TableCell>
                    {isBulkEditing ? (
                      <Input
                        value={
                          bulkData.find((item) => item._id === bank._id)
                            ?.ifsc || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase();
                          setBulkData((prev) =>
                            prev.map((item) =>
                              item._id === bank._id
                                ? { ...item, ifsc: value }
                                : item
                            )
                          );
                        }}
                        disabled={bulkSaving}
                        className="min-w-[90px]"
                      />
                    ) : (
                      bank.ifsc
                    )}
                  </TableCell>

                  <TableCell>
                    {isBulkEditing ? (
                      <Input
                        value={
                          bulkData.find((item) => item._id === bank._id)
                            ?.upi || ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          setBulkData((prev) =>
                            prev.map((item) =>
                              item._id === bank._id
                                ? { ...item, upi: value }
                                : item
                            )
                          );
                        }}
                        disabled={bulkSaving}
                        className="min-w-[100px]"
                      />
                    ) : (
                      bank.upi || "-"
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(bank)}
                        disabled={bulkSaving}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => initiateDelete(bank)}
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingBank ? "Edit Bank Details" : "Add Bank Details"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name <span className="text-red-500">*</span></Label>
              <Input
                id="accountName"
                placeholder="Enter account name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number <span className="text-red-500">*</span></Label>
              <Input
                id="accountNumber"
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name <span className="text-red-500">*</span></Label>
              <Input
                id="bankName"
                placeholder="Enter bank name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch <span className="text-red-500">*</span></Label>
              <Input
                id="branch"
                placeholder="Enter branch name"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ifsc">IFSC Code <span className="text-red-500">*</span></Label>
              <Input
                id="ifsc"
                placeholder="Enter IFSC code"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upi">UPI ID</Label>
              <Input
                id="upi"
                placeholder="Enter UPI ID (optional)"
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
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
                <Spinner>{editingBank ? "Updating..." : "Adding..."}</Spinner>
              ) : editingBank ? (
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
            <AlertDialogTitle>Delete Bank Details</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete bank details for{" "}
              <strong>{deleteTarget?.accountName}</strong>? This action can be undone
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
            <AlertDialogTitle>Delete Selected Bank Details</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selected.length}</strong>{" "}
              selected bank detail{selected.length > 1 ? "s" : ""}? This action will
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

      {/* Bulk Save Confirm AlertDialog */}
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

export default BankDetailsPage;