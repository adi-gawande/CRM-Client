// "use client";

// import React, { useState, useMemo, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Calendar } from "@/components/ui/calendar";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { CalendarIcon, Trash } from "lucide-react";
// import { get } from "@/lib/api"; // your API helper
// import { useSelector } from "react-redux";

// export default function CreateInvoiceDialog({ open, onOpenChange }) {
//   /* ---------- STATE ---------- */
//   const [clients, setClients] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [subProducts, setSubProducts] = useState([]);
//   const [banks, setBanks] = useState([]);
//   const { companyId } = useSelector((state) => state.auth.auth);
//   const [selectedClient, setSelectedClient] = useState("");
//   const [items, setItems] = useState([
//     { product: "", subProduct: "", description: "", qty: 1, rate: 0 },
//   ]);

//   const [discountType, setDiscountType] = useState("none");
//   const [discountValue, setDiscountValue] = useState(0);

//   const [gstType, setGstType] = useState("nogst");
//   const [igst, setIgst] = useState(0);
//   const [cgst, setCgst] = useState(0);
//   const [sgst, setSgst] = useState(0);

//   /* ---------- FETCH DROPDOWNS ---------- */
//   useEffect(() => {
//     if (!open) return;

//     const fetchDropdowns = async () => {
//       try {
//         const [clientRes, productRes, bankRes] = await Promise.all([
//           get(`/client?companyId=${companyId}`),
//           get(`/product-category?companyId=${companyId}`),
//           get(`/bank-details?companyId=${companyId}`),
//         ]);

//         setClients(clientRes.data || []);
//         setProducts(productRes || []);
//         setBanks(bankRes.data || []);
//       } catch (err) {
//         console.error("Dropdown fetch failed", err);
//       }
//     };

//     fetchDropdowns();
//   }, [open, companyId]);

//   const fetchSubProducts = async (productId) => {
//     if (!productId) return setSubProducts([]);
//     try {
//       const res = await get(`/sub-product-category/${productId}`);
//       setSubProducts(res || []);
//     } catch (err) {
//       console.error("Sub product fetch failed", err);
//     }
//   };

//   /* ---------- CALCULATIONS ---------- */
//   const subTotal = useMemo(
//     () => items.reduce((sum, i) => sum + i.qty * i.rate, 0),
//     [items]
//   );

//   const discountAmount = useMemo(() => {
//     if (discountType === "amount") return discountValue;
//     if (discountType === "percent") return (subTotal * discountValue) / 100;
//     return 0;
//   }, [discountType, discountValue, subTotal]);

//   const totalAfterDiscount = subTotal - discountAmount;

//   const gstAmount = useMemo(() => {
//     if (gstType === "igst") return (totalAfterDiscount * igst) / 100;
//     if (gstType === "sgstcgst")
//       return (
//         (totalAfterDiscount * sgst) / 100 + (totalAfterDiscount * cgst) / 100
//       );
//     return 0;
//   }, [gstType, igst, sgst, cgst, totalAfterDiscount]);

//   const grandTotal = totalAfterDiscount + gstAmount;

//   /* ---------- ITEM HANDLERS ---------- */
//   const addItem = () =>
//     setItems([
//       ...items,
//       { product: "", subProduct: "", description: "", qty: 1, rate: 0 },
//     ]);

//   const updateItem = (index, key, value) => {
//     const updated = [...items];
//     updated[index][key] = value;
//     setItems(updated);
//   };

//   const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

//   /* ---------- UI ---------- */
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Create Invoice</DialogTitle>
//         </DialogHeader>

//         {/* Client & Meta */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <Select value={selectedClient} onValueChange={setSelectedClient}>
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Select Client" />
//             </SelectTrigger>
//             <SelectContent>
//               {clients.map((client) => (
//                 <SelectItem key={client._id} value={client._id}>
//                   {client.ClientName}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Input disabled value="INV-0001" />

//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="outline" className="w-full justify-start">
//                 <CalendarIcon className="mr-2 h-4 w-4" />
//                 Invoice Date
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="p-0">
//               <Calendar captionLayout="dropdown" mode="single" />
//             </PopoverContent>
//           </Popover>
//         </div>

