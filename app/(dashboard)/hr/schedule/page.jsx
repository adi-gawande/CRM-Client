"use client";

import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { get, post } from "@/lib/api";

/* ---------------- SAMPLE DATA ---------------- */

// const departments = [
//   { id: "d1", name: "OPD" },
//   { id: "d2", name: "Cardiology" },
// ];

// const doctors = [
//   { id: "u1", name: "Dr Sharma", department: "d1" },
//   { id: "u2", name: "Dr Mehta", department: "d1" },
//   { id: "u3", name: "Dr Patel", department: "d2" },
// ];

/* ---------------- HELPERS ---------------- */

const generateDates = (from, to) => {
  const dates = [];
  let d = new Date(from);
  const end = new Date(to);

  d.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  while (d <= end) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
};

const timeToMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (m) => {
  const h = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${h}:${mm}`;
};

const generateSlots = (inTime, outTime, slotDuration) => {
  const slots = [];
  let start = timeToMinutes(inTime);
  const end = timeToMinutes(outTime);

  while (start + slotDuration <= end) {
    slots.push({
      startTime: minutesToTime(start),
      endTime: minutesToTime(start + slotDuration),
      type: "available",
      isBooked: false,
      comment: "",
    });
    start += slotDuration;
  }
  return slots;
};

/* ---------------- PAGE ---------------- */

export default function Page() {
  const [open, setOpen] = useState(false);

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctor, setDoctor] = useState("");

  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });

  const [inTime, setInTime] = useState("17:00");
  const [outTime, setOutTime] = useState("20:00");

  const [slotDuration, setSlotDuration] = useState(30);

  // ✅ NEW: number of break slots
  const [breakCount, setBreakCount] = useState(1);

  const [excludedDates, setExcludedDates] = useState([]);
  const [breakIndex, setBreakIndex] = useState(2);

  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fetchDocNDepartment = async () => {
    try {
      const doctorres = await get("/users");
      const departmentres = await get("/department");
      setDoctors(doctorres.data || []);
      setDepartments(departmentres || []);
    } catch {
      toast.error("Failed to Fetch");
    } finally {
    }
  };

  const fetchAllSchedules = async () => {
    try {
      setLoading(true);
      const res = await get("/doctor-schedule");
      setSchedules(res || []);
    } catch (err) {
      toast.error("Failed to load doctor schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setExcludedDates([]);
    fetchDocNDepartment();
    fetchAllSchedules();
  }, [dateRange]);

  const availableDoctors = isEditMode
    ? doctors
    : doctors.filter(
        (d) => d?.currentEmploymentDetail?.department?._id === department
      );

  const days = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];
    return generateDates(dateRange.from, dateRange.to);
  }, [dateRange]);

  const slots = useMemo(() => {
    const baseSlots = generateSlots(inTime, outTime, slotDuration);

    // prevent break overflow
    const safeBreakIndex = Math.min(
      breakIndex,
      Math.max(0, baseSlots.length - breakCount)
    );

    return baseSlots.map((s, i) => ({
      ...s,
      type:
        i >= safeBreakIndex && i < safeBreakIndex + breakCount
          ? "break"
          : "available",
    }));
  }, [inTime, outTime, slotDuration, breakIndex, breakCount]);

  const handleSave = async () => {
    if (!doctor) {
      toast.error("Please select a doctor");
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select date range");
      return;
    }

    const activeDays = days.filter(
      (d) => !excludedDates.includes(d.toISOString().slice(0, 10))
    );

    if (!activeDays.length) {
      toast.error("No active days selected");
      return;
    }

    const payload = {
      doctor,
      days: activeDays.map((d) => ({
        date: new Date(d),
        slots: slots.map((s) => ({
          startTime: s.startTime,
          endTime: s.endTime,
          type: s.type,
          isBooked: false,
          comment: s.comment || "",
        })),
      })),
    };

    try {
      await post("/doctor-schedule", payload);

      toast.success("Doctor schedule saved successfully");
      setOpen(false);

      fetchAllSchedules(); // 🔥 refresh table
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save doctor schedule");
    }
  };

  const handleEdit = (schedule) => {
    // console.log(schedule);

    const days = schedule.days || [];
    if (!days.length) return;

    // sort days safely
    const sortedDays = [...days].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    const firstDay = sortedDays[0];
    const lastDay = sortedDays[sortedDays.length - 1];

    const slots = firstDay.slots || [];
    if (!slots.length) return;

    // console.log(slots);

    const slotDuration =
      timeToMinutes(slots[0].endTime) - timeToMinutes(slots[0].startTime);

    // infer break info from first day
    const breakSlots = firstDay.slots.filter((s) => s.type === "break");

    const breakIndex = firstDay.slots.findIndex((s) => s.type === "break");

    setDoctor(schedule.doctor?._id || "");
    setDepartment(
      schedule.doctor?.currentEmploymentDetail?.department?._id || ""
    );

    setDateRange({
      from: new Date(firstDay.date),
      to: new Date(lastDay.date),
    });

    setExcludedDates([]); // reset

    setInTime(firstDay.slots[0]?.startTime || "17:00");
    setOutTime(firstDay.slots[firstDay.slots.length - 1]?.endTime || "20:00");

    setSlotDuration(slotDuration || 30);
    // console.log(slotDuration);

    setBreakCount(breakSlots.length || 1);
    setBreakIndex(breakIndex >= 0 ? breakIndex : 0);

    setEditingSchedule(schedule);
    setIsEditMode(true);
    setOpen(true);
  };

  return (
    <div className="p-4">
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setIsEditMode(false);
            setEditingSchedule(null);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Doctor Schedule
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Doctor Schedule" : "Add Doctor Schedule"}
            </DialogTitle>
          </DialogHeader>

          {/* CONTEXT */}
          <div className="grid grid-cols-2 gap-4">
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
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

            <Select value={doctor} onValueChange={setDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Doctor" />
              </SelectTrigger>
              <SelectContent>
                {availableDoctors.map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.employeeCode} {d.firstName} {d.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DATE RANGE */}
          <div className="mt-4">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={dateRange}
              onSelect={setDateRange}
              disabled={(date) => date < today}
              className="rounded-lg border shadow-sm"
            />
          </div>

          {/* RULES */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Input
              type="time"
              value={inTime}
              onChange={(e) => setInTime(e.target.value)}
            />
            <Input
              type="time"
              value={outTime}
              onChange={(e) => setOutTime(e.target.value)}
            />

            <Select
              value={String(slotDuration)}
              onValueChange={(v) => setSlotDuration(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Slot Duration" />
              </SelectTrigger>
              <SelectContent>
                {[10, 15, 20, 30].map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m} mins
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* ✅ BREAK COUNT */}
            <Select
              value={String(breakCount)}
              onValueChange={(v) => setBreakCount(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="No. of Break Slots" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} break slot{n > 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DAYS */}
          <div className="mt-6 flex flex-wrap gap-2">
            {days.map((d) => {
              const key = d.toISOString().slice(0, 10);
              const isPast = d < today;

              return (
                <div
                  key={key}
                  className={`flex items-center gap-2 ${
                    isPast ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Checkbox
                    checked={!excludedDates.includes(key)}
                    disabled={isPast}
                    onCheckedChange={(v) => {
                      if (isPast) return;
                      setExcludedDates((prev) =>
                        v ? prev.filter((x) => x !== key) : [...prev, key]
                      );
                    }}
                  />
                  <span className="text-xs whitespace-nowrap truncate max-w-[80px]">
                    {key}
                  </span>
                </div>
              );
            })}
          </div>

          {/* SLOT BOX */}
          <Card className="p-4 mt-6">
            <div className="flex flex-wrap gap-2">
              {slots.map((s, i) => (
                <div
                  key={i}
                  onClick={() => setBreakIndex(i)}
                  className={`px-3 py-2 rounded-full text-sm cursor-pointer
                    ${
                      s.type === "break"
                        ? "bg-yellow-400 text-black"
                        : "bg-muted"
                    }`}
                >
                  {s.startTime} – {s.endTime}
                  {s.type === "break" && " (BREAK)"}
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Click any slot to move the break block
            </p>
          </Card>

          {/* SAVE */}
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave}>Save Schedule</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="p-4 mt-4  mb-4">
        <h2 className="text-lg font-semibold mb-3">Doctors Schedule</h2>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading schedules...</p>
        ) : schedules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No schedules found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Doctor</th>
                  <th className="text-left p-2">Total Days</th>
                  <th className="text-left p-2">From</th>
                  <th className="text-left p-2">To</th>
                  <th className="text-right p-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {schedules.map((sch) => {
                  const days = sch.days || [];
                  const from = days[0]?.date;
                  const to = days[days.length - 1]?.date;

                  return (
                    <tr key={sch._id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        {sch.doctor?.employeeCode} {sch.doctor?.firstName}{" "}
                        {sch.doctor?.lastName}
                      </td>

                      <td className="p-2">{days.length}</td>

                      <td className="p-2">
                        {from ? new Date(from).toLocaleDateString() : "-"}
                      </td>

                      <td className="p-2">
                        {to ? new Date(to).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-2 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(sch)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
