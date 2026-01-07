"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { get, put } from "@/lib/api";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const baseFields = [
  { key: "OfficeAddress", label: "Office Address", description: "Registered working address" },
  { key: "City", label: "City", description: "City of residence/operation" },
  { key: "State", label: "State", description: "State of operation" },
  { key: "Country", label: "Country", description: "Operating country" },
  { key: "Pincode", label: "Pincode", description: "Postal/Zip code" },
  { key: "GSTNumber", label: "GST Number", description: "Government GST registration number" },
  { key: "PanNumber", label: "PAN Number", description: "Permanent Account Number" },
  { key: "Website", label: "Website", description: "Company or personal website" },
  { key: "leadTypeId", label: "Lead Type", description: "Categorized type of incoming lead" },
  { key: "leadSourceId", label: "Lead Source", description: "Where the lead originated" },
  { key: "leadReferenceId", label: "Lead Reference", description: "Person or source referencing lead" },
  { key: "leadStatusId", label: "Lead Status", description: "Stage of lead in lifecycle" },
  { key: "AlternativePhoneNumber", label: "Alternative Phone", description: "Secondary contact number" },
  { key: "AlternativeEmail", label: "Alternative Email", description: "Secondary email address" },
  { key: "EmergencyContactPerson", label: "Emergency Contact Person", description: "Emergency contact name" },
  { key: "EmergencyContactNumber", label: "Emergency Contact Number", description: "Emergency contact phone" },
];

const groups = {
  prospect: baseFields,
  lead: baseFields,
  client: baseFields,
};

export default function SettingsPage() {
  const { companyId } = useSelector((state) => state.auth.auth);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const settingsData = {};
      for (const group of Object.keys(groups)) {
        const res = await get(`/field-settings?companyId=${companyId}&formType=${group}`);
        settingsData[group] = res?.data || {};
      }
      setSettings(settingsData);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchSettings();
    }
  }, [companyId]);

  const toggleSetting = (group, key) => {
    setSettings(prev => {
      const currentGroup = prev[group] || {};
      return {
        ...prev,
        [group]: { ...currentGroup, [key]: !currentGroup[key] }
      };
    });
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      for (const [group, fieldSettings] of Object.entries(settings)) {
        await put("/field-settings", {
          companyId,
          formType: group,
          fieldSettings
        });
      }
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error("Save settings failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-2">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Field Settings</h1>
        <Button onClick={saveSettings} disabled={loading}>
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {Object.entries(groups).map(([group, fields]) => (
        <Card key={group} className="border shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold capitalize">
              {group}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {fields.map((field) => (
              <div
                key={field.key}
                className="flex items-start justify-between border rounded-lg px-4 py-2 hover:bg-muted/40 transition"
              >
                <div className="mr-4">
                  <p className="font-medium">{field.label}</p>
                  <p className="text-sm text-muted-foreground">{field.description}</p>
                </div>

                <Switch
                  checked={settings[group]?.[field.key] ?? true}
                  onCheckedChange={() => toggleSetting(group, field.key)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
