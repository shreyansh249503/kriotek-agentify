"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  SettingsContainer,
  DashboardWrapper,
  SettingsHeader,
  SettingsTitle,
  SettingsSubtitle,
  SettingsGrid,
  SidebarNav,
  NavItem,
  SettingsContent,
  SettingsSection,
  SectionHeader,
  SectionTitle,
  SettingsRow,
  SettingInfo,
  SettingLabel,
  SettingDescription,
  ToggleSwitch,
  ActionButton,
  DangerZone,
} from "./styled";
import {
  GearSixIcon,
  PaletteIcon,
  BellRingingIcon,
  ShieldCheckIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import useMotion from "@/hooks/useMotion";

export default function SettingsPage() {
  const { containerVariants, itemVariants } = useMotion();
  const [activeTab, setActiveTab] = useState("general");

  const [settings, setSettings] = useState({
    workspaceName: "My Agentify Workspace",
    language: "English (US)",
    darkMode: false,
    emailNotifications: true,
    browserNotifications: false,
    marketingEmails: false,
    apiKey: "ag_live_************************",
  });

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const tabs = [
    { id: "general", label: "General", icon: <GearSixIcon size={20} /> },
    { id: "appearance", label: "Appearance", icon: <PaletteIcon size={20} /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <BellRingingIcon size={20} />,
    },
    {
      id: "security",
      label: "Security & API",
      icon: <ShieldCheckIcon size={20} />,
    },
  ];

  return (
    <SettingsContainer>
      <DashboardWrapper
        as={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <SettingsHeader as={motion.div} variants={itemVariants}>
          <SettingsTitle>Settings</SettingsTitle>
          <SettingsSubtitle>
            Manage your workspace preferences and platform configuration.
          </SettingsSubtitle>
        </SettingsHeader>

        <SettingsGrid>
          <SidebarNav as={motion.div} variants={itemVariants}>
            {tabs.map((tab) => (
              <NavItem
                key={tab.id}
                $active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
              </NavItem>
            ))}
          </SidebarNav>

          <SettingsContent as={motion.div} variants={itemVariants}>
            {activeTab === "general" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <SettingsSection>
                  <SectionHeader>
                    <SectionTitle>
                      <GearSixIcon size={22} weight="duotone" />
                      General Settings
                    </SectionTitle>
                    <ActionButton>Save Changes</ActionButton>
                  </SectionHeader>

                  <SettingsRow>
                    <SettingInfo>
                      <SettingLabel>Workspace Name</SettingLabel>
                      <SettingDescription>
                        The name displayed in your dashboard and emails.
                      </SettingDescription>
                    </SettingInfo>
                    <input
                      type="text"
                      value={settings.workspaceName}
                      className="settings-input"
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          workspaceName: e.target.value,
                        })
                      }
                      style={{
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "1px solid #D4E8C1",
                        width: "240px",
                      }}
                    />
                  </SettingsRow>

                  <SettingsRow>
                    <SettingInfo>
                      <SettingLabel>Display Language</SettingLabel>
                      <SettingDescription>
                        Choose your preferred language for the interface.
                      </SettingDescription>
                    </SettingInfo>
                    <select
                      value={settings.language}
                      style={{
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "1px solid #D4E8C1",
                        width: "240px",
                      }}
                    >
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </SettingsRow>
                </SettingsSection>

                <DangerZone style={{ marginTop: "24px" }}>
                  <SectionHeader>
                    <SectionTitle>
                      <TrashIcon size={22} weight="duotone" />
                      Danger Zone
                    </SectionTitle>
                  </SectionHeader>

                  <SettingsRow>
                    <SettingInfo>
                      <SettingLabel>Delete Workspace</SettingLabel>
                      <SettingDescription>
                        Permanently delete this workspace and all associated
                        data. This action cannot be undone.
                      </SettingDescription>
                    </SettingInfo>
                    <ActionButton $danger>Delete Everything</ActionButton>
                  </SettingsRow>
                </DangerZone>
              </motion.div>
            )}

            {activeTab === "appearance" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <SettingsSection>
                  <SectionHeader>
                    <SectionTitle>
                      <PaletteIcon size={22} weight="duotone" />
                      Appearance
                    </SectionTitle>
                  </SectionHeader>

                  <SettingsRow>
                    <SettingInfo>
                      <SettingLabel>Dark Mode</SettingLabel>
                      <SettingDescription>
                        Switch between light and dark theme (Coming Soon).
                      </SettingDescription>
                    </SettingInfo>
                    <ToggleSwitch>
                      <input
                        type="checkbox"
                        checked={settings.darkMode}
                        onChange={() => handleToggle("darkMode")}
                      />
                      <span></span>
                    </ToggleSwitch>
                  </SettingsRow>

                  <SettingsRow>
                    <SettingInfo>
                      <SettingLabel>Compact Mode</SettingLabel>
                      <SettingDescription>
                        Use a denser UI with less padding for high-information
                        density.
                      </SettingDescription>
                    </SettingInfo>
                    <ToggleSwitch>
                      <input type="checkbox" />
                      <span></span>
                    </ToggleSwitch>
                  </SettingsRow>
                </SettingsSection>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <SettingsSection>
                  <SectionHeader>
                    <SectionTitle>
                      <BellRingingIcon size={22} weight="duotone" />
                      Notifications
                    </SectionTitle>
                  </SectionHeader>

                  <SettingsRow>
                    <SettingInfo>
                      <SettingLabel>Email Notifications</SettingLabel>
                      <SettingDescription>
                        Receive weekly digest and critical alerts via email.
                      </SettingDescription>
                    </SettingInfo>
                    <ToggleSwitch>
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={() => handleToggle("emailNotifications")}
                      />
                      <span></span>
                    </ToggleSwitch>
                  </SettingsRow>

                  <SettingsRow>
                    <SettingInfo>
                      <SettingLabel>Browser Notifications</SettingLabel>
                      <SettingDescription>
                        Show push notifications for new leads and interactions.
                      </SettingDescription>
                    </SettingInfo>
                    <ToggleSwitch>
                      <input
                        type="checkbox"
                        checked={settings.browserNotifications}
                        onChange={() => handleToggle("browserNotifications")}
                      />
                      <span></span>
                    </ToggleSwitch>
                  </SettingsRow>
                </SettingsSection>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <SettingsSection>
                  <SectionHeader>
                    <SectionTitle>
                      <ShieldCheckIcon size={22} weight="duotone" />
                      Security & API
                    </SectionTitle>
                  </SectionHeader>

                  <SettingsRow>
                    <SettingInfo>
                      <SettingLabel>API Key</SettingLabel>
                      <SettingDescription>
                        Use this key to integrate Agentify with your own
                        applications.
                      </SettingDescription>
                    </SettingInfo>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <code
                        style={{
                          background: "#f1f5f9",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {settings.apiKey}
                      </code>
                      <ActionButton>Rotate</ActionButton>
                    </div>
                  </SettingsRow>

                  <SettingsRow>
                    <SettingInfo>
                      <SettingLabel>Two-Factor Authentication</SettingLabel>
                      <SettingDescription>
                        Add an extra layer of security to your account.
                      </SettingDescription>
                    </SettingInfo>
                    <ActionButton>Enable 2FA</ActionButton>
                  </SettingsRow>
                </SettingsSection>
              </motion.div>
            )}
          </SettingsContent>
        </SettingsGrid>
      </DashboardWrapper>
    </SettingsContainer>
  );
}
