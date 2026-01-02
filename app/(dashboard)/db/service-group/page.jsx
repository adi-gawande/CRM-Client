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
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

const BillGroupPage = () => {
  const [data, setData] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [subLedgers, setSubLedgers] = useState([]);
  const [loading, setLoading] = useState(false);

  // add/edit
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    ledger: "",
    subLedger: "",
    name: "",
    code: "",
    description: "",
    forAllBranch: false,
  });

  // selection
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // bulk edit
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkData, setBulkData] = useState([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkSaveConfirmOpen, setBulkSaveConfirmOpen] = useState(false);

  // bulk add
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkLines, setBulkLines] = useState([]);
  const [bulkAddConfirmOpen, setBulkAddConfirmOpen] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);

  // delete
  const [singleDeleteOpen, setSingleDeleteOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ---------------- FETCH ----------------
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bg, l, sl] = await Promise.all([
        get("/bill-group"),
        get("/ledger"),
        get("/sub-ledger"),
      ]);

      setData(Array.isArray(bg) ? bg : []);
      setLedgers(Array.isArray(l.data) ? l.data : []);
      setSubLedgers(Array.isArray(sl) ? sl : []);
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ---------------- BILL GROUP CODE ----------------
  const generateCode = () => {
    if (data.length === 0) return "000001";
    const last = data[0]?.code;
    const next = parseInt(last, 10) + 1;
    return next.toString().padStart(6, "0");
  };

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    if (!form.name || !form.ledger || !form.subLedger) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editing) {
        await put(`/bill-group/${editing._id}`, form);
        toast.success("Bill group updated");
      } else {
        await post("/bill-group", {
          ...form,
          code: generateCode(),
        });
        toast.success("Bill group added");
      }
      setOpenDialog(false);
      setEditing(null);
      setForm({
        ledger: "",
        subLedger: "",
        name: "",
        code: "",
        description: "",
        forAllBranch: false,
      });
      fetchAll();
    } catch {
      toast.error("Operation failed");
    }
  };

  // ---------------- SELECTION ----------------
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
      setSelected(data.map((d) => d._id));
      setSelectAll(true);
    }
  };

  // ---------------- BULK EDIT ----------------
  const initiateBulkSave = () => {
    if (bulkData.some((d) => !d.name.trim())) {
      toast.error("All names required");
      return;
    }
    setBulkSaveConfirmOpen(true);
  };

  const confirmBulkSave = async () => {
    setBulkSaving(true);
    setBulkSaveConfirmOpen(false);
    try {
      for (const d of bulkData) {
        await put(`/bill-group/${d._id}`, d);
      }
      toast.success("Bulk changes saved");
      setIsBulkEditing(false);
      fetchAll();
    } catch {
      toast.error("Bulk save failed");
    } finally {
      setBulkSaving(false);
    }
  };

  // ---------------- BULK ADD ----------------
  const initiateBulkAdd = () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (!lines.length) {
      toast.error("No data found");
      return;
    }

    setBulkLines(lines);
    setBulkAddConfirmOpen(true);
  };

  const confirmBulkAdd = async () => {
    setBulkAdding(true);
    setBulkAddConfirmOpen(false);
    try {
      for (const line of bulkLines) {
        // FORMAT: Name | LedgerName | SubLedgerName | Description
        const [name, ledgerName, subLedgerName, description] =
          line.split("|").map((x) => x.trim());

        const ledger = ledgers.find((l) => l.name === ledgerName);
        const subLedger = subLedgers.find(
          (s) => s.name === subLedgerName
        );

        if (!ledger || !subLedger) continue;

        await post("/bill-group", {
          name,
          ledger: ledger._id,
          subLedger: subLedger._id,
          description,
          code: generateCode(),
        });
      }

      toast.success("Bulk bill groups added");
      setBulkAddOpen(false);
      setBulkText("");
      fetchAll();
    } catch {
      toast.error("Bulk add failed");
    } finally {
      setBulkAdding(false);
    }
  };

  // ---------------- DELETE ----------------
  const confirmSingleDelete = async () => {
    await del(`/bill-group/${deleteTarget._id}`);
    setSingleDeleteOpen(false);
    fetchAll();
    toast.success("Deleted");
  };

  const confirmBulkDelete = async () => {
    for (const id of selected) {
      await del(`/bill-group/${id}`);
    }
    setSelected([]);
    setSelectAll(false);
    setBulkDeleteOpen(false);
    fetchAll();
    toast.success("Selected deleted");
  };

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Bill Group Master</h2>

        <div className="flex gap-2">
          {selected.length > 0 && (
            <Button variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
              Delete Selected ({selected.length})
            </Button>
          )}

          {data.length > 0 && (
            <Button
              variant={isBulkEditing ? "secondary" : "outline"}
              onClick={() => {
                setIsBulkEditing((p) => !p);
                setBulkData(data.map((d) => ({ ...d })));
              }}
            >
              {isBulkEditing ? "Cancel Bulk Edit" : "Bulk Edit"}
            </Button>
          )}

          {isBulkEditing && (
            <Button onClick={initiateBulkSave} disabled={bulkSaving}>
              {bulkSaving ? <Spinner /> : "Save All"}
            </Button>
          )}

          <Button variant="outline" onClick={() => setBulkAddOpen(true)}>
            Bulk Add
          </Button>

          <Button
            onClick={() => {
              setForm((f) => ({ ...f, code: generateCode() }));
              setOpenDialog(true);
            }}
          >
            Add Bill Group
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
            </TableHead>
            <TableHead>SN</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Ledger</TableHead>
            <TableHead>Sub Ledger</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8}>
                <Loading />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>No bill groups found.</TableCell>
            </TableRow>
          ) : (
            data.map((d, i) => (
              <TableRow
                key={d._id}
                className={cn(isBulkEditing && "bg-muted/40")}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.includes(d._id)}
                    onCheckedChange={() => handleSelect(d._id)}
                  />
                </TableCell>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  {isBulkEditing ? (
                    <Input
                      value={
                        bulkData.find((b) => b._id === d._id)?.name || ""
                      }
                      onChange={(e) =>
                        setBulkData((prev) =>
                          prev.map((b) =>
                            b._id === d._id
                              ? { ...b, name: e.target.value }
                              : b
                          )
                        )
                      }
                    />
                  ) : (
                    d.name
                  )}
                </TableCell>
                <TableCell>{d.code}</TableCell>
                <TableCell>{d.ledger?.name}</TableCell>
                <TableCell>{d.subLedger?.name}</TableCell>
                <TableCell>{d.description}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(d);
                      setForm({
                        ledger: d.ledger?._id,
                        subLedger: d.subLedger?._id,
                        name: d.name,
                        code: d.code,
                        description: d.description,
                        forAllBranch: d.forAllBranch,
                      });
                      setOpenDialog(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setDeleteTarget(d);
                      setSingleDeleteOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* ADD / EDIT DIALOG */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-xs md:max-w-xl lg:max-w-2xl xl:max-w-3xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Bill Group" : "Add Bill Group"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <Select
              value={form.ledger}
              onValueChange={(v) =>
                setForm({ ...form, ledger: v, subLedger: "" })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Ledger" />
              </SelectTrigger>
              <SelectContent>
                {ledgers.map((l) => (
                  <SelectItem key={l._id} value={l._id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={form.subLedger}
              onValueChange={(v) =>
                setForm({ ...form, subLedger: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sub Ledger" />
              </SelectTrigger>
              <SelectContent>
                {subLedgers
                  .filter((s) => s.ledger?._id === form.ledger)
                  .map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Bill Group Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <Input value={form.code} disabled />

            <Input
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Checkbox
              checked={form.forAllBranch}
              onCheckedChange={(v) =>
                setForm({ ...form, forAllBranch: v })
              }
            />
            <span>For All Branch</span>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editing ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRM DIALOGS */}
      <AlertDialog open={singleDeleteOpen} onOpenChange={setSingleDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill Group</AlertDialogTitle>
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
              Delete {selected.length} selected bill groups?
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
        open={bulkSaveConfirmOpen}
        onOpenChange={setBulkSaveConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Bulk Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Save changes for {bulkData.length} items?
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

      <AlertDialog
        open={bulkAddConfirmOpen}
        onOpenChange={setBulkAddConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Add</AlertDialogTitle>
            <AlertDialogDescription>
              Add {bulkLines.length} bill groups?
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

export default BillGroupPage;
