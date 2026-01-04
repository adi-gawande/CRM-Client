"use client";

import { useEffect, useState } from "react";
import { get, post } from "@/lib/api";
import { Plus } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FieldGroup, FieldSeparator, FieldTitle } from "@/components/ui/field";
import { useSelector } from "react-redux";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { companyId } = useSelector((state) => state.auth.auth);

  const [formData, setFormData] = useState({
    ClientName: "",
    email: "",
    PhoneNumber: "",
    AlternativePhoneNumber: "",
    AlternativeEmail: "",
    EmergencyContactPerson: "",
    EmergencyContactNumber: "",
    OfficeAddress: "",
    City: "",
    State: "",
    Country: "",
    Pincode: "",
    GSTNumber: "",
    PanNumber: "",
    Website: "",
    startDate: "",
    endDate: "",
    companyId,
  });

  /* ---------------- FETCH CLIENTS ---------------- */
  const fetchClients = async () => {
    try {
      const res = await get("/lead");
      setClients(res?.data || []);
    } catch (err) {
      console.error("Fetch clients failed", err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  /* ---------------- FORM HANDLERS ---------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await post("/lead", formData);
      setOpen(false);
      setFormData({
        ClientName: "",
        email: "",
        PhoneNumber: "",
        AlternativePhoneNumber: "",
        AlternativeEmail: "",
        EmergencyContactPerson: "",
        EmergencyContactNumber: "",
        OfficeAddress: "",
        City: "",
        State: "",
        Country: "",
        Pincode: "",
        GSTNumber: "",
        PanNumber: "",
        Website: "",
        startDate: "",
        endDate: "",
      });
      fetchClients();
    } catch (err) {
      console.error("Create client failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Leads</h2>
        <Button variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* TABLE */}
      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {clients.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No clients found
                </TableCell>
              </TableRow>
            )}
            {clients.map((client) => (
              <TableRow key={client._id}>
                <TableCell>{client.ClientName}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.PhoneNumber}</TableCell>
                <TableCell>{client.City || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ADD CLIENT DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl w-[85vw] h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
          </DialogHeader>

          {/* BASIC INFO */}
          <FieldGroup>
            <FieldTitle>Basic Information</FieldTitle>

            <div className="flex flex-wrap gap-4">
              <Input
                name="ClientName"
                placeholder="Client Name"
                value={formData.ClientName}
                onChange={handleChange}
                className="w-full sm:w-[calc(50%-0.5rem)]"
              />

              <Input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full sm:w-[calc(50%-0.5rem)]"
              />

              <Input
                name="PhoneNumber"
                placeholder="Phone Number"
                value={formData.PhoneNumber}
                onChange={handleChange}
                className="w-full sm:w-[calc(50%-0.5rem)]"
              />

              <Input
                name="AlternativePhoneNumber"
                placeholder="Alternative Phone"
                value={formData.AlternativePhoneNumber}
                onChange={handleChange}
                className="w-full sm:w-[calc(50%-0.5rem)]"
              />

              <Input
                name="AlternativeEmail"
                placeholder="Alternative Email"
                value={formData.AlternativeEmail}
                onChange={handleChange}
                className="w-full sm:w-[calc(50%-0.5rem)]"
              />
            </div>
          </FieldGroup>

          <FieldSeparator />

          {/* ADDRESS */}
          <FieldGroup>
            <FieldTitle>Address</FieldTitle>

            <div className="flex flex-wrap gap-4">
              <Input
                name="OfficeAddress"
                placeholder="Office Address"
                value={formData.OfficeAddress}
                onChange={handleChange}
                className="w-full"
              />

              <Input
                name="City"
                placeholder="City"
                value={formData.City}
                onChange={handleChange}
                className="w-full sm:w-[calc(33.333%-0.75rem)]"
              />

              <Input
                name="State"
                placeholder="State"
                value={formData.State}
                onChange={handleChange}
                className="w-full sm:w-[calc(33.333%-0.75rem)]"
              />

              <Input
                name="Country"
                placeholder="Country"
                value={formData.Country}
                onChange={handleChange}
                className="w-full sm:w-[calc(33.333%-0.75rem)]"
              />

              <Input
                name="Pincode"
                placeholder="Pincode"
                value={formData.Pincode}
                onChange={handleChange}
                className="w-full sm:w-[calc(33.333%-0.75rem)]"
              />
            </div>
          </FieldGroup>

          <FieldSeparator />

          {/* TAX & BUSINESS */}
          <FieldGroup>
            <FieldTitle>Tax & Business</FieldTitle>

            <div className="flex flex-wrap gap-4">
              <Input
                name="GSTNumber"
                placeholder="GST Number"
                value={formData.GSTNumber}
                onChange={handleChange}
                className="w-full sm:w-[calc(33.333%-0.75rem)]"
              />

              <Input
                name="PanNumber"
                placeholder="PAN Number"
                value={formData.PanNumber}
                onChange={handleChange}
                className="w-full sm:w-[calc(33.333%-0.75rem)]"
              />

              <Input
                name="Website"
                placeholder="Website"
                value={formData.Website}
                onChange={handleChange}
                className="w-full sm:w-[calc(33.333%-0.75rem)]"
              />
            </div>
          </FieldGroup>

          <FieldSeparator />

          {/* EMERGENCY */}
          <FieldGroup>
            <FieldTitle>Emergency Contact</FieldTitle>

            <div className="flex flex-wrap gap-4">
              <Input
                name="EmergencyContactPerson"
                placeholder="Emergency Contact Person"
                value={formData.EmergencyContactPerson}
                onChange={handleChange}
                className="w-full sm:w-[calc(50%-0.5rem)]"
              />

              <Input
                name="EmergencyContactNumber"
                placeholder="Emergency Contact Number"
                value={formData.EmergencyContactNumber}
                onChange={handleChange}
                className="w-full sm:w-[calc(50%-0.5rem)]"
              />
            </div>
          </FieldGroup>

          {/* <FieldSeparator /> */}

          {/* CONTRACT PERIOD */}
          {/* <FieldGroup>
            <FieldTitle>Contract Period</FieldTitle>

            <div className="flex flex-wrap gap-4">
              <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full sm:w-[calc(50%-0.5rem)]"
              />

              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full sm:w-[calc(50%-0.5rem)]"
              />
            </div>
          </FieldGroup> */}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