//         {/* Products */}
//         <div className="mt-6 space-y-3">
//           {items.map((item, index) => (
//             <div
//               key={index}
//               className="grid grid-cols-1 sm:grid-cols-[1.5fr_1.5fr_2fr_0.7fr_1fr_1fr_0.3fr] gap-3"
//             >
//               {/* Product */}
//               <div className="space-y-1">
//                 <label className="text-xs text-muted-foreground">Product</label>
//                 <Select
//                   value={item.product}
//                   onValueChange={(value) => {
//                     updateItem(index, "product", value);
//                     updateItem(index, "subProduct", ""); // reset sub-product
//                     fetchSubProducts(value);
//                   }}
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select Product" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {products.map((p) => (
//                       <SelectItem key={p._id} value={p._id}>
//                         {p.productName}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Sub Product */}
//               <div className="space-y-1">
//                 <label className="text-xs text-muted-foreground">
//                   Sub Product
//                 </label>
//                 <Select
//                   value={item.subProduct}
//                   onValueChange={(value) =>
//                     updateItem(index, "subProduct", value)
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select Sub Product" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {subProducts.map((sp) => (
//                       <SelectItem key={sp._id} value={sp._id}>
//                         {sp.subProductName}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* Description */}
//               <div className="space-y-1">
//                 <label className="text-xs text-muted-foreground">
//                   Description
//                 </label>
//                 <Input
//                   placeholder="Description"
//                   value={item.description}
//                   onChange={(e) =>
//                     updateItem(index, "description", e.target.value)
//                   }
//                 />
//               </div>

//               {/* Quantity */}
//               <div className="space-y-1">
//                 <label className="text-xs text-muted-foreground">Qty</label>
//                 <Input
//                   type="number"
//                   min={1}
//                   value={item.qty}
//                   onChange={(e) =>
//                     updateItem(index, "qty", Number(e.target.value))
//                   }
//                 />
//               </div>

//               {/* Rate */}
//               <div className="space-y-1">
//                 <label className="text-xs text-muted-foreground">Rate</label>
//                 <Input
//                   type="number"
//                   min={0}
//                   value={item.rate}
//                   onChange={(e) =>
//                     updateItem(index, "rate", Number(e.target.value))
//                   }
//                 />
//               </div>

//               {/* Amount */}
//               <div className="space-y-1">
//                 <label className="text-xs text-muted-foreground">Amount</label>
//                 <Input
//                   disabled
//                   className="bg-muted font-medium"
//                   value={(item.qty * item.rate).toFixed(2)}
//                 />
//               </div>

//               {/* Remove */}
//               <Button
//                 variant="ghost"
//                 className="self-center mt-5"
//                 onClick={() => removeItem(index)}
//               >
//                 <Trash size={16} />
//               </Button>
//             </div>
//           ))}

//           <Button variant="outline" onClick={addItem}>
//             + Add Product
//           </Button>
//         </div>

//         {/* Summary */}
//         <div className="mt-6 space-y-6">
//           {/* Discount + GST */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             {/* DISCOUNT */}
//             <div className="space-y-2">
//               <h4 className="text-sm font-medium">Discount</h4>

//               <Tabs value={discountType} onValueChange={setDiscountType}>
//                 <TabsList className="w-full">
//                   <TabsTrigger value="none">No Discount</TabsTrigger>
//                   <TabsTrigger value="amount">Amount</TabsTrigger>
//                   <TabsTrigger value="percent">Percentage</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="amount">
//                   <Input
//                     type="number"
//                     placeholder="Discount Amount"
//                     onChange={(e) => setDiscountValue(Number(e.target.value))}
//                   />
//                 </TabsContent>

//                 <TabsContent value="percent">
//                   <Input
//                     type="number"
//                     placeholder="Discount %"
//                     onChange={(e) => setDiscountValue(Number(e.target.value))}
//                   />
//                 </TabsContent>
//               </Tabs>
//             </div>

//             {/* GST */}
//             <div className="space-y-2">
//               <h4 className="text-sm font-medium">GST</h4>

//               <Tabs value={gstType} onValueChange={setGstType}>
//                 <TabsList className="w-full">
//                   <TabsTrigger value="nogst">No GST</TabsTrigger>
//                   <TabsTrigger value="igst">IGST</TabsTrigger>
//                   <TabsTrigger value="sgstcgst">SGST + CGST</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="igst">
//                   <Input
//                     placeholder="IGST %"
//                     onChange={(e) => setIgst(Number(e.target.value))}
//                   />
//                 </TabsContent>

//                 <TabsContent value="sgstcgst" className="flex gap-2">
//                   <Input
//                     placeholder="SGST %"
//                     onChange={(e) => setSgst(Number(e.target.value))}
//                   />
//                   <Input
//                     placeholder="CGST %"
//                     onChange={(e) => setCgst(Number(e.target.value))}
//                   />
//                 </TabsContent>
//               </Tabs>
//             </div>
//           </div>

