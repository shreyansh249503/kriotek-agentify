"use client";

import React, { useState } from "react";
import {
  Envelope,
  MapPin,
  Clock,
  GithubLogo,
  TwitterLogo,
  LinkedinLogo,
  PaperPlaneRight,
  CheckCircle,
} from "@phosphor-icons/react";
import {
  ContactSection,
  ContactContainer,
  HeaderArea,
  Badge,
  PageTitle,
  PageSubtitle,
  ContactGrid,
  InfoColumn,
  InfoHeader,
  InfoText,
  InfoCardsList,
  InfoCard,
  IconWrapper,
  InfoContent,
  InfoTitle,
  InfoDetail,
  SocialWrapper,
  SocialTitle,
  SocialLinksList,
  SocialLinkItem,
  FormColumn,
  FormCard,
  ContactFormElement,
  FormRow,
  FormGroup,
  Label,
  Input,
  Select,
  TextArea,
  SubmitButton,
  Spinner,
  SuccessContainer,
  SuccessIconWrapper,
  SuccessTitle,
  SuccessMessage,
  ResetButton,
} from "./styled";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "general",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setStatus("submitting");

    setTimeout(() => {
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "general",
        message: "",
      });
    }, 1500);
  };

  const handleReset = () => {
    setStatus("idle");
  };

  return (
    <ContactSection>
      <ContactContainer>
        <HeaderArea>
          <Badge>Contact Us</Badge>
          <PageTitle>
            Get in <span>touch with us</span>
          </PageTitle>
          <PageSubtitle>
            Have questions about integrating AI agents, plan custom pricing, or need technical help? Send us a message and our team will get back to you shortly.
          </PageSubtitle>
        </HeaderArea>

        <ContactGrid>
          <InfoColumn>
            <InfoHeader>
              Let&apos;s talk about <span>your project</span>
            </InfoHeader>
            <InfoText>
              Whether you are looking to deploy your first chatbot, scale to millions of conversations, or explore bespoke enterprise solutions, we are here to support your growth.
            </InfoText>

            <InfoCardsList>
              <InfoCard>
                <IconWrapper>
                  <Envelope size={24} weight="bold" />
                </IconWrapper>
                <InfoContent>
                  <InfoTitle>Email Us</InfoTitle>
                  <InfoDetail>
                    <a href="mailto:support@agentify.ai">support@agentify.ai</a>
                  </InfoDetail>
                </InfoContent>
              </InfoCard>

              <InfoCard>
                <IconWrapper>
                  <MapPin size={24} weight="bold" />
                </IconWrapper>
                <InfoContent>
                  <InfoTitle>Our HQ</InfoTitle>
                  <InfoDetail>100 Pine Street, San Francisco, CA</InfoDetail>
                </InfoContent>
              </InfoCard>

              <InfoCard>
                <IconWrapper>
                  <Clock size={24} weight="bold" />
                </IconWrapper>
                <InfoContent>
                  <InfoTitle>Working Hours</InfoTitle>
                  <InfoDetail>Mon – Fri: 9:00 AM – 6:00 PM EST</InfoDetail>
                </InfoContent>
              </InfoCard>
            </InfoCardsList>

            <SocialWrapper>
              <SocialTitle>Follow Us</SocialTitle>
              <SocialLinksList>
                <SocialLinkItem href="#" target="_blank">
                  <GithubLogo size={22} weight="bold" />
                </SocialLinkItem>
                <SocialLinkItem href="#" target="_blank">
                  <TwitterLogo size={22} weight="bold" />
                </SocialLinkItem>
                <SocialLinkItem href="#" target="_blank">
                  <LinkedinLogo size={22} weight="bold" />
                </SocialLinkItem>
              </SocialLinksList>
            </SocialWrapper>
          </InfoColumn>

          <FormColumn>
            <FormCard>
              {status === "success" ? (
                <SuccessContainer>
                  <SuccessIconWrapper>
                    <CheckCircle size={48} weight="fill" />
                  </SuccessIconWrapper>
                  <SuccessTitle>Message Sent!</SuccessTitle>
                  <SuccessMessage>
                    Thank you for reaching out. A representative from Agentify will review your request and contact you within 12 hours.
                  </SuccessMessage>
                  <ResetButton onClick={handleReset}>Send Another Message</ResetButton>
                </SuccessContainer>
              ) : (
                <>
                  <ContactFormElement onSubmit={handleSubmit}>
                    <FormRow>
                      <FormGroup>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          required
                          disabled={status === "submitting"}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          required
                          disabled={status === "submitting"}
                        />
                      </FormGroup>
                    </FormRow>

                    <FormGroup>
                      <Label htmlFor="subject">Subject / Inquiry Type</Label>
                      <Select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={status === "submitting"}
                      >
                        <option value="general">General Support</option>
                        <option value="sales">Sales & Custom Plans</option>
                        <option value="partnership">Business Partnerships</option>
                        <option value="press">Media & Press</option>
                      </Select>
                    </FormGroup>

                    <FormGroup>
                      <Label htmlFor="message">Your Message</Label>
                      <TextArea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help you..."
                        required
                        disabled={status === "submitting"}
                      />
                    </FormGroup>

                    {error && (
                      <span style={{ color: "red", fontSize: "14px", fontWeight: 600 }}>
                        {error}
                      </span>
                    )}

                    <SubmitButton type="submit" disabled={status === "submitting"}>
                      {status === "submitting" ? (
                        <>
                          <Spinner />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <PaperPlaneRight size={18} weight="bold" />
                        </>
                      )}
                    </SubmitButton>
                  </ContactFormElement>
                </>
              )}
            </FormCard>
          </FormColumn>
        </ContactGrid>
      </ContactContainer>
    </ContactSection>
  );
}
