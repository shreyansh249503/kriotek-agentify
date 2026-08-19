import React, { useState } from "react";
import { Product, ProductMetadata } from "@/types/bot";
import {
  CatalogProductCard,
  ProductImageContainer,
  ProductImageThumbnail,
  ProductImageOverlay,
  UploadOverlayLabel,
  ProductImageUploadPlaceholder,
  ProductDetailsSection,
  ProductFieldsRow,
  ProductTextField,
  SaveProductButton,
  ProductDetailsHeader,
  ProductCardTitle,
  PriceRow,
  PriceLabel,
  PriceValue,
  LinkRow,
  LinkLabel,
  LinkContent,
  LinkUrl,
  LinkIconWrapper,
  CardActionButtons,
  MetadataBadgesWrapper,
  MetadataBadge,
  MetadataSectionToggle,
  MetadataFieldsGrid,
} from "./styled";

interface ProductCardProps {
  product: Product;
  idx: number;
  isEditing: boolean;
  onSave: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateProduct: (updatedProduct: Product) => void;
  ecommerceEnabled: boolean;
}

export const ProductCard = ({
  product,
  idx,
  isEditing,
  onSave,
  onEdit,
  onDelete,
  onUpdateProduct,
  ecommerceEnabled,
}: ProductCardProps) => {
  const [uploading, setUploading] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      alert("File is too large. Max size is 1MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        onUpdateProduct({ ...product, image: data.url });
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const [touched, setTouched] = useState({
    name: false,
    price: false,
    url: false,
  });

  const isValidUrl = (value?: string) => {
    if (!value) return false;
    try {
      new URL(String(value).trim());
      return true;
    } catch {
      return false;
    }
  };

  const updateMetaField = (field: keyof ProductMetadata, value: string) => {
    const prevMeta = product.metadata || {};
    const updatedMeta: ProductMetadata = {
      ...prevMeta,
      [field]: value.trim() || undefined,
    };
    onUpdateProduct({
      ...product,
      ...(field === "brand" ? { brand: value.trim() || undefined } : {}),
      ...(field === "category" ? { category: value.trim() || undefined } : {}),
      metadata: updatedMeta,
    });
  };

  const nameError = touched.name && !String(product.name ?? "").trim();
  const priceError = touched.price && !String(product.price ?? "").trim();
  const urlError =
    touched.url &&
    (!String(product.url ?? "").trim() || !isValidUrl(product.url));

  const urlHelperText = touched.url
    ? !String(product.url ?? "").trim()
      ? "Product link is required"
      : !isValidUrl(product.url)
      ? "Invalid URL (must start with http:// or https://)"
      : ""
    : "";

  const isSaveDisabled =
    !String(product.name ?? "").trim() ||
    !String(product.price ?? "").trim() ||
    !String(product.url ?? "").trim() ||
    !isValidUrl(product.url) ||
    uploading;

  const meta = product.metadata || {};
  const metaBrand = meta.brand || product.brand;
  const metaCategory = meta.category || product.category || meta.type;
  const metaColor = meta.color;
  const metaSize = meta.size;
  const metaStyle = meta.style;
  const metaMaterial = meta.material;

  if (isEditing) {
    return (
      <CatalogProductCard>
        <ProductImageContainer>
          <input
            type="file"
            id={`product-image-${idx}`}
            accept="image/*"
            disabled={!ecommerceEnabled || uploading}
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          {product.image ? (
            <>
              <ProductImageThumbnail src={product.image} alt="" />
              <ProductImageOverlay htmlFor={`product-image-${idx}`}>
                <UploadOverlayLabel>Change Image</UploadOverlayLabel>
              </ProductImageOverlay>
            </>
          ) : (
            <ProductImageUploadPlaceholder htmlFor={`product-image-${idx}`}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>{uploading ? "Uploading..." : "Upload Image"}</span>
            </ProductImageUploadPlaceholder>
          )}
        </ProductImageContainer>

        <ProductDetailsSection>
          <ProductFieldsRow style={{ padding: 0 }}>
            <ProductTextField
              label="Product Name"
              variant="outlined"
              size="small"
              disabled={!ecommerceEnabled}
              value={product.name}
              error={nameError}
              helperText={nameError ? "Product name is required" : ""}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              onChange={(e) =>
                onUpdateProduct({ ...product, name: e.target.value })
              }
              placeholder="e.g. Bewakoof Graphic T-Shirt"
            />
            <ProductTextField
              label="Price"
              variant="outlined"
              size="small"
              disabled={!ecommerceEnabled}
              value={product.price}
              error={priceError}
              helperText={priceError ? "Price is required" : ""}
              onBlur={() => setTouched((prev) => ({ ...prev, price: true }))}
              onChange={(e) =>
                onUpdateProduct({ ...product, price: e.target.value })
              }
              placeholder="e.g. ₹599 or $24.99"
            />
            <ProductTextField
              label="Product Link"
              variant="outlined"
              size="small"
              disabled={!ecommerceEnabled}
              value={product.url}
              error={urlError}
              helperText={urlHelperText}
              onBlur={() => setTouched((prev) => ({ ...prev, url: true }))}
              onChange={(e) =>
                onUpdateProduct({ ...product, url: e.target.value })
              }
              placeholder="https://example.com/product"
            />

            <div>
              <MetadataSectionToggle
                type="button"
                onClick={() => setShowMetadata((prev) => !prev)}
              >
                {showMetadata ? "▲ Hide Product Attributes" : "▼ Add / Edit Attributes (Color, Size, Brand, Style...)"}
              </MetadataSectionToggle>

              {showMetadata && (
                <MetadataFieldsGrid>
                  <ProductTextField
                    label="Brand"
                    variant="outlined"
                    size="small"
                    value={metaBrand || ""}
                    onChange={(e) => updateMetaField("brand", e.target.value)}
                    placeholder="e.g. Nike, Bewakoof"
                  />
                  <ProductTextField
                    label="Category / Type"
                    variant="outlined"
                    size="small"
                    value={metaCategory || ""}
                    onChange={(e) => updateMetaField("category", e.target.value)}
                    placeholder="e.g. T-Shirt, Hoodie"
                  />
                  <ProductTextField
                    label="Color"
                    variant="outlined"
                    size="small"
                    value={metaColor || ""}
                    onChange={(e) => updateMetaField("color", e.target.value)}
                    placeholder="e.g. Red, Black"
                  />
                  <ProductTextField
                    label="Size"
                    variant="outlined"
                    size="small"
                    value={metaSize || ""}
                    onChange={(e) => updateMetaField("size", e.target.value)}
                    placeholder="e.g. L, XL, UK 9"
                  />
                  <ProductTextField
                    label="Style / Fit"
                    variant="outlined"
                    size="small"
                    value={metaStyle || ""}
                    onChange={(e) => updateMetaField("style", e.target.value)}
                    placeholder="e.g. Oversized, Slim Fit"
                  />
                  <ProductTextField
                    label="Material"
                    variant="outlined"
                    size="small"
                    value={metaMaterial || ""}
                    onChange={(e) => updateMetaField("material", e.target.value)}
                    placeholder="e.g. 100% Cotton"
                  />
                </MetadataFieldsGrid>
              )}
            </div>
          </ProductFieldsRow>
          <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "8px" }}>
            <SaveProductButton
              type="button"
              onClick={onSave}
              disabled={isSaveDisabled}
              style={{ flex: 1 }}
            >
              Save Details
            </SaveProductButton>
            <SaveProductButton
              type="button"
              onClick={onDelete}
              style={{
                flex: 1,
                background: "#fee2e2",
                color: "#ef4444",
                border: "1px solid #fca5a5",
              }}
            >
              Delete Product
            </SaveProductButton>
          </div>
        </ProductDetailsSection>
      </CatalogProductCard>
    );
  }

  return (
    <CatalogProductCard>
      <ProductImageContainer style={{ borderBottom: "none" }}>
        {product.image ? (
          <ProductImageThumbnail src={product.image} alt={product.name} />
        ) : (
          <div
            style={{
              color: "#aaa",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            No Image
          </div>
        )}
      </ProductImageContainer>

      <ProductDetailsSection>
        <div>
          <ProductDetailsHeader>
            <ProductCardTitle>
              {product.name || "Unnamed Product"}
            </ProductCardTitle>
          </ProductDetailsHeader>

          <PriceRow>
            <PriceLabel>Price</PriceLabel>
            <PriceValue>{product.price || "—"}</PriceValue>
          </PriceRow>

          <LinkRow style={{ marginTop: "10px" }}>
            <LinkLabel>Product Link</LinkLabel>
            <LinkContent>
              <LinkUrl>{product.url || "—"}</LinkUrl>
              {product.url && (
                <LinkIconWrapper>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </LinkIconWrapper>
              )}
            </LinkContent>
          </LinkRow>

          {(metaBrand || metaColor || metaSize || metaStyle || metaCategory || metaMaterial) && (
            <MetadataBadgesWrapper>
              {metaBrand && <MetadataBadge>{metaBrand}</MetadataBadge>}
              {metaCategory && <MetadataBadge>{metaCategory}</MetadataBadge>}
              {metaColor && <MetadataBadge>{metaColor}</MetadataBadge>}
              {metaSize && <MetadataBadge>Size: {metaSize}</MetadataBadge>}
              {metaStyle && <MetadataBadge>{metaStyle}</MetadataBadge>}
              {metaMaterial && <MetadataBadge>{metaMaterial}</MetadataBadge>}
            </MetadataBadgesWrapper>
          )}
        </div>
        <CardActionButtons>
          <SaveProductButton type="button" onClick={onEdit} title="Edit Product">
            Edit
          </SaveProductButton>
          <SaveProductButton
            type="button"
            onClick={onDelete}
            title="Delete Product"
          >
            Delete
          </SaveProductButton>
        </CardActionButtons>
      </ProductDetailsSection>
    </CatalogProductCard>
  );
};
