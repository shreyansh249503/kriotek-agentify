"use client";

import { COLOR, BREAKPOINTS } from "@/styles";
import styled from "styled-components";
import { TextField } from "@mui/material";

export const Form = styled.form`
  width: 100%;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
export const FormContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;

  @media (max-width: 1380px) {
    flex-direction: column;
  }
`;

export const LeftContainer = styled.div`
  flex: 1 1 0;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const CountWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

export const Label = styled.label`
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: ${COLOR.DARK};

  &.total-products {
    color: darkgreen;
    font-size: 16px;
    font-weight: 600;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid ${COLOR.BORDER};
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: ${COLOR.LIGHT};
  color: ${COLOR.DARK};

  &:focus {
    outline: none;
    background: ${COLOR.WHITE};
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 0 0 4px rgba(168, 225, 12, 0.1);
  }

  &::placeholder {
    color: ${COLOR.TEXT_SECONDARY};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 16px;
  border: 2px solid ${COLOR.BORDER};
  border-radius: 12px;
  font-size: 15px;
  min-height: 160px;
  transition: all 0.3s ease;
  background: ${COLOR.LIGHT};
  color: ${COLOR.DARK};
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    background: ${COLOR.WHITE};
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 0 0 4px rgba(168, 225, 12, 0.1);
  }

  &::placeholder {
    color: ${COLOR.TEXT_SECONDARY};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 16px;
  border: 2px solid ${COLOR.BORDER};
  border-radius: 12px;
  font-size: 15px;
  background-color: ${COLOR.LIGHT};
  color: ${COLOR.DARK};
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  padding-right: 40px;

  &:focus {
    outline: none;
    background-color: ${COLOR.WHITE};
    border-color: ${COLOR.PRIMARY};
    box-shadow: 0 0 0 4px rgba(168, 225, 12, 0.1);
  }

  &:hover {
    border-color: ${COLOR.TEXT_SECONDARY};
  }

  option {
    padding: 8px;
    font-size: 14px;
  }
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 32px;
  background-color: ${COLOR.CREAM};
  border-radius: 16px;
  border: 1px solid ${COLOR.BORDER};
  height: 100%;

  @media (max-width: ${BREAKPOINTS.MOBILE}) {
    padding: 20px;
  }
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  width: 100%;
`;

export const TopRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 1600px) {
    grid-template-columns: 1fr;
  }
`;

export const SectionHeader = styled.div`
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

export const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const HelperText = styled.p`
  font-size: 13px;
  color: ${COLOR.TEXT_SECONDARY};
  margin-top: 4px;
  margin-bottom: 0;
`;

export const ToggleContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  user-select: none;
`;

export const ToggleSwitch = styled.div<{ checked: boolean }>`
  position: relative;
  width: 52px;
  height: 28px;
  background-color: ${({ checked }) =>
    checked ? COLOR.PRIMARY : COLOR.BORDER};
  border-radius: 999px;
  transition: all 0.3s ease;

  &::after {
    content: "";
    position: absolute;
    top: 4px;
    left: ${({ checked }) => (checked ? "28px" : "4px")};
    width: 20px;
    height: 20px;
    background-color: ${COLOR.WHITE};
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

export const EmbedSection = styled.div`
  padding: 20px;
  background-color: ${COLOR.CREAM};
  border-radius: 16px;
  border: 1px solid ${COLOR.BORDER};
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const CodeBlock = styled.div`
  position: relative;
  background: ${COLOR.DARK};
  padding: 14px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  overflow: hidden;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
`;

export const CodeText = styled.code`
  font-family: "Fira Code", monospace;
  font-size: 14px;
  color: #a8e10c;
  word-break: break-all;
  line-height: 1.5;
`;

export const IconButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const CopyStatus = styled.span`
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${COLOR.PRIMARY};
  letter-spacing: 0.05em;
  pointer-events: none;
`;
export const SideContainer = styled.div`
  position: sticky;
  top: 105px;
  height: fit-content;
  width: 380px;
  max-width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  z-index: 10;

  @media (max-width: 1380px) {
    position: static;
    width: 100%;
    max-width: 100%;
  }
`;

export const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 10px;

  @media (max-width: ${BREAKPOINTS.TABLET}) {
    grid-template-columns: 1fr;
  }
`;

export const UploadContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 10px;
`;

export const UploadButton = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${COLOR.WHITE};
  border: 2px dashed ${COLOR.BORDER};
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: ${COLOR.DARK};
  transition: all 0.3s ease;

  &:hover {
    border-color: ${COLOR.PRIMARY};
    background: ${COLOR.LIGHT};
  }

  input {
    display: none;
  }
`;

export const RemoveButton = styled.button`
  background: #a8e10b6b;
  border: 1px solid #a8e10b;
  color: #2e2e2e;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 50px;
  transition: all 0.2s;

  &:hover {
    background: rgba(168, 225, 11, 0.75);
  }
`;

export const CatalogHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  width: 100%;
`;

export const CatalogProductCardContainer = styled.div`
  position: relative;
  width: 100%;
  height: fit-content;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 16px;
  margin-top: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const CatalogProductCard = styled.div`
  width: 100%;
  min-height: 240px;
  height: auto;
  display: flex;
  justify-content: flex-start;
  background: #f9fafb;
  border: 1px solid ${COLOR.BORDER};
  border-radius: 16px;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  padding: 12px;
  box-sizing: border-box;

  &:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    border-color: ${COLOR.PRIMARY};
  }

  @media (max-width: 540px) {
    flex-direction: column;
  }
`;

export const ProductImageContainer = styled.div`
  position: relative;
  width: 200px;
  min-width: 130px;
  height: 100%;
  min-height: 130px;
  background: ${COLOR.LIGHT};
  border: 1px solid ${COLOR.BORDER};
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  @media (max-width: 540px) {
    width: 100%;
    height: 180px;
    border-right: none;
    border-bottom: 1px solid ${COLOR.BORDER};
  }
`;

export const ProductImageThumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const ProductImageOverlay = styled.label`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;

  ${ProductImageContainer}:hover & {
    opacity: 1;
  }
`;

export const UploadOverlayLabel = styled.span`
  color: ${COLOR.WHITE};
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid ${COLOR.WHITE};
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const ProductImageUploadPlaceholder = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 24px);
  height: calc(100% - 24px);
  margin: 12px;
  cursor: pointer;
  color: ${COLOR.TEXT_SECONDARY};
  font-size: 13px;
  font-weight: 600;
  border: 2px dashed ${COLOR.BORDER};
  border-radius: 12px;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(168, 225, 12, 0.05);
    color: ${COLOR.PRIMARY};
    border-color: ${COLOR.PRIMARY};
  }

  svg {
    stroke: currentColor;
  }
