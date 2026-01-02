"use client";

import React, { useEffect, useState } from "react";

/* shadcn components */
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldContent,
  FieldTitle,
  FieldSeparator,
} from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { get, post } from "@/lib/api";
import { format } from "date-fns";
import { CalendarDay } from "react-day-picker";

export default function Page() {
  /* ========================
     STATE
  ======================== */
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [prefixes, setPrefixes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [diplomas, setDiplomas] = useState([]);
  const [graduations, setGraduations] = useState([]);
  const [postGraduations, setPostGraduations] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [councils, setCouncils] = useState([]);

  const [form, setForm] = useState({
    employeeCode: "",
    prefix: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    role: "",
    contactNumber: "",
    alternativeContactNumber: "",
    email: "",
    alternativeEmail: "",
    address: "",
    city: "",
    state: "",
    pincode: "",

    currentEmploymentDetail: {
      department: "",
      employeeRole: "",
      designation: "",
      appointmentDate: "",
      joiningDate: "",
      reportingTo: null,
    },

    qualification: {
      diploma: "",
      graduation: "",
      postGraduation: "",
      superSpecialization: "",
      other: "",
    },

    registrationNumber: "",
    councilName: "",
    verified: false,
    verifiedBy: null,
  });

  /* ========================
     HELPERS
  ======================== */
  const setNestedValue = (path, value) => {
    setForm((prev) => {
      const updated = { ...prev };
      const keys = path.split(".");
      let obj = updated;

      while (keys.length > 1) {
        const key = keys.shift();
        obj[key] = { ...obj[key] };
        obj = obj[key];
      }

      obj[keys[0]] = value;
      return updated;
    });
  };

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

  const handleChange = async (e) => {
    const { name, value } = e.target;

    // PINCODE logic
    if (name === "pincode") {
      const pin = value.replace(/\D/g, ""); // numbers only

      setForm((prev) => ({ ...prev, pincode: pin }));

      // Call API only when 6 digits entered
      if (pin.length === 6) {
        const location = await fetchCityStateFromPincode(pin);

        if (location) {
          setForm((prev) => ({
            ...prev,
            city: location.city,
            state: location.state,
          }));
        }
      }

      return;
    }

    // Existing nested logic
    if (name.includes(".")) {
      setNestedValue(name, value);
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  /* ========================
     FETCH USERS
  ======================== */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await get("/users");
      setUsers(res.data || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  /* ========================
     FETCH USERS
  ======================== */

  const fetchMasters = async () => {
    try {
      const [
        prefixRes,
        departmentRes,
        designationRes,
        roleRes,
        diplomaRes,
        graduationRes,
        postRes,
        specialityRes,
        councilRes,
      ] = await Promise.all([
        get("/prefix"),
        get("/department"),
        get("/designation"),
        get("/role"),
        get("/diploma"),
        get("/graduation"),
        get("/post-graduation"),
        get("/speciality"),
        get("/council"),
      ]);

      setPrefixes(prefixRes || []);
      setDepartments(departmentRes || []);
      setDesignations(designationRes || []);
      setRoles(roleRes || []);
      setDiplomas(diplomaRes || []);
      setGraduations(graduationRes || []);
      setPostGraduations(postRes || []);
      setSpecialities(specialityRes || []);
      setCouncils(councilRes || []);
    } catch (err) {
      console.error("Failed to load master data", err);
    }
  };

  useEffect(() => {
    fetchMasters();
    fetchUsers();
  }, []);

  /* ========================
     SUBMIT
  ======================== */
  const handleSubmit = async () => {
    try {
      setSaving(true);
      const res = await post("/users", form);

      if (res.success) {
        toast.success(res.message);
        setOpen(false);
        fetchUsers();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to create employee");
    } finally {
      setSaving(false);
    }
  };

  /* ========================
     UI
  ======================== */
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Employees</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Employee</Button>
          </DialogTrigger>

          <DialogContent className="max-w-4xl h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
            </DialogHeader>

            {/* BASIC IDENTITY */}
            <FieldGroup>
              <FieldTitle>Basic Identity</FieldTitle>

              {/* Row 1: Prefix + Names */}
              <div className="flex flex-wrap gap-4">
                {/* Prefix */}
                <div className="w-full sm:w-[calc(25%-0.75rem)]">
                  <Select
                    value={form.prefix || ""}
                    onValueChange={(v) => setForm({ ...form, prefix: v })}
                  >
                    <SelectTrigger className="w-full">
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

                <Input
                  name="firstName"
                  placeholder="First Name"
                  onChange={handleChange}
                  className="w-full sm:w-[calc(25%-0.75rem)]"
                />

                <Input
                  name="middleName"
                  placeholder="Middle Name"
                  onChange={handleChange}
                  className="w-full sm:w-[calc(25%-0.75rem)]"
                />

                <Input
                  name="lastName"
                  placeholder="Last Name"
                  onChange={handleChange}
                  className="w-full sm:w-[calc(25%-0.75rem)]"
                />
              </div>

              {/* Row 2: Employee Code / Gender / Role / DOB */}
              <div className="flex flex-wrap gap-4">
                {/* Employee Code */}
                <Input
                  name="employeeCode"
                  // disabled
                  // label="Employee Code"

                  value={form.employeeCode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      employeeCode: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Employee Code"
                  className="w-full sm:w-[calc(25%-0.75rem)]"
                />

                {/* Gender */}
                <div className="w-full sm:w-[calc(25%-0.75rem)]">
                  <Select
                    onValueChange={(v) => setForm({ ...form, gender: v })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Employee Role */}
                <div className="w-full sm:w-[calc(25%-0.75rem)]">
                  <Select onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="medicalOfficer">
                        Medical Officer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date of Birth */}
                <div className="w-full sm:w-[calc(25%-0.75rem)]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !form.dateOfBirth && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.dateOfBirth
                          ? format(new Date(form.dateOfBirth), "PPP")
                          : "Date of Birth"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        fromYear={1950}
                        toYear={new Date().getFullYear()}
                        selected={
                          form.dateOfBirth
                            ? new Date(form.dateOfBirth)
                            : undefined
                        }
                        onSelect={(date) =>
                          setForm({
                            ...form,
                            dateOfBirth: date ? date.toISOString() : "",
                          })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </FieldGroup>

            <FieldSeparator />

            {/* CONTACT */}
            <FieldGroup>
              <FieldTitle>Contact</FieldTitle>
              <div className="flex flex-wrap gap-4">
                <Input
                  name="contactNumber"
                  placeholder="Contact Number"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={form.contactNumber || ""}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "contactNumber",
                        value: e.target.value.replace(/\D/g, ""),
                      },
                    })
                  }
                  className="w-full sm:w-[calc(50%-0.5rem)]"
                />

                <Input
                  name="alternativeContactNumber"
                  placeholder="Alt Contact"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={form.alternativeContactNumber || ""}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "alternativeContactNumber",
                        value: e.target.value.replace(/\D/g, ""),
                      },
                    })
                  }
                  className="w-full sm:w-[calc(50%-0.5rem)]"
                />

                <Input
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  className="w-full sm:w-[calc(50%-0.5rem)]"
                />

                <Input
                  name="alternativeEmail"
                  placeholder="Alt Email"
                  onChange={handleChange}
                  className="w-full sm:w-[calc(50%-0.5rem)]"
                />

                <Textarea
                  name="address"
                  placeholder="Address"
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <Input
                  name="pincode"
                  placeholder="Pincode"
                  value={form.pincode || ""}
                  onChange={handleChange}
                  className="w-full sm:w-[calc(33.333%-0.75rem)]"
                />

                <Input
                  name="city"
                  placeholder="City"
                  value={form.city || ""}
                  disabled
                  className="w-full sm:w-[calc(33.333%-0.75rem)]"
                />

                <Input
                  name="state"
                  placeholder="State"
                  value={form.state || ""}
                  disabled
                  className="w-full sm:w-[calc(33.333%-0.75rem)]"
                />
              </div>
            </FieldGroup>

            <FieldSeparator />

            {/* CURRENT EMPLOYMENT */}
            <FieldGroup>
              <FieldTitle>Current Employment</FieldTitle>

              {/* Row 1: Department / Role / Designation */}
              <div className="flex flex-wrap gap-4">
                <div className="w-full sm:w-[calc(33.333%-0.75rem)]">
                  <Select
                    value={form.currentEmploymentDetail?.department || ""}
                    onValueChange={(v) =>
                      setNestedValue("currentEmploymentDetail.department", v)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>

                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d._id} value={d._id}>
                          {d.departmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-[calc(33.333%-0.75rem)]">
                  <Select
                    value={form.currentEmploymentDetail?.employeeRole || ""}
                    onValueChange={(v) =>
                      setNestedValue("currentEmploymentDetail.employeeRole", v)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>

                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r._id} value={r._id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-[calc(33.333%-0.75rem)]">
                  <Select
                    value={form.currentEmploymentDetail?.designation || ""}
                    onValueChange={(v) =>
                      setNestedValue("currentEmploymentDetail.designation", v)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Designation" />
                    </SelectTrigger>

                    <SelectContent>
                      {designations.map((d) => (
                        <SelectItem key={d._id} value={d._id}>
                          {d.designationName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Appointment Date / Joining Date / Reporting To */}
              <div className="flex flex-wrap gap-4">
                {/* Appointment Date */}
                <div className="w-full sm:w-[calc(33.333%-0.75rem)]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.currentEmploymentDetail?.appointmentDate
                          ? format(
                              new Date(
                                form.currentEmploymentDetail.appointmentDate
                              ),
                              "PPP"
                            )
                          : "Appointment Date"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          form.currentEmploymentDetail?.appointmentDate
                            ? new Date(
                                form.currentEmploymentDetail.appointmentDate
                              )
                            : undefined
                        }
                        onSelect={(date) =>
                          setNestedValue(
                            "currentEmploymentDetail.appointmentDate",
                            date ? date.toISOString() : ""
                          )
                        }
                        initialFocus
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Joining Date */}
                <div className="w-full sm:w-[calc(33.333%-0.75rem)]">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.currentEmploymentDetail?.joiningDate
                          ? format(
                              new Date(
                                form.currentEmploymentDetail.joiningDate
                              ),
                              "PPP"
                            )
                          : "Joining Date"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          form.currentEmploymentDetail?.joiningDate
                            ? new Date(form.currentEmploymentDetail.joiningDate)
                            : undefined
                        }
                        onSelect={(date) =>
                          setNestedValue(
                            "currentEmploymentDetail.joiningDate",
                            date ? date.toISOString() : ""
                          )
                        }
                        initialFocus
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Reporting To */}
                <Input
                  name="currentEmploymentDetail.reportingTo"
                  placeholder="Reporting To"
                  onChange={handleChange}
                  className="w-full sm:w-[calc(33.333%-0.75rem)]"
                />
              </div>
            </FieldGroup>

            <FieldSeparator />

            {/* QUALIFICATION */}
            <FieldGroup>
              <FieldTitle>Qualification</FieldTitle>

              {/* Row 1: Diploma / Graduation / Post Graduation */}
              <div className="flex flex-wrap gap-4">
                <div className="w-full sm:w-[calc(33.333%-0.75rem)]">
                  <Select
                    value={form.qualification?.diploma || ""}
                    onValueChange={(v) =>
                      setNestedValue("qualification.diploma", v)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Diploma" />
                    </SelectTrigger>
                    <SelectContent>
                      {diplomas.map((d) => (
                        <SelectItem key={d._id} value={d._id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-[calc(33.333%-0.75rem)]">
                  <Select
                    value={form.qualification?.graduation || ""}
                    onValueChange={(v) =>
                      setNestedValue("qualification.graduation", v)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Graduation" />
                    </SelectTrigger>
                    <SelectContent>
                      {graduations.map((g) => (
                        <SelectItem key={g._id} value={g._id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-[calc(33.333%-0.75rem)]">
                  <Select
                    value={form.qualification?.postGraduation || ""}
                    onValueChange={(v) =>
                      setNestedValue("qualification.postGraduation", v)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Post Graduation" />
                    </SelectTrigger>
                    <SelectContent>
                      {postGraduations.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Speciality / Other Qualification */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="w-full sm:w-[calc(50%-0.5rem)]">
                  <Select
                    value={form.qualification?.superSpecialization || ""}
                    onValueChange={(v) =>
                      setNestedValue("qualification.superSpecialization", v)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Speciality" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialities.map((s) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  name="qualification.other"
                  placeholder="Other Qualification"
                  onChange={handleChange}
                  className="w-full sm:w-[calc(50%-0.5rem)]"
                />
              </div>
            </FieldGroup>

            <FieldSeparator />

            {/* REGISTRATION */}
            <FieldGroup>
              <FieldTitle>Registration</FieldTitle>

              {/* Row 1: Registration Number / Council */}
              <div className="flex flex-wrap gap-4">
                <Input
                  name="registrationNumber"
                  placeholder="Registration Number"
                  onChange={handleChange}
                  className="w-full sm:w-[calc(50%-0.5rem)]"
                />

                <Select
                  value={form.councilName || ""}
                  onValueChange={(v) => setForm({ ...form, councilName: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Council" />
                  </SelectTrigger>
                  <SelectContent>
                    {councils.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Row 2: Verified / Verified By */}
              <div className="flex flex-wrap gap-4 mt-4 items-center">
                <div className="w-full sm:w-[calc(50%-0.5rem)] flex items-center gap-2">
                  <Checkbox
                    id="isVerified"
                    checked={form.isVerified || false}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, isVerified: checked })
                    }
                  />
                  <label
                    htmlFor="isVerified"
                    className="text-sm font-medium leading-none"
                  >
                    Verified
                  </label>
                </div>

                <Input
                  name="verifiedBy"
                  placeholder="Verified By"
                  onChange={handleChange}
                  disabled={!form.isVerified}
                  className="w-full sm:w-[calc(50%-0.5rem)]"
                />
              </div>
            </FieldGroup>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving && <Spinner className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLE */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Gender</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  <Spinner />
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>{u.employeeCode}</TableCell>
                  <TableCell>
                    {u.firstName} {u.lastName}
                  </TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.gender}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
