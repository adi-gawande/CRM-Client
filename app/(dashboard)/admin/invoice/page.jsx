"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateInvoiceDialog from "./create-invoice-dialog";
import { get } from "@/lib/api"; // your API helper
import { useSelector } from "react-redux";

export default function InvoicePage() {
  const [open, setOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const { companyId } = useSelector((state) => state.auth.auth);
  const [loading, setLoading] = useState(false);

  // Fetch invoices
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await get(`/invoice?companyId=${companyId}`);
      setInvoices(res.data || []);
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoices on mount
  useEffect(() => {
    fetchInvoices();
  }, [companyId]);

  // Callback for when a new invoice is saved
  const handleDialogClose = () => {
    setOpen(false);
    fetchInvoices(); // refresh invoices
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Invoice
        </Button>
      </div>

      {/* Dialog */}
      <CreateInvoiceDialog open={open} onOpenChange={handleDialogClose} />

      {/* Table */}
      <Table className="border rounded-md">
        <TableHeader>
          <TableRow>
            <TableHead>Invoice No</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : invoices.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                No invoices found
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((inv) => (
              <TableRow key={inv._id}>
                <TableCell>{inv.invoiceNumber}</TableCell>
                <TableCell>{inv.clientId.ClientName || "N/A"}</TableCell>
                <TableCell>
                  {new Date(inv.invoiceDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{inv.grandTotal.toFixed(2)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