`;

export const DeleteProductButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${COLOR.WHITE};
  border: 1px solid rgba(0, 0, 0, 0.08);
  color: #6b7280;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;

  &:hover {
    transform: scale(1.08);
    background: #ef4444;
    color: ${COLOR.WHITE};
    border-color: #ef4444;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const ProductFieldsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 26px 12px 20px 12px;
`;

export const ProductTextField = styled(TextField)`
  width: 100%;

  .MuiOutlinedInput-root {
    border-radius: 8px;
    background-color: ${COLOR.LIGHT};
    font-size: 14px;
    transition: all 0.3s ease;
    color: ${COLOR.DARK};

    fieldset {
      border: 1px solid ${COLOR.BORDER};
      transition: border-color 0.2s ease;
    }

    &:hover fieldset {
      border-color: ${COLOR.PRIMARY};
    }

    &.Mui-focused {
      background-color: ${COLOR.WHITE};
      fieldset {
        border-color: ${COLOR.PRIMARY};
        border-width: 1px;
      }
      box-shadow: 0 0 0 4px rgba(168, 225, 12, 0.1);
    }

    input {
      padding: 11px 14px;
    }
  }

  .MuiInputLabel-root {
    font-size: 14px;
    color: ${COLOR.TEXT_SECONDARY};
    transform: translate(14px, 11px) scale(1);

    &.MuiInputLabel-shrink {
      transform: translate(14px, -9px) scale(0.75);
    }

    &.Mui-focused {
      color: ${COLOR.DARK};
    }
  }
`;

export const ProductFileInput = styled.input`
  font-size: 13px;
  width: 100%;
  padding: 8px 0;
  cursor: pointer;

  &::file-selector-button {
    background: ${COLOR.WHITE};
    border: 1px solid ${COLOR.BORDER};
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    margin-right: 8px;
    transition: all 0.2s;

    &:hover {
      background: ${COLOR.LIGHT};
      border-color: ${COLOR.PRIMARY};
    }
  }
`;

