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
  // LegalLinks,
  FooterLogo,
} from "./styled";
import BotLogo from "@/assets/images/Agentify logo white.png";
import {
  GithubLogoIcon,
  TwitterLogoIcon,
  LinkedinLogoIcon,
  FacebookLogoIcon,
} from "@phosphor-icons/react";

export const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterBrand>
            <FooterLogo src={BotLogo} alt="Footer Logo" width={140} />
            <BrandDescription>
              Build and manage intelligent AI agents with ease. Automate your
              workflow and enhance user engagement.
            </BrandDescription>
            <SocialLinks>
              <SocialIcon href="#" target="_blank">
                <GithubLogoIcon size={24} />
              </SocialIcon>
              <SocialIcon href="#" target="_blank">
                <TwitterLogoIcon size={24} />
              </SocialIcon>
              <SocialIcon href="#" target="_blank">
                <LinkedinLogoIcon size={24} />
              </SocialIcon>
              <SocialIcon href="#" target="_blank">
                <FacebookLogoIcon size={24} />
              </SocialIcon>
            </SocialLinks>
          </FooterBrand>

          <FooterBrand>
            <FooterTitle>Product</FooterTitle>
            <FooterColumn>
            <FooterLink href="/admin">Dashboard</FooterLink>
            <FooterLink href="/admin/bots">My Bots</FooterLink>
            <FooterLink href="/pricing">Pricing</FooterLink>
            <FooterLink href="/documentation">Documentation</FooterLink>
            </FooterColumn>
          </FooterBrand>

          <FooterBrand>
            <FooterTitle>Company</FooterTitle>
            <FooterColumn>
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/careers">Careers</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            </FooterColumn>
          </FooterBrand>

          <FooterBrand>
            <FooterTitle>Legal</FooterTitle>
            <FooterColumn>
            <FooterLink href="/privacy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms of Service</FooterLink>
            <FooterLink href="/security">Security</FooterLink>
            </FooterColumn>
          </FooterBrand>
        </FooterGrid>

        <CopyrightSection>
          <CopyrightText>
            © {new Date().getFullYear()} Agentigy. All rights reserved.
          </CopyrightText>
        </CopyrightSection>
      </FooterContent>
    </FooterContainer>
  );
};
