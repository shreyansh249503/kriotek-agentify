"use client";

import { useState, useMemo } from "react";
import { Loader, SearchBar, EmptyState, Pagination } from "@/components";
import {
  TableContainer,
  TableWrapper,
  StyledTable,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  UserName,
  UserIconWrapper,
  LeadsContainer,
  LoadingContainer,
  ControlsContainer,
  BotBadge,
  ContactInfo,
  DateText,
} from "./styled";
import { User as UserIcon, AddressBook as LeadsIcon } from "@phosphor-icons/react";
import { useLeads } from "@/hooks/useLead";

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const { data: leads, isLoading } = useLeads();

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const filteredLeads = useMemo(() => {
    return (leads ?? []).filter((lead) => {
      const searchStr = searchTerm.toLowerCase();
      return (
        lead.name.toLowerCase().includes(searchStr) ||
        lead.email.toLowerCase().includes(searchStr) ||
        lead.phone.toLowerCase().includes(searchStr) ||
        lead.bot_name.toLowerCase().includes(searchStr)
      );
    });
  }, [leads, searchTerm]);

  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const currentLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <Loader />
      </LoadingContainer>
    );
  }

  return (
    <LeadsContainer>
      <ControlsContainer>
        <SearchBar placeholder="Search leads..." onSearch={handleSearch} />
      </ControlsContainer>

      {filteredLeads.length > 0 ? (
        <TableContainer>
          <TableWrapper>
            <StyledTable>
              <TableHead>
                <TableRow>
                  <TableHeader>User</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Phone Number</TableHeader>
                  <TableHeader>Collected By</TableHeader>
                  <TableHeader>Date</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <UserName>
                        <UserIconWrapper>
                          <UserIcon size={20} weight="bold" />
                        </UserIconWrapper>
                        {lead.name || "Anonymous"}
                      </UserName>
                    </TableCell>
                    <TableCell>
                      <ContactInfo>
                        {(lead.email && <div>{lead.email}</div>) || "No Email"}
                      </ContactInfo>
                    </TableCell>
                    <TableCell>
                      <ContactInfo>
                        {(lead.phone && <div>{lead.phone}</div>) || "No Phone"}
                      </ContactInfo>
                    </TableCell>
                    <TableCell>
                      <BotBadge>{lead.bot_name}</BotBadge>
                    </TableCell>
                    <TableCell>
                      <DateText>
                        {(() => {
                          const raw = lead.created_at;
                          if (!raw) return "—";

                          // Robustly handle different formats to ensure UTC parsing
                          let normalized = raw.trim();

                          // Replace space with T for ISO compliance if needed
                          if (!normalized.includes("T") && normalized.includes(" ")) {
                            normalized = normalized.replace(" ", "T");
                          }

                          // Only append Z if no timezone information is present
                          const hasTimezone =
                            normalized.includes("Z") ||
                            normalized.includes("+") ||
                            (/-\d{2}(:?\d{2})?$/.test(normalized) &&
                              normalized.length > 10);

                          const utcStr = hasTimezone ? normalized : `${normalized}Z`;
                          const date = new Date(utcStr);

                          if (isNaN(date.getTime())) return raw;

                          return date.toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          });
                        })()}
                      </DateText>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </StyledTable>
          </TableWrapper>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            totalItems={filteredLeads.length}
          />
        </TableContainer>
      ) : (
        <EmptyState
          icon={<LeadsIcon size={48} weight="duotone" />}
          title={
            searchTerm
              ? `No leads found matching "${searchTerm}"`
              : "No leads collected yet"
          }
          description={
            searchTerm
              ? "Try adjusting your search terms or filters"
              : "Your bots will collect user contact details once they start interacting."
          }
        />
      )}
    </LeadsContainer>
  );
}
