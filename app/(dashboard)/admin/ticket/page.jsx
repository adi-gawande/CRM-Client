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
import { Textarea } from "@/components/ui/textarea";
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

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { companyId } = useSelector((state) => state.auth.auth);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    clientId: "",
    phoneNumber: "",
    productId: "",
    serviceType: "",
    dateOfInstallation: null,
    serviceExpiryDate: null,
    description: "",
    priorityId: "",
    assignedTo: "",
    companyId,
  });

  /* ---------------- FETCH DATA ---------------- */
  const fetchTickets = async () => {
    try {
      const res = await get("/ticket");
      setTickets(res?.data || []);
    } catch (err) {
      console.error("Fetch tickets failed", err);
    }
  };

  const fetchMasters = async () => {
    try {
      const [clientsRes, productsRes, prioritiesRes, usersRes] = await Promise.all([
        get("/client"),
        get(`/product-category?companyId=${companyId}`),
        get(`/priority?companyId=${companyId}`),
        get("/users"),
      ]);

      setClients(clientsRes?.data || []);
      setProducts(productsRes || []);
      setPriorities(prioritiesRes || []);
      setUsers(usersRes?.data || []);
    } catch (err) {
      console.error("Fetch masters failed", err);
    }
  };
console.log("Priority", priorities);
  useEffect(() => {
    fetchTickets();
    fetchMasters();
  }, []);

  /* ---------------- FORM HANDLERS ---------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await post("/ticket", formData);
      setOpen(false);
      setFormData({
        clientId: "",
        phoneNumber: "",
        productId: "",
        serviceType: "",
        dateOfInstallation: null,
        serviceExpiryDate: null,
        description: "",
        priorityId: "",
        assignedTo: "",
        companyId,
      });
      fetchTickets();
    } catch (err) {
      console.error("Create ticket failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Tickets</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Ticket
        </Button>
      </div>

      {/* TABLE */}
      <div className="rounded-lg border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tickets.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No tickets found
                </TableCell>
              </TableRow>
            )}
            {tickets.map((ticket) => (
              <TableRow key={ticket._id}>
                <TableCell>{ticket.clientId?.ClientName || "-"}</TableCell>
                <TableCell>{ticket.productId?.productName || "-"}</TableCell>
                <TableCell>{ticket.serviceType}</TableCell>
                <TableCell>{ticket.priorityId?.name || "-"}</TableCell>
                <TableCell>{ticket.assignedTo}</TableCell>
                <TableCell>
                  {new Date(ticket.serviceExpiryDate) > new Date()
                    ? "Active"
                    : "Expired"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ADD TICKET DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl w-[85vw] h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Ticket</DialogTitle>
          </DialogHeader>

          {/* BASIC INFO */}
          <FieldGroup>
            <FieldTitle>Basic Information</FieldTitle>

            <div className="flex flex-wrap gap-4">
              {/* Client */}
              <Select
                value={formData.clientId}
                onValueChange={(value) =>
                  setFormData({ ...formData, clientId: value })
                }
              >
                <SelectTrigger className="w-full sm:w-[calc(50%-0.5rem)]">
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client._id} value={client._id}>
                      {client.ClientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full sm:w-[calc(50%-0.5rem)]"
              />

              {/* Product */}
              <Select
                value={formData.productId}
                onValueChange={(value) =>
                  setFormData({ ...formData, productId: value })
                }
              >
                <SelectTrigger className="w-full sm:w-[calc(50%-0.5rem)]">
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                name="serviceType"
                placeholder="Service Type"
                value={formData.serviceType}
                onChange={handleChange}
                className="w-full sm:w-[calc(50%-0.5rem)]"
              />
            </div>
          </FieldGroup>

          <FieldSeparator />

          {/* DATES */}
          <FieldGroup>
            <FieldTitle>Service Dates</FieldTitle>

            <div className="flex flex-wrap gap-4">
              {/* Installation Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-[calc(50%-0.5rem)] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOfInstallation
                      ? new Date(formData.dateOfInstallation).toLocaleDateString()
                      : "Installation Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.dateOfInstallation
                        ? new Date(formData.dateOfInstallation)
                        : undefined
                    }
                    onSelect={(date) =>
                      setFormData({
                        ...formData,
                        dateOfInstallation: date?.toISOString(),
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Expiry Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-[calc(50%-0.5rem)] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.serviceExpiryDate
                      ? new Date(formData.serviceExpiryDate).toLocaleDateString()
                      : "Service Expiry Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formData.serviceExpiryDate
                        ? new Date(formData.serviceExpiryDate)
                        : undefined
                    }
                    onSelect={(date) =>
                      setFormData({
                        ...formData,
                        serviceExpiryDate: date?.toISOString(),
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </FieldGroup>

          <FieldSeparator />

          {/* ASSIGNMENT */}
          <FieldGroup>
            <FieldTitle>Assignment Details</FieldTitle>

            <div className="flex flex-wrap gap-4">
              {/* Priority */}
              <Select
                value={formData.priorityId}
                onValueChange={(value) =>
                  setFormData({ ...formData, priorityId: value })
                }
              >
                <SelectTrigger className="w-full sm:w-[calc(50%-0.5rem)]">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority._id} value={priority._id}>
                      {priority.name}
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
                <SelectTrigger className="w-full sm:w-[calc(50%-0.5rem)]">
                  <SelectValue placeholder="Assigned To" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name || user.firstName + ' ' + user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="w-full"
                rows={3}
              />
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}