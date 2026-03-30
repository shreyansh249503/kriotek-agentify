"use client";

import React, { useState } from "react";
import {
  ProfileContainer,
  ProfileHeaderCard,
  AvatarSection,
  AvatarInitials,
  AvatarEditButton,
  ProfileInfo,
  ProfileName,
  ProfileEmail,
  RoleBadge,
  FormSection,
  FormSectionTitle,
  FormGrid,
  FormGroup,
  Label,
  Input,
  SaveButton,
  DashboardWrapper,
} from "./styled";
import { useCurrentUser } from "@/hooks/useAuth";
import { Loader } from "@/components";
import { supabase } from "@/lib/supabase";
import type { User, UserAttributes } from "@supabase/supabase-js";
import {
  UserIcon,
  ShieldCheckIcon,
  CameraIcon,
  CircleNotchIcon,
} from "@phosphor-icons/react";
import { SuccessMessage, ErrorMessage } from "./styled";

interface ProfileFormProps {
  user: User;
}

function ProfileForm({ user }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: user.user_metadata?.name || "",
    email: user.email || "",
    phone: user.user_metadata?.phone || "",
    company: user.user_metadata?.company || "",
    role: user.user_metadata?.role || "",
    password: "",
    confirmPassword: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const updates: UserAttributes = {
        data: {
          name: formData.name,
          phone: formData.phone,
          company: formData.company,
        },
      };

      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (formData.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        updates.password = formData.password;
      }

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      setSuccessMsg("Profile updated successfully!");
      setFormData({ ...formData, password: "", confirmPassword: "" });
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("An error occurred while updating profile");
      setErrorMsg(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const currentInitials = formData.name
    ? formData.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  return (
    <DashboardWrapper>
      <ProfileHeaderCard>
        <AvatarSection>
          <AvatarInitials>{currentInitials}</AvatarInitials>
          <AvatarEditButton title="Change avatar">
            <CameraIcon size={16} weight="bold" />
          </AvatarEditButton>
        </AvatarSection>

        <ProfileInfo>
          <ProfileName>{formData.name || ""}</ProfileName>
          <ProfileEmail>{formData.email}</ProfileEmail>
          <RoleBadge>
            <ShieldCheckIcon size={16} weight="fill" />
            {formData.role}
          </RoleBadge>
        </ProfileInfo>
      </ProfileHeaderCard>

      <FormSection>
        {successMsg && <SuccessMessage>{successMsg}</SuccessMessage>}
        {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}

        <FormSectionTitle>
          <UserIcon size={20} weight="duotone" />
          Personal Information
        </FormSectionTitle>

        <FormGrid>
          <FormGroup>
            <Label>Full Name</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
            />
          </FormGroup>

          {/* <FormGroup>
            <Label>Last Name</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter last name"
            />
          </FormGroup> */}

          <FormGroup>
            <Label>Email Address</Label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              disabled
              title="Email cannot be changed directly"
            />
          </FormGroup>

          <FormGroup>
            <Label>Phone Number</Label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </FormGroup>

          <FormGroup>
            <Label>Company Name</Label>
            <Input
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Enter company name"
            />
          </FormGroup>
          <FormGroup>
            <Label>New Password</Label>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
            />
          </FormGroup>
          <FormGroup>
            <Label>Confirm New Password</Label>
            <Input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
            />
          </FormGroup>
        </FormGrid>
      </FormSection>

      <SaveButton onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          <>
            <CircleNotchIcon size={18} className="animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </SaveButton>
    </DashboardWrapper>
  );
}

export default function SettingsPage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <ProfileContainer>
      <ProfileForm user={user} />
    </ProfileContainer>
  );
}
