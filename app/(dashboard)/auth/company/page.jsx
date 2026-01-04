"use client";

import { get, put } from "@/lib/api"; // put for update
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Page = () => {
  const [data, setData] = useState(null);
  const { companyId } = useSelector((state) => state.auth.auth);
  const [loading, setLoading] = useState(false);

  const getCompany = async () => {
    try {
      setLoading(true);
      const res = await get(`/our-client/${companyId}`);
      setData(res.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) getCompany();
  }, [companyId]);

  if (loading || !data) {
    return (
      <div className="p-6 text-muted-foreground">Loading client details...</div>
    );
  }

  const isActive = new Date(data.endDate) >= new Date();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{data.ClientName}</h1>
          <p className="text-sm text-muted-foreground">{data.Website}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "Active" : "Expired"}
          </Badge>

          {/* Edit Button triggers Dialog */}
          <EditClientDialog data={data} refresh={getCompany} />
        </div>
      </div>

      <Separator />

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Info label="Email" value={data.email} />
          <Info label="Phone" value={data.PhoneNumber} />
          <Info label="Alternate Email" value={data.AlternativeEmail} />
          <Info label="Alternate Phone" value={data.AlternativePhoneNumber} />
        </CardContent>
      </Card>

      {/* Office Address */}
      <Card>
        <CardHeader>
          <CardTitle>Office Address</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Info label="Address" value={data.OfficeAddress} />
          <Info label="City" value={data.City} />
          <Info label="State" value={data.State} />
          <Info label="Country" value={data.Country} />
          <Info label="Pincode" value={data.Pincode} />
        </CardContent>
      </Card>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Info label="GST Number" value={data.GSTNumber} />
          <Info label="PAN Number" value={data.PanNumber} />
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Info label="Contact Person" value={data.EmergencyContactPerson} />
          <Info label="Contact Number" value={data.EmergencyContactNumber} />
        </CardContent>
      </Card>

      {/* Subscription Period */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Period</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Info
            label="Start Date"
            value={new Date(data.startDate).toLocaleDateString()}
          />
          <Info
            label="End Date"
            value={new Date(data.endDate).toLocaleDateString()}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;

/* Reusable shadcn Info Row */
const Info = ({ label, value }) => (
  <div className="flex flex-col">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
);

/* Edit Client Dialog */
const EditClientDialog = ({ data, refresh }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ ...data });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await put(`/our-client/${data._id}`, formData); // update API
      setSaving(false);
      setOpen(false);
      refresh(); // refresh parent data
    } catch (error) {
      console.error(error);
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[85vh] w-[90vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Client Information</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <InputField
            label="Client Name"
            name="ClientName"
            value={formData.ClientName}
            onChange={handleChange}
          />
          <InputField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            label="Phone"
            name="PhoneNumber"
            value={formData.PhoneNumber}
            onChange={handleChange}
          />
          <InputField
            label="Alternate Email"
            name="AlternativeEmail"
            value={formData.AlternativeEmail}
            onChange={handleChange}
          />
          <InputField
            label="Alternate Phone"
            name="AlternativePhoneNumber"
            value={formData.AlternativePhoneNumber}
            onChange={handleChange}
          />
          <InputField
            label="Office Address"
            name="OfficeAddress"
            value={formData.OfficeAddress}
            onChange={handleChange}
          />
          <InputField
            label="City"
            name="City"
            value={formData.City}
            onChange={handleChange}
          />
          <InputField
            label="State"
            name="State"
            value={formData.State}
            onChange={handleChange}
          />
          <InputField
            label="Country"
            name="Country"
            value={formData.Country}
            onChange={handleChange}
          />
          <InputField
            label="Pincode"
            name="Pincode"
            value={formData.Pincode}
            onChange={handleChange}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* Reusable Input Field */
const InputField = ({ label, name, value, onChange }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-sm text-muted-foreground">{label}</label>
    <Input name={name} value={value} onChange={onChange} />
  </div>
);
