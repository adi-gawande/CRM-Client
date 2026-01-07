"use client";

import { useEffect, useState } from "react";
import { get, post } from "@/lib/api";
import { CalendarIcon, Plus } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FieldGroup, FieldSeparator, FieldTitle } from "@/components/ui/field";
import { useSelector } from "react-redux";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { companyId } = useSelector((state) => state.auth.auth);
  const [leadTypes, setLeadTypes] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [leadRefferences, setLeadRefferences] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [sectors, setSectors] = useState([]);

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
    leadTypeId: "",
    leadSourceId: "",
    leadReferenceId: "",
    leadStatusId: "",
    sectorId: "",
    sizeId: "",
    budget: "",
    revenue: "",
    renewalDate: null,
    companyId,
  });

  /* ---------------- FETCH CLIENTS ---------------- */
  const fetchClients = async () => {
    try {
      const res = await get("/prospect");
      setClients(res?.data || []);
    } catch (err) {
      console.error("Fetch clients failed", err);
    }
  };

  const fetchMasters = async () => {
    const types = await get(`/lead-type?companyId=${companyId}`);
    const statuses = await get(`/lead-status?companyId=${companyId}`);
    const refferences = await get(`/lead-reference?companyId=${companyId}`);
    const sources = await get(`/lead-source?companyId=${companyId}`);
    const sizes = await get(`/size?companyId=${companyId}`);
    const sectors = await get(`/size?companyId=${companyId}`);
    setLeadRefferences(refferences);
    setLeadSources(sources);
    setLeadTypes(types);
    setLeadStatuses(statuses);
    setSizes(sizes);
    setSectors(sectors);
  };

  useEffect(() => {
    fetchClients();
    fetchMasters();
  }, []);

  /* ---------------- FORM HANDLERS ---------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await post("/prospect", formData);
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
        <h2 className="text-2xl font-semibold">Prospects</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Prospect
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
              {/* <TableHead>alt Phone</TableHead>
              <TableHead>alt Email</TableHead>
              <TableHead>Address</TableHead> */}
              <TableHead>City</TableHead>
              {/* <TableHead>State</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Pincode</TableHead>
              <TableHead>GST</TableHead>
              <TableHead>Pan</TableHead>
              <TableHead>Website</TableHead> */}
              <TableHead>Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Refference</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>CreatedAt</TableHead>
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
                {/* <TableCell>{client.AlternativePhoneNumber}</TableCell>
                <TableCell>{client.AlternativeEmail}</TableCell>
                <TableCell>{client.OfficeAddress || "-"}</TableCell> */}
                <TableCell>{client.City || "-"}</TableCell>
                {/* <TableCell>{client.State || "-"}</TableCell>
                <TableCell>{client.Country || "-"}</TableCell>
                <TableCell>{client.Pincode || "-"}</TableCell>
                <TableCell>{client.GSTNumber || "-"}</TableCell>
                <TableCell>{client.PanNumber || "-"}</TableCell>
                <TableCell>{client.Website || "-"}</TableCell> */}
                <TableCell>{client.leadTypeId.leadType || "-"}</TableCell>
                <TableCell>{client.leadSourceId.leadSource || "-"}</TableCell>
                <TableCell>
                  {client.leadReferenceId.leadReference || "-"}
                </TableCell>
                <TableCell>{client.leadStatusId.leadStatus || "-"}</TableCell>
                <TableCell>
                  {client.createdAt
                    ? new Date(client.createdAt).toLocaleDateString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ADD CLIENT DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl w-[85vw] h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Prospect</DialogTitle>
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

          <FieldSeparator />

          <FieldGroup>
            <FieldTitle>Lead Information</FieldTitle>

            <div className="flex flex-wrap gap-4">
              {/* Lead Type */}
              <Select
                value={formData.leadTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, leadTypeId: value })
                }
              >
                <SelectTrigger className="w-full sm:w-[calc(33.333%-0.75rem)]">
                  <SelectValue placeholder="Select Lead Type" />
                </SelectTrigger>
                <SelectContent>
                  {leadTypes?.map((type) => (
                    <SelectItem key={type._id} value={type._id}>
                      {type.leadType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Lead Source */}
              <Select
                value={formData.leadSourceId}
                onValueChange={(value) =>
                  setFormData({ ...formData, leadSourceId: value })
                }
              >
                <SelectTrigger className="w-full sm:w-[calc(33.333%-0.75rem)]">
                  <SelectValue placeholder="Select Lead Source" />
                </SelectTrigger>
                <SelectContent>
                  {leadSources?.map((source) => (
                    <SelectItem key={source._id} value={source._id}>
                      {source.leadSource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Lead Reference */}
              <Select
                value={formData.leadReferenceId}
                onValueChange={(value) =>
                  setFormData({ ...formData, leadReferenceId: value })
                }
              >
                <SelectTrigger className="w-full sm:w-[calc(33.333%-0.75rem)]">
                  <SelectValue placeholder="Select Lead Reference" />
                </SelectTrigger>
                <SelectContent>
                  {leadRefferences?.map((ref) => (
                    <SelectItem key={ref._id} value={ref._id}>
                      {ref.leadReference}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Lead Statuses */}
              <Select
                value={formData.leadStatusId}
                onValueChange={(value) =>
                  setFormData({ ...formData, leadStatusId: value })
                }
              >
                <SelectTrigger className="w-full sm:w-[calc(33.333%-0.75rem)]">
                  <SelectValue placeholder="Select Lead Status" />
                </SelectTrigger>
                <SelectContent>
                  {leadStatuses?.map((ref) => (
                    <SelectItem key={ref._id} value={ref._id}>
                      {ref.leadStatus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Client Size */}

              <Select
                value={formData.sizeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, sizeId: value })
                }
              >
                <SelectTrigger className="w-full sm:w-[calc(33.333%-0.75rem)]">
                  <SelectValue placeholder="Select Size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes?.map((ref) => (
                    <SelectItem key={ref._id} value={ref._id}>
                      {ref.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Client Sector */}

              <Select
                value={formData.sectorId}
                onValueChange={(value) =>
                  setFormData({ ...formData, sectorId: value })
                }
              >
                <SelectTrigger className="w-full sm:w-[calc(33.333%-0.75rem)]">
                  <SelectValue placeholder="Select Sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors?.map((ref) => (
                    <SelectItem key={ref._id} value={ref._id}>
                      {ref.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Budget */}
              <Input
                type="number"
                placeholder="Budget"
                className="w-full sm:w-[calc(33.333%-0.75rem)]"
                value={formData.budget || ""}
                onChange={(e) =>
                  setFormData({ ...formData, budget: e.target.value })
                }
              />

              {/* Revenue */}
              <Input
                type="number"
                placeholder="Revenue"
                className="w-full sm:w-[calc(33.333%-0.75rem)]"
                value={formData.revenue || ""}
                onChange={(e) =>
                  setFormData({ ...formData, revenue: e.target.value })
                }
              />

              {/* Renewal Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-[calc(33.333%-0.75rem)] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.renewalDate
                      ? new Date(formData.renewalDate).toLocaleDateString()
                      : "Select Renewal Date"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={
                      formData.renewalDate
                        ? new Date(formData.renewalDate)
                        : undefined
                    }
                    onSelect={(date) =>
                      setFormData({
                        ...formData,
                        renewalDate: date?.toISOString(),
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
              {loading ? "Saving..." : "Save Prospect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
