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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LedgerPage = () => {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingLedger, setEditingLedger] = useState(null);

  const [ledgerName, setLedgerName] = useState("");
  const [ledgerType, setLedgerType] = useState("");

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkData, setBulkData] = useState([]);

  // bulk add
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [bulkAddText, setBulkAddText] = useState("");
  const [bulkAddLinesCache, setBulkAddLinesCache] = useState([]);
  const [bulkAddConfirmOpen, setBulkAddConfirmOpen] = useState(false);

  // delete dialogs
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const fetchLedgers = async () => {
    setLoading(true);
    try {
      const res = await get("/ledger");
      setLedgers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setLedgers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLedgers();
  }, []);

  // ---------------- Add / Edit ----------------
  const handleSave = async () => {
    if (!ledgerName.trim() || !ledgerType) {
      toast.error("Ledger name and type are required");
      return;
    }

    setSaving(true);
    try {
      if (editingLedger) {
        await put(`/ledger/${editingLedger._id}`, {
          name: ledgerName,
          ledgerType,
        });
        toast.success("Ledger updated");
      } else {
        await post("/ledger", { name: ledgerName, ledgerType });
        toast.success("Ledger added");
      }

      setLedgerName("");
      setLedgerType("");
      setEditingLedger(null);
      setOpenDialog(false);
      fetchLedgers();
    } catch {
      toast.error("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (l) => {
    setEditingLedger(l);
    setLedgerName(l.name);
    setLedgerType(l.ledgerType);
    setOpenDialog(true);
  };

  // ---------------- Selection ----------------
  const handleSelect = (id) => {
    setSelected((p) =>
      p.includes(id) ? p.filter((i) => i !== id) : [...p, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      setSelected(ledgers.map((l) => l._id));
      setSelectAll(true);
    }
  };

  // ---------------- Delete ----------------
  const confirmSingleDelete = async () => {
    await del(`/ledger/${deleteTarget._id}`);
    fetchLedgers();
    setSingleDeleteOpen(false);
    toast.success("Ledger deleted");
  };

  const confirmBulkDelete = async () => {
    for (const id of selected) {
      await del(`/ledger/${id}`);
    }
    setSelected([]);
    setSelectAll(false);
    fetchLedgers();
    setBulkDeleteOpen(false);
    toast.success("Selected ledgers deleted");
  };

  // ---------------- Bulk Add ----------------
  const initiateBulkAdd = () => {
    const lines = bulkAddText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (!lines.length) {
      toast.error("No data found");
      return;
    }

    setBulkAddLinesCache(lines);
    setBulkAddConfirmOpen(true);
  };

  const confirmBulkAdd = async () => {
    setBulkAdding(true);
    setBulkAddConfirmOpen(false);

    try {
      for (const line of bulkAddLinesCache) {
        const [name, type] = line.split("|").map((i) => i.trim());
        if (!name || !["income", "expense"].includes(type)) continue;

        await post("/ledger", { name, ledgerType: type });
      }
      fetchLedgers();
      setBulkAddOpen(false);
      setBulkAddText("");
      toast.success("Bulk ledgers added");
    } catch {
      toast.error("Bulk add failed");
    } finally {
      setBulkAdding(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Ledger Master</h2>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
              Delete Selected ({selected.length})
            </Button>
          )}

          <Button variant="outline" onClick={() => setBulkAddOpen(true)}>
            Bulk Add
          </Button>

          <Button onClick={() => setOpenDialog(true)}>Add Ledger</Button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
            </TableHead>
            <TableHead>Sr</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5}>
                <Loading />
              </TableCell>
            </TableRow>
          ) : (
            ledgers.map((l, i) => (
              <TableRow key={l._id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(l._id)}
                    onCheckedChange={() => handleSelect(l._id)}
                  />
                </TableCell>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{l.name}</TableCell>
                <TableCell className="capitalize">
                  {l.ledgerType}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(l)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setDeleteTarget(l);
                        setSingleDeleteOpen(true);
                      }}
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

    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogContent className="sm:max-w-[400px]">
    <DialogHeader>
      <DialogTitle>
        {editingLedger ? "Edit Ledger" : "Add Ledger"}
      </DialogTitle>
    </DialogHeader>

    {/* SAME spacing as Prefix */}
    <div className="space-y-2 mt-2">
      <Input
        placeholder="Ledger name"
        value={ledgerName}
        onChange={(e) => setLedgerName(e.target.value)}
      />

      <Select value={ledgerType} onValueChange={setLedgerType}>
        <SelectTrigger>
          <SelectValue placeholder="Select Ledger Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
        </SelectContent>
      </Select>
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
          <Spinner>{editingLedger ? "Updating..." : "Adding..."}</Spinner>
        ) : editingLedger ? (
          "Update"
        ) : (
          "Add"
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>


      {/* Bulk Add Dialog */}
      <Dialog open={bulkAddOpen} onOpenChange={setBulkAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Add Ledgers</DialogTitle>
          </DialogHeader>

          <textarea
            className="w-full min-h-[200px] border rounded-md p-2"
            placeholder={`Example:\nConsultation | income\nElectricity | expense`}
            value={bulkAddText}
            onChange={(e) => setBulkAddText(e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={initiateBulkAdd} disabled={bulkAdding}>
              {bulkAdding ? <Spinner /> : "Save All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm dialogs */}
      <AlertDialog open={singleDeleteOpen} onOpenChange={setSingleDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ledger</AlertDialogTitle>
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

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected</AlertDialogTitle>
            <AlertDialogDescription>
              Delete {selected.length} selected ledgers?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bulkAddConfirmOpen}
        onOpenChange={setBulkAddConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Add</AlertDialogTitle>
            <AlertDialogDescription>
              Add {bulkAddLinesCache.length} ledgers?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkAdd}>
              Add
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LedgerPage;
