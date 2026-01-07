"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { get, post } from "@/lib/api";
import { useSelector } from "react-redux";

// const priorities = ["Low", "Medium", "High"];
// const taskStatuses = ["Pending", "In Progress", "Completed"];
// const users = ["John", "Sarah", "Alex"];
// const clients = ["Client A", "Client B", "Client C"];

export default function TasksPage() {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState([]);

  const [priorities, setPriorities] = useState([]);
  const [taskStatuses, setTaskStatuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);

  const { companyId } = useSelector((state) => state.auth.auth);

  const [formData, setFormData] = useState({
    title: "",
    priority: "",
    status: "",
    assignedTo: "",
    clientName: "",
    dueDate: null,
  });

  const handleAddTask = async () => {
    const payload = {
      companyId,
      title: formData.title,
      priority: formData.priority || null,
      status: formData.status || null,
      assignedTo: formData.assignedTo || null,
      clientName: formData.clientName || null,
      dueDate: formData.dueDate,
    };

    await post("/task", payload);

    setFormData({
      title: "",
      priority: "",
      status: "",
      assignedTo: "",
      clientName: "",
      dueDate: null,
    });

    setOpen(false);
    fetchTasks(); // refresh table
  };

  const fetchMaster = async () => {
    let prio = await get(`/priority?companyId=${companyId}`);
    let tast = await get(`/task-status?companyId=${companyId}`);
    let users = await get(`/users?companyId=${companyId}`);
    let client = await get(`/client?companyId=${companyId}`);

    setPriorities(prio);
    setTaskStatuses(tast);
    setUsers(users.data);
    setClients(client.data);
  };

  const fetchTasks = async () => {
    const res = await get(`/task?companyId=${companyId}`);
    setTasks(res.data);
  };

  useEffect(() => {
    if (companyId) {
      fetchMaster();
      fetchTasks();
    }
  }, [companyId]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                placeholder="Task Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="col-span-2"
              />

              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Task Status" />
                </SelectTrigger>
                <SelectContent>
                  {taskStatuses.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.taskStatus}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.assignedTo}
                onValueChange={(value) =>
                  setFormData({ ...formData, assignedTo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign To" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u._id} value={u._id}>
                      {u.firstName} {u.middleName} {u.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.clientName}
                onValueChange={(value) =>
                  setFormData({ ...formData, clientName: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Client Name" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.ClientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="col-span-2 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate
                      ? new Date(formData.dueDate).toLocaleDateString()
                      : "Due Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) =>
                      setFormData({ ...formData, dueDate: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleAddTask}>Save Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No tasks found
                </TableCell>
              </TableRow>
            )}

            {tasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>{task.priority?.name || "-"}</TableCell>
                <TableCell>{task.status?.taskStatus || "-"}</TableCell>
                <TableCell>
                  {task.assignedTo
                    ? `${task.assignedTo.firstName} ${
                        task.assignedTo.middleName || ""
                      } ${task.assignedTo.lastName}`
                    : "-"}
                </TableCell>
                <TableCell>{task.clientName?.ClientName || "-"}</TableCell>
                <TableCell>
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
