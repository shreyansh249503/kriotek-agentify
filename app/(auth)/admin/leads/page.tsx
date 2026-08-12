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
  ActionsGroup,
  FilterSelect,
  ExportButton,
  BotBadge,
  ContactInfo,
  DateText,
} from "./styled";
import {
  User as UserIcon,
  AddressBook as LeadsIcon,
  DownloadSimple as DownloadIcon,
  CaretUp,
  CaretDown,
} from "@phosphor-icons/react";
import { useLeads } from "@/hooks/useLead";

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [dateRange, setDateRange] = useState<"all" | "today" | "7days" | "30days">("all");
  const [referenceTime, setReferenceTime] = useState(() => Date.now());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const { data: leads, isLoading } = useLeads();

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setCurrentPage(1);
  };

  const handleDateSortToggle = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const handleDateRangeChange = (value: "all" | "today" | "7days" | "30days") => {
    setDateRange(value);
    setReferenceTime(Date.now());
    setCurrentPage(1);
  };

  const filteredAndSortedLeads = useMemo(() => {
    const result = (leads ?? []).filter((lead) => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch =
        lead.name.toLowerCase().includes(searchStr) ||
        lead.email.toLowerCase().includes(searchStr) ||
        lead.phone.toLowerCase().includes(searchStr) ||
        lead.bot_name.toLowerCase().includes(searchStr);

      if (!matchesSearch) return false;

      if (dateRange === "all" || !lead.created_at) return true;

      const leadDate = new Date(lead.created_at).getTime();
      if (isNaN(leadDate)) return true;

      if (dateRange === "today") {
        const oneDayAgo = referenceTime - 24 * 60 * 60 * 1000;
        return leadDate >= oneDayAgo;
      } else if (dateRange === "7days") {
        const sevenDaysAgo = referenceTime - 7 * 24 * 60 * 60 * 1000;
        return leadDate >= sevenDaysAgo;
      } else if (dateRange === "30days") {
        const thirtyDaysAgo = referenceTime - 30 * 24 * 60 * 60 * 1000;
        return leadDate >= thirtyDaysAgo;
      }

      return true;
    });

    result.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [leads, searchTerm, dateRange, sortOrder, referenceTime]);

  const totalPages = Math.ceil(filteredAndSortedLeads.length / pageSize);
  const currentLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedLeads.slice(start, start + pageSize);
  }, [filteredAndSortedLeads, currentPage]);

  const handleExportCSV = () => {
    if (!filteredAndSortedLeads.length) return;

    const headers = ["Name", "Email", "Phone", "Collected By", "Date"];
    const rows = filteredAndSortedLeads.map((lead) => [
      lead.name || "",
      lead.email || "",
      lead.phone || "",
      lead.bot_name || "",
      lead.created_at || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "agentify-leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
        <ActionsGroup>
          <FilterSelect
            aria-label="Filter by date range"
            data-testid="date-range-select"
            value={dateRange}
            onChange={(e) =>
              handleDateRangeChange(
                e.target.value as "all" | "today" | "7days" | "30days"
              )
            }
          >
            <option value="all">All Time</option>
            <option value="today">Today (Last 24h)</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </FilterSelect>

          <FilterSelect
            aria-label="Sort leads"
            data-testid="sort-order-select"
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as "desc" | "asc")
            }
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </FilterSelect>

          <ExportButton
            type="button"
            data-testid="export-csv-btn"
            onClick={handleExportCSV}
            disabled={filteredAndSortedLeads.length === 0}
          >
            <DownloadIcon size={16} weight="bold" />
            Export CSV
          </ExportButton>
        </ActionsGroup>
      </ControlsContainer>

      {filteredAndSortedLeads.length > 0 ? (
        <TableContainer>
          <TableWrapper>
            <StyledTable data-testid="leads-table">
              <TableHead>
                <TableRow>
                  <TableHeader>User</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Collected By</TableHeader>
                  <TableHeader
                    $clickable
                    data-testid="sort-date-header"
                    onClick={handleDateSortToggle}
                    title="Click to sort by date"
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      Date
                      {sortOrder === "desc" ? (
                        <CaretDown size={14} weight="bold" />
                      ) : (
                        <CaretUp size={14} weight="bold" />
                      )}
                    </span>
                  </TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentLeads.map((lead) => (
                  <TableRow key={lead.id} data-testid="lead-row">
                    <TableCell>
                      <UserName>
                        <UserIconWrapper>
                          <UserIcon size={20} weight="bold" />
                        </UserIconWrapper>
                        <span data-testid="lead-name">{lead.name || "Anonymous"}</span>
                      </UserName>
                    </TableCell>
                    <TableCell>
                      <ContactInfo data-testid="lead-email">
                        {(lead.email && <div>{lead.email}</div>) || "No Email"}
                      </ContactInfo>
                    </TableCell>
                    <TableCell>
                      <BotBadge data-testid="lead-bot">{lead.bot_name}</BotBadge>
                    </TableCell>
                    <TableCell>
                      <DateText data-testid="lead-date">
                        {(() => {
                          const raw = lead.created_at;
                          if (!raw) return "—";

                          let normalized = raw.trim();

                          if (
                            !normalized.includes("T") &&
                            normalized.includes(" ")
                          ) {
                            normalized = normalized.replace(" ", "T");
                          }

                          const hasTimezone =
                            normalized.includes("Z") ||
                            normalized.includes("+") ||
                            (/-\d{2}(:?\d{2})?$/.test(normalized) &&
                              normalized.length > 10);

                          const utcStr = hasTimezone
                            ? normalized
                            : `${normalized}Z`;
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
            totalItems={filteredAndSortedLeads.length}
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