export const SmallLabel = styled(Label)`
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
`;

export const GridFullWidth = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
`;

export const AutoExtractContainer = styled.div`
  background: rgba(255, 255, 255, 0.4);
  border: 2px dashed ${COLOR.PRIMARY};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const AutoExtractTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const AutoExtractIcon = styled.svg`
  stroke: ${COLOR.DARK};
`;

export const AutoExtractTitle = styled.span`
  font-weight: 700;
  font-size: 15px;
  color: ${COLOR.DARK};
`;

export const AutoExtractDescription = styled.div`
  font-size: 13px;
  color: ${COLOR.TEXT_SECONDARY};
  line-height: 1.4;
`;

export const AutoExtractInputRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 4px;
  align-items: center;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const CrawlInput = styled(Input)`
  flex: 1 1 0;
  min-width: 0;
  padding: 12px 16px;
  border-radius: 10px;
`;

export const CrawlStatusMessage = styled.div<{ $isError?: boolean }>`
  font-size: 13px;
  font-weight: 600;
  margin-top: 4px;
  color: ${({ $isError }) => ($isError ? "#ef4444" : "#10b981")};
`;

export const ProductDetailsSection = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12px;
  gap: 16px;
`;

export const ProductDetailsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
  min-width: 0;
`;

export const ProductCardTitle = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: ${COLOR.DARK};
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
`;

export const CardActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding-top: 10px;
`;

export const CardIconButton = styled.button<{
  $variant?: "danger" | "primary";
}>`
  background: ${COLOR.WHITE};
  border: 1px solid ${COLOR.BORDER};
  color: ${({ $variant }) => ($variant === "danger" ? "#ef4444" : "#6b7280")};
  cursor: pointer;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.08);
    background: ${({ $variant }) =>
      $variant === "danger" ? "#ef4444" : COLOR.PRIMARY};
    color: ${COLOR.WHITE};
    border-color: ${({ $variant }) =>
      $variant === "danger" ? "#ef4444" : COLOR.PRIMARY};
    box-shadow: ${({ $variant }) =>
      $variant === "danger"
        ? "0 4px 12px rgba(239, 68, 68, 0.2)"
        : "0 4px 12px rgba(168, 225, 12, 0.2)"};
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid ${COLOR.BORDER};
`;

export const PriceLabel = styled.span`
  font-size: 14px;
  color: ${COLOR.TEXT_SECONDARY};
  font-weight: 500;
`;

export const PriceValue = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #4c6b36;
`;

export const LinkRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const LinkLabel = styled.span`
  font-size: 13px;
  color: ${COLOR.TEXT_SECONDARY};
  font-weight: 500;
`;

export const LinkContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
`;

export const LinkUrl = styled.span`
  font-size: 14px;
  color: ${COLOR.DARK};
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
`;

export const LinkIconWrapper = styled.div`
  color: ${COLOR.TEXT_SECONDARY};
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export const ViewProductButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: fit-content;
  padding: 10px 24px;
  background: #5d7e48;
  color: ${COLOR.WHITE};
  font-size: 15px;
  font-weight: 600;
  border-radius: 24px;
  text-decoration: none;
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(93, 126, 72, 0.2);

  &:hover {
    background: #4c693a;
    box-shadow: 0 6px 18px rgba(93, 126, 72, 0.35);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const SaveProductButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 10px;
  font-size: 14px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: ${COLOR.PRIMARY};
  color: ${COLOR.DARK};
  transition: all 0.3s ease;

  &:hover {
    background: ${COLOR.PRIMARY_HOVER};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const MetadataBadgesWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

export const MetadataBadge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(168, 225, 12, 0.18);
  color: #2b3d1d;
  border: 1px solid rgba(168, 225, 12, 0.4);
  white-space: nowrap;
`;

export const MetadataSectionToggle = styled.button`
  background: none;
  border: none;
  color: #3b5328;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  text-decoration: underline;

  &:hover {
    color: ${COLOR.PRIMARY};
  }
`;

export const MetadataFieldsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border: 1px dashed ${COLOR.BORDER};
  border-radius: 10px;
  margin-top: 6px;

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;