//           {/* TOTALS */}
//           <div className="border-t pt-4 w-full sm:max-w-md sm:ml-auto space-y-2 text-sm">
//             <div className="flex justify-between">
//               <span>Subtotal</span>
//               <span>{subTotal.toFixed(2)}</span>
//             </div>

//             <div className="flex justify-between">
//               <span>Discount</span>
//               <span>-{discountAmount.toFixed(2)}</span>
//             </div>

//             <div className="flex justify-between">
//               <span>GST</span>
//               <span>{gstAmount.toFixed(2)}</span>
//             </div>

//             <div className="flex justify-between font-semibold text-base">
//               <span>Grand Total</span>
//               <span>{grandTotal.toFixed(2)}</span>
//             </div>

//             <Select>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select Bank" />
//               </SelectTrigger>
//               <SelectContent>
//                 {banks.map((bank) => (
//                   <SelectItem key={bank._id} value={bank._id}>
//                     {bank.bankName}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         <div className="flex justify-end mt-6">
//           <Button>Save Invoice</Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Trash } from "lucide-react";
import { get, post } from "@/lib/api"; // make sure 'post' exists in your api helper
import { useSelector } from "react-redux";

export default function CreateInvoiceDialog({ open, onOpenChange }) {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [subProducts, setSubProducts] = useState([]);
  const [banks, setBanks] = useState([]);
  const { companyId } = useSelector((state) => state.auth.auth);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [items, setItems] = useState([
    { product: "", subProduct: "", description: "", qty: 1, rate: 0 },
  ]);

  const [discountType, setDiscountType] = useState("none");
  const [discountValue, setDiscountValue] = useState(0);

  const [gstType, setGstType] = useState("nogst");
  const [igst, setIgst] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [sgst, setSgst] = useState(0);

  const [loading, setLoading] = useState(false);

  /* ---------- FETCH DROPDOWNS ---------- */
  useEffect(() => {
    if (!open) return;

    const fetchDropdowns = async () => {
      try {
        const [clientRes, productRes, bankRes] = await Promise.all([
          get(`/client?companyId=${companyId}`),
          get(`/product-category?companyId=${companyId}`),
          get(`/bank-details?companyId=${companyId}`),
        ]);

        setClients(clientRes.data || []);
        setProducts(productRes || []);
        setBanks(bankRes || []);
      } catch (err) {
        console.error("Dropdown fetch failed", err);
      }
    };

    fetchDropdowns();
  }, [open, companyId]);

  const fetchSubProducts = async (productId) => {
    if (!productId) return setSubProducts([]);
    try {
      const res = await get(`/sub-product-category/${productId}`);
      setSubProducts(res || []);
    } catch (err) {
      console.error("Sub product fetch failed", err);
    }
  };

  /* ---------- CALCULATIONS ---------- */
  const subTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.qty * i.rate, 0),
    [items]
  );

  const discountAmount = useMemo(() => {
    if (discountType === "amount") return discountValue;
    if (discountType === "percent") return (subTotal * discountValue) / 100;
    return 0;
  }, [discountType, discountValue, subTotal]);

  const totalAfterDiscount = subTotal - discountAmount;

  const gstAmount = useMemo(() => {
    if (gstType === "igst") return (totalAfterDiscount * igst) / 100;
    if (gstType === "sgstcgst")
      return (
        (totalAfterDiscount * sgst) / 100 + (totalAfterDiscount * cgst) / 100
      );
    return 0;
  }, [gstType, igst, sgst, cgst, totalAfterDiscount]);

  const grandTotal = totalAfterDiscount + gstAmount;

  /* ---------- ITEM HANDLERS ---------- */
  const addItem = () =>
    setItems([
      ...items,
      { product: "", subProduct: "", description: "", qty: 1, rate: 0 },
    ]);

  const updateItem = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = value;
    setItems(updated);
  };

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  /* ---------- SAVE INVOICE ---------- */
  const handleSaveInvoice = async () => {
    if (!selectedClient) return alert("Please select a client");
    if (!items.length) return alert("Add at least one product");

    setLoading(true);

    try {
      const payload = {
        companyId,
        invoiceNumber: "INV-0001", // ideally generate on backend
        clientId: selectedClient,
        invoiceDate,
        items: items.map((i) => ({
          product: i.product,
          subProduct: i.subProduct,
          description: i.description,
          qty: i.qty,
          rate: i.rate,
          amount: i.qty * i.rate,
        })),
        discountType,
        discountValue,
        gstType,
        igst,
        cgst,
        sgst,
        subTotal,
        gstAmount,
        grandTotal,
        bankId: selectedBank,
      };

      const res = await post("/invoice", payload);

      if (res.success) {
        alert("Invoice saved successfully!");
        onOpenChange(false); // close dialog
        setItems([
          { product: "", subProduct: "", description: "", qty: 1, rate: 0 },
        ]);
        setDiscountType("none");
        setDiscountValue(0);
        setGstType("nogst");
        setIgst(0);
        setCgst(0);
        setSgst(0);
        setSelectedClient("");
        setSelectedBank("");
      } else {
        alert("Failed to save invoice: " + res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving invoice");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        {/* Client & Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger className="w-full">
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

          <Input disabled value="INV-0001" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {invoiceDate.toLocaleDateString()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Calendar
                captionLayout="dropdown"
                mode="single"
                selected={invoiceDate}
                onSelect={(date) => date && setInvoiceDate(date)}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Products & Summary (unchanged, keep your code) */}

        {/* Products */}
        <div className="mt-6 space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 border p-2 rounded-2xl sm:grid-cols-[1.5fr_1.5fr_2fr_0.7fr_1fr_1fr_0.3fr] gap-3"
            >
              {/* Product */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Product</label>
                <Select
                  value={item.product}
                  onValueChange={(value) => {
                    updateItem(index, "product", value);
                    updateItem(index, "subProduct", ""); // reset sub-product
                    fetchSubProducts(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.productName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sub Product */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Sub Product
                </label>
                <Select
                  value={item.subProduct}
                  onValueChange={(value) =>
                    updateItem(index, "subProduct", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Sub Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {subProducts.map((sp) => (
                      <SelectItem key={sp._id} value={sp._id}>
                        {sp.subProductName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Description
                </label>
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, "description", e.target.value)
                  }
                />
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Qty</label>
                <Input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) =>
                    updateItem(index, "qty", Number(e.target.value))
                  }
                />
              </div>

              {/* Rate */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Rate</label>
                <Input
                  type="number"
                  min={0}
                  value={item.rate}
                  onChange={(e) =>
                    updateItem(index, "rate", Number(e.target.value))
                  }
                />
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Amount</label>
                <Input
                  disabled
                  className="bg-muted font-medium"
                  value={(item.qty * item.rate).toFixed(2)}
                />
              </div>

              {/* Remove */}
              <Button
                variant="ghost"
                className="self-center mt-5"
                onClick={() => removeItem(index)}
              >
                <Trash size={16} />
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addItem}>
            + Add Product
          </Button>
        </div>

        {/* Summary */}
        <div className="mt-6 space-y-6">
          {/* Discount + GST */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* DISCOUNT */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Discount</h4>

              <Tabs value={discountType} onValueChange={setDiscountType}>
                <TabsList className="w-full">
                  <TabsTrigger value="none">No Discount</TabsTrigger>
                  <TabsTrigger value="amount">Amount</TabsTrigger>
                  <TabsTrigger value="percent">Percentage</TabsTrigger>
                </TabsList>

                <TabsContent value="amount">
                  <Input
                    type="number"
                    placeholder="Discount Amount"
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                  />
                </TabsContent>

                <TabsContent value="percent">
                  <Input
                    type="number"
                    placeholder="Discount %"
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* GST */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">GST</h4>

              <Tabs value={gstType} onValueChange={setGstType}>
                <TabsList className="w-full">
                  <TabsTrigger value="nogst">No GST</TabsTrigger>
                  <TabsTrigger value="igst">IGST</TabsTrigger>
                  <TabsTrigger value="sgstcgst">SGST + CGST</TabsTrigger>
                </TabsList>

                <TabsContent value="igst">
                  <Input
                    placeholder="IGST %"
                    onChange={(e) => setIgst(Number(e.target.value))}
                  />
                </TabsContent>

                <TabsContent value="sgstcgst" className="flex gap-2">
                  <Input
                    placeholder="SGST %"
                    onChange={(e) => setSgst(Number(e.target.value))}
                  />
                  <Input
                    placeholder="CGST %"
                    onChange={(e) => setCgst(Number(e.target.value))}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* TOTALS */}
          <div className="border-t pt-4 w-full sm:max-w-md sm:ml-auto space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{subTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>
              <span>-{discountAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>GST</span>
              <span>{gstAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-semibold text-base">
              <span>Grand Total</span>
              <span>{grandTotal.toFixed(2)}</span>
            </div>

            <Select value={selectedBank} onValueChange={setSelectedBank}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank._id} value={bank._id}>
                    {bank.bankName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveInvoice} disabled={loading}>
            {loading ? "Saving..." : "Save Invoice"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
