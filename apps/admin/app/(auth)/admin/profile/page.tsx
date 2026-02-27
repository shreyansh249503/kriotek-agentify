"use client";

import React, { useState } from "react";
import { DashboardWrapper, SectionTitle } from "../styled";
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
  Select,
  SaveButtonWrap,
  SaveButton,
} from "./styled";
import {
  User,
  ShieldCheck,
  Camera,
  FloppyDisk,
  LockKey,
} from "@phosphor-icons/react";
import { CustomSelect } from "@/components";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    firstName: "Demo",
    lastName: "User",
    email: "demo@agentify.ai",
    phone: "+1 (555) 123-4567",
    company: "Agentify Inc.",
    role: "Administrator",
    language: "en",
    timezone: "UTC-5",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const currentInitials =
    formData.firstName.charAt(0) + formData.lastName.charAt(0);

  return (
    <ProfileContainer>
      <ProfileHeaderCard>
        <AvatarSection>
          <AvatarInitials>{currentInitials}</AvatarInitials>
          <AvatarEditButton title="Change avatar">
            <Camera size={16} weight="bold" />
          </AvatarEditButton>
        </AvatarSection>

        <ProfileInfo>
          <ProfileName>
            {formData.firstName} {formData.lastName}
          </ProfileName>
          <ProfileEmail>{formData.email}</ProfileEmail>
          <RoleBadge>
            <ShieldCheck size={16} weight="fill" />
            {formData.role}
          </RoleBadge>
        </ProfileInfo>
      </ProfileHeaderCard>

      <FormSection>
        <FormSectionTitle>
          <User size={20} weight="duotone" />
          Personal Information
        </FormSectionTitle>

        <FormGrid>
          <FormGroup>
            <Label>First Name</Label>
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
            />
          </FormGroup>

          <FormGroup>
            <Label>Last Name</Label>
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
            />
          </FormGroup>

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
        </FormGrid>
      </FormSection>

      <FormSection>
        <FormSectionTitle>
          <LockKey size={20} weight="duotone" />
          Preferences & Security
        </FormSectionTitle>

        <FormGrid>
          <FormGroup>
            <Label>Language</Label>

            <CustomSelect
              value={formData.language}
              onChange={(value) =>
                setFormData({ ...formData, language: value })
              }
              options={[
                { value: "en", label: "English (US)" },
                { value: "es", label: "Spanish" },
                { value: "fr", label: "French" },
                { value: "de", label: "German" },
              ]}
            />
          </FormGroup>

          <FormGroup>
            <Label>Timezone</Label>

            <CustomSelect
              value={formData.timezone}
              onChange={(value) =>
                setFormData({ ...formData, timezone: value })
              }
              options={[
                { value: "UTC-8", label: "Pacific Time (PT) UTC-8" },
                { value: "UTC-5", label: "Eastern Time (ET) UTC-5" },
                { value: "UTC+0", label: "Greenwich Mean Time (GMT) UTC+0" },
                { value: "UTC+1", label: "Central European Time (CET) UTC+1" },
                {
                  value: "UTC+5.5",
                  label: "India Standard Time (IST) UTC+5:30",
                },
              ]}
            />
          </FormGroup>

          <FormGroup>
            <Label>Password</Label>
            <Input
              type="password"
              value="********"
              readOnly
              placeholder="Password"
            />
          </FormGroup>
        </FormGrid>
      </FormSection>

      {/* <SaveButtonWrap> */}
      <SaveButton onClick={handleSave} disabled={isLoading}>
        <FloppyDisk size={20} weight="bold" />
        {isLoading ? "Saving Changes..." : "Save Changes"}
      </SaveButton>
      {/* </SaveButtonWrap> */}
    </ProfileContainer>
  );
}
