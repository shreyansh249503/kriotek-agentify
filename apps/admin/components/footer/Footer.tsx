"use client";

import {
  FooterContainer,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTitle,
  BrandDescription,
  FooterColumn,
  FooterLink,
  SocialLinks,
  SocialIcon,
  CopyrightSection,
  CopyrightText,
  LegalLinks,
} from "./styled";
import {
  FacebookLogo,
  TwitterLogo,
  LinkedinLogo,
  GithubLogo,
} from "@phosphor-icons/react";

export const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterBrand>
            <FooterTitle>Agentigy</FooterTitle>
            <BrandDescription>
              Build and manage intelligent AI agents with ease. Automate your
              workflow and enhance user engagement.
            </BrandDescription>
            <SocialLinks>
              <SocialIcon href="#" target="_blank">
                <GithubLogo size={24} />
              </SocialIcon>
              <SocialIcon href="#" target="_blank">
                <TwitterLogo size={24} />
              </SocialIcon>
              <SocialIcon href="#" target="_blank">
                <LinkedinLogo size={24} />
              </SocialIcon>
              <SocialIcon href="#" target="_blank">
                <FacebookLogo size={24} />
              </SocialIcon>
            </SocialLinks>
          </FooterBrand>

          <FooterColumn>
            <FooterTitle>Product</FooterTitle>
            <FooterLink href="/admin">Dashboard</FooterLink>
            <FooterLink href="/admin/bots">My Bots</FooterLink>
            <FooterLink href="/pricing">Pricing</FooterLink>
            <FooterLink href="/documentation">Documentation</FooterLink>
          </FooterColumn>

          <FooterColumn>
            <FooterTitle>Company</FooterTitle>
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/careers">Careers</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </FooterColumn>

          <FooterColumn>
            <FooterTitle>Legal</FooterTitle>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms of Service</FooterLink>
            <FooterLink href="/security">Security</FooterLink>
          </FooterColumn>
        </FooterGrid>

        <CopyrightSection>
          <CopyrightText>
            © {new Date().getFullYear()} Agentigy. All rights reserved.
          </CopyrightText>
          <LegalLinks>
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/terms">Terms</FooterLink>
            <FooterLink href="/cookies">Cookies</FooterLink>
          </LegalLinks>
        </CopyrightSection>
      </FooterContent>
    </FooterContainer>
  );
};
