"use client";

import React, { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { get, post } from "@/lib/api";

export default function UHIDPage() {
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [prefixes, setPrefixes] = useState([]);
  const [dob, setDob] = useState(null);
  const [age, setAge] = useState("");

  const [form, setForm] = useState({
    prefix: "",
    fname: "",
    mname: "",
    lname: "",
    gender: "",
    mobileNumber: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    country: "India",
    maritalStatus: "",
  });

  // fetch prefixes + patients
  useEffect(() => {
    get("/prefix").then((res) => setPrefixes(res || []));
    get("/uhid").then((res) => setPatients(res.data || []));

    console.log(patients);
  }, []);

  const fetchCityStateFromPincode = async (pincode) => {
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await res.json();

      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length) {
        return {
          city: data[0].PostOffice[0].District,
          state: data[0].PostOffice[0].State,
        };
      }
    } catch (err) {
      console.error("Pincode lookup failed", err);
    }

    return null;
  };

  const calculateAge = (dobInput) => {
    if (!dobInput) return "";

    // Normalize input (Date | string → Date)
    const dob = dobInput instanceof Date ? dobInput : new Date(dobInput);

    if (isNaN(dob.getTime())) return "";

    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      years--;
    }

    return years;
  };

  const handleSave = async () => {
    await post("/uhid", { ...form, dob });
    setOpen(false);
    setForm({
      prefix: "",
      fname: "",
      mname: "",
      lname: "",
      gender: "",
      mobileNumber: "",
      address: "",
      pincode: "",
      city: "",
      state: "",
      country: "India",
      maritalStatus: "",
    });
    setDob(null);
    get("/uhid").then((res) => setPatients(res.data || []));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">UHID Registration</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add UHID
            </Button>
          </DialogTrigger>

          {/* Dialog */}
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Register Patient (UHID)</DialogTitle>
            </DialogHeader>

            {/* Form Grid */}
            <div className="grid grid-cols-12 gap-4">
              {/* Row 1: Prefix | First Name | Last Name */}
              <div className="col-span-12 sm:col-span-2">
                <Select
                  value={form.prefix}
                  onValueChange={(v) => setForm({ ...form, prefix: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Prefix" />
                  </SelectTrigger>
                  <SelectContent>
                    {prefixes.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 sm:col-span-5">
                <Input
                  placeholder="First Name"
                  value={form.fname}
                  onChange={(e) => setForm({ ...form, fname: e.target.value })}
                />
              </div>

              <div className="col-span-12 sm:col-span-5">
                <Input
                  placeholder="Last Name"
                  value={form.lname}
                  onChange={(e) => setForm({ ...form, lname: e.target.value })}
                />
              </div>

              {/* Row 2: Middle Name | Mobile | Country */}
              <div className="col-span-12 sm:col-span-4">
                <Input
                  placeholder="Middle Name"
                  value={form.mname}
                  onChange={(e) => setForm({ ...form, mname: e.target.value })}
                />
              </div>

              <div className="col-span-12 sm:col-span-4">
                <Input
                  placeholder="Mobile Number"
                  value={form.mobileNumber}
                  onChange={(e) =>
                    setForm({ ...form, mobileNumber: e.target.value })
                  }
                  inputMode="numeric"
                />
              </div>

              <div className="col-span-12 sm:col-span-4">
                <Input
                  placeholder="Country"
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                />
              </div>

              {/* DOB */}
              <div className="col-span-12 sm:col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left",
                        !dob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dob ? format(dob, "dd/MM/yyyy") : "Date of Birth"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={dob}
                      onSelect={(date) => {
                        setDob(date);
                        setAge(calculateAge(date));
                      }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Age */}
              <div className="col-span-12 sm:col-span-2">
                <Input placeholder="Age" value={age} disabled />
              </div>

              {/* Gender */}
              <div className="col-span-12 sm:col-span-3 flex items-center">
                <RadioGroup
                  className="flex gap-4"
                  value={form.gender}
                  onValueChange={(v) => setForm({ ...form, gender: v })}
                >
                  {["male", "female", "other"].map((g) => (
                    <div key={g} className="flex items-center gap-2">
                      <RadioGroupItem value={g} />
                      <span className="text-sm capitalize text-muted-foreground">
                        {g}
                      </span>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Marital Status */}
              <div className="col-span-12 sm:col-span-4">
                <Select
                  value={form.maritalStatus}
                  onValueChange={(v) => setForm({ ...form, maritalStatus: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Marital Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Single",
                      "Married",
                      "Divorced",
                      "Widowed",
                      "Separated",
                    ].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 4: Pincode | City | State */}
              <div className="col-span-12 sm:col-span-4">
                <Input
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={async (e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setForm({ ...form, pincode: value });

                    if (value.length === 6) {
                      const location = await fetchCityStateFromPincode(value);
                      if (location) {
                        setForm((prev) => ({
                          ...prev,
                          city: location.city,
                          state: location.state,
                        }));
                      }
                    }
                  }}
                  inputMode="numeric"
                  maxLength={6}
                />
              </div>

              <div className="col-span-12 sm:col-span-4">
                <Input
                  placeholder="City"
                  disabled
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>

              <div className="col-span-12 sm:col-span-4">
                <Input
                  disabled
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              </div>

              {/* Row 5: Address (full width) */}
              <div className="col-span-12">
                <Input
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleSave}>Save UHID</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UHID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>City</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients?.map((p) => (
              <TableRow key={p._id}>
                <TableCell>{p.uhid}</TableCell>
                <TableCell>
                  {p?.prefix?.name}. {p.fname} {p.mname} {p.lname}
                </TableCell>
                <TableCell>{calculateAge(p.dob)}</TableCell>
                <TableCell className="capitalize">{p.gender}</TableCell>
                <TableCell>{p.mobileNumber}</TableCell>
                <TableCell>{p.city}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
