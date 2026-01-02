"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { get, post, put, del } from "@/lib/api";
import { toast } from "sonner";
import Loading from "@/components/loading";
import { Spinner } from "@/components/ui/spinner";

const SubLedgerPage = () => {
  const [data, setData] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [name, setName] = useState("");
  const [ledgerId, setLedgerId] = useState("");

  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // bulk add
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkLines, setBulkLines] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    const [s, l] = await Promise.all([
      get("/sub-ledger"),
      get("/ledger"),
    ]);
    setData(s || []);
    setLedgers(l.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const saveOne = async () => {
    if (!name || !ledgerId) {
      toast.error("All fields required");
      return;
    }

    try {
      if (editing) {
        await put(`/sub-ledger/${editing._id}`, { name, ledger: ledgerId });
        toast.success("Updated");
      } else {
        await post("/sub-ledger", { name, ledger: ledgerId });
        toast.success("Added");
      }
      setOpen(false);
      setName("");
      setLedgerId("");
      setEditing(null);
      fetchAll();
    } catch {
      toast.error("Failed");
    }
  };

  const initiateBulkAdd = () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (!lines.length) {
      toast.error("No data");
      return;
    }

    setBulkLines(lines);
    setBulkConfirmOpen(true);
  };

  const confirmBulkAdd = async () => {
    try {
      for (const line of bulkLines) {
        const [name, ledgerName] = line.split("|").map((x) => x.trim());
        const ledger = ledgers.find((l) => l.name === ledgerName);
        if (!ledger) continue;
        await post("/sub-ledger", { name, ledger: ledger._id });
      }
      toast.success("Bulk added");
      setBulkAddOpen(false);
      setBulkText("");
      fetchAll();
    } catch {
      toast.error("Bulk failed");
    } finally {
      setBulkConfirmOpen(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">SubLedger Master</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkAddOpen(true)}>
            Bulk Add
          </Button>
          <Button onClick={() => setOpen(true)}>Add SubLedger</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sr</TableHead>
            <TableHead>SubLedger</TableHead>
            <TableHead>Ledger</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5}><Loading /></TableCell>
            </TableRow>
          ) : (
            data.map((d, i) => (
              <TableRow key={d._id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{d.name}</TableCell>
                <TableCell>{d.ledger?.name}</TableCell>
                <TableCell className="capitalize">{d.ledger?.ledgerType}</TableCell>
                <TableCell className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditing(d);
                    setName(d.name);
                    setLedgerId(d.ledger._id);
                    setOpen(true);
                  }}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={async () => {
                    await del(`/sub-ledger/${d._id}`);
                    fetchAll();
                  }}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit SubLedger" : "Add SubLedger"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="SubLedger name" />

            <Select value={ledgerId} onValueChange={setLedgerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Ledger" />
              </SelectTrigger>
              <SelectContent>
                {ledgers.map((l) => (
                  <SelectItem key={l._id} value={l._id}>
                    {l.name} ({l.ledgerType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveOne}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add */}
      <Dialog open={bulkAddOpen} onOpenChange={setBulkAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bulk Add SubLedgers</DialogTitle>
          </DialogHeader>

          <textarea
            className="w-full min-h-[200px] border rounded-md p-2 text-sm"
            placeholder={`Example:\nRoom Rent | Income Ledger\nElectric Bill | Expense Ledger`}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkAddOpen(false)}>Cancel</Button>
            <Button onClick={initiateBulkAdd}>Save All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Confirm */}
      <AlertDialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Add</AlertDialogTitle>
            <AlertDialogDescription>
              Add {bulkLines.length} sub-ledgers?
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

export default SubLedgerPage;
