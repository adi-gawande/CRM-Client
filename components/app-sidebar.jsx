"use client";

import * as React from "react";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  Stethoscope,
  UserPlus,
  Users,
  LayoutDashboard,
  FileText,
  Briefcase,
  Tag,
  Database,
  Hash,
  Building,
  Hospital,
  Award,
  Layers,
  Shapes,
  Tags,
  Ambulance,
  CalendarDays,
  WandSparkles,
  Pill,
  FlaskConical,
  Settings,
  Footprints,
  CalendarPlus,
  ClipboardList,
  IndianRupee,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSelector } from "react-redux";

// This is sample data.
const data = {
  // user: {
  //   name: "John Doe",
  //   email: "john@crm.com",
  //   avatar: "/avatars/user-avatar.png",
  // },

  teams: [
    {
      name: "SUPER ADMIN",
      logo: UserPlus,
      plan: "57 Patients",
      no: "57",
    },
    {
      name: "ADMIN",
      logo: Settings,
      plan: "23 Masters",
    },
    {
      name: "MASTER",
      logo: Database,
      plan: "23 Databases",
    },
    {
      name: "EXTRA",
      logo: Database,
      plan: "23 Databases",
    },
  ],

  navMain: [
    {
      title: "Appointments",
      url: "/opd/appointments",
      icon: CalendarPlus,
      items: [
        { title: "Company", url: "/hr/company" },
        { title: "User", url: "/hr/user" }, // { title: "Department", url: "/general-setup/department" },
      ],
    },
    {
      title: "Visit Registration",
      url: "/front-desk/visit-registration",
      icon: ClipboardList,
      items: [
        { title: "Company", url: "/hr/company" },
        { title: "User", url: "/hr/user" },
        // { title: "Department", url: "/general-setup/department" },
      ],
    },
    {
      title: "Billing",
      url: "/front-desk/billing",
      icon: IndianRupee,
      items: [
        { title: "Company", url: "/hr/company" },
        { title: "User", url: "/hr/user" },
        // { title: "Department", url: "/general-setup/department" },
      ],
    },
    {
      title: "All Patients",
      url: "/patients",
      icon: Users,
      items: [
        // { title: "Company", url: "/hr/company" },
        // { title: "User", url: "/hr/user" },
        // { title: "Department", url: "/general-setup/department" },
      ],
    },
    {
      title: "EMR",
      url: "/emr",
      icon: FileText,
      items: [
        // { title: "Company", url: "/hr/company" },
        // { title: "User", url: "/hr/user" },
        // { title: "Department", url: "/general-setup/department" },
      ],
    },
  ],

  projects: [
    // General / Reference Masters
    { name: "User", url: "/hr/user", icon: Hash },

    // Education / Qualifications
    {
      name: "leadType",
      url: "/master/education/qualifications/leadType",
      icon: FileText,
    },
    {
      name: "Graduation",
      url: "/master/education/qualifications/graduation",
      icon: GraduationCap,
    },
    {
      name: "Post Graduation",
      url: "/master/education/qualifications/post-graduation",
      icon: Award,
    },
    {
      name: "Super Speciality",
      url: "/master/education/specialities",
      icon: Stethoscope,
    },
    {
      name: "Regulatory Councils",
      url: "/master/education/councils",
      icon: BookOpen,
    },

    // HR / User Management
    { name: "Users", url: "/hr/users", icon: Users },
    { name: "Employee Role", url: "/master/roles", icon: Briefcase },
    { name: "Designation", url: "/general-setup/designation", icon: Tag },
  ],
};

const navByTeam = {
  "SUPER ADMIN": [
    { title: "Client", url: "/super-admin/client", icon: Hash },
    { title: "Invoice", url: "/super-admin/invoice", icon: Hospital },
  ],

  ADMIN: [
    { title: "Prospect", url: "/admin/prospect", icon: Hash },
    { title: "Lead", url: "/admin/lead", icon: Hash },
    { title: "Client", url: "/admin/client", icon: Hash },
    { title: "Invoice", url: "/admin/invoice", icon: Hospital },
    { title: "Task", url: "/admin/task", icon: Building },
    { title: "Ticket", url: "/admin/ticket", icon: Building },
    { title: "User", url: "/hr/user", icon: Users },
  ],

  MASTER: [{ title: "Prefixes", url: "/master/refs/prefixes", icon: Hash }],

  EXTRA: [
    { title: "Schedule", url: "/hr/schedule", icon: Users },
    { title: "UHID", url: "/db/uhid", icon: Hash },
    { title: "Logs", url: "/db/logs", icon: Hash },
    { title: "Audit", url: "/db/audit", icon: Hash },
    { title: "Ledger", url: "/db/ledger", icon: Hash },
    { title: "Sub Ledger", url: "/db/sub-ledger", icon: Hash },

    { title: "Payment Mode", url: "/db/payment-mode", icon: Hash },
    { title: "Payee Category", url: "/db/payee-category", icon: Hash },
    { title: "Service Group", url: "/db/service-group", icon: Hash },
    { title: "Service Detail", url: "/db/service-detail", icon: Hash },
    { title: "Service Rate", url: "/db/service-rate", icon: Hash },
    // Education / Qualifications
    {
      title: "leadType",
      url: "/master/education/qualifications/leadType",
      icon: FileText,
    },
    {
      title: "Graduation",
      url: "/master/education/qualifications/graduation",
      icon: GraduationCap,
    },
    {
      title: "Post Graduation",
      url: "/master/education/qualifications/post-graduation",
      icon: Award,
    },
    {
      title: "Super Speciality",
      url: "/master/education/specialities",
      icon: Stethoscope,
    },
    {
      title: "Regulatory Councils",
      url: "/master/education/councils",
      icon: BookOpen,
    },

    // HR / User Management
    { title: "Employee Role", url: "/master/roles", icon: Briefcase },
    { title: "Designation", url: "/general-setup/designation", icon: Tag },
    {
      title: "Appointments",
      url: "/opd/appointments",
      icon: CalendarPlus,
      items: [
        { title: "Company", url: "/hr/company" },
        { title: "User", url: "/hr/user" }, // { title: "Department", url: "/general-setup/department" },
      ],
    },
    {
      title: "Visit Registration",
      url: "/opd/registration",
      icon: ClipboardList,
      items: [
        { title: "Company", url: "/hr/company" },
        { title: "User", url: "/hr/user" },
        // { title: "Department", url: "/general-setup/department" },
      ],
    },
    {
      title: "Billing",
      url: "/billing",
      icon: IndianRupee,
      items: [
        { title: "Company", url: "/hr/company" },
        { title: "User", url: "/hr/user" },
        // { title: "Department", url: "/general-setup/department" },
      ],
    },
    {
      title: "All Patients",
      url: "/patients",
      icon: Users,
      items: [
        // { title: "Company", url: "/hr/company" },
        // { title: "User", url: "/hr/user" },
        // { title: "Department", url: "/general-setup/department" },
      ],
    },
    {
      title: "EMR",
      url: "/emr",
      icon: FileText,
      items: [
        // { title: "Company", url: "/hr/company" },
        // { title: "User", url: "/hr/user" },
        // { title: "Department", url: "/general-setup/department" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }) {
  const activeTeam = useSelector((state) => state.team.activeTeam);
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navByTeam[activeTeam] || []} />

        {/* <NavMain items={data.navMain} /> */}
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
