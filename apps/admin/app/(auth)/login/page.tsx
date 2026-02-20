"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  CircleNotchIcon,
  EyeSlashIcon,
  EyeIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react";
import {
  AuthContainer,
  BannerSection,
  BannerContent,
  Logo,
  Quote,
  Author,
  FormSection,
  FormContainer,
  Header,
  Title,
  Subtitle,
  Form,
  FormGroup,
  Label,
  Input,
  PasswordInputWrapper,
  PasswordToggle,
  SubmitButton,
  ErrorMessage,
  Footer,
  LinkText,
  BackHomeLink,
} from "./styled";
import { RefreshAuthGuard } from "@/components/AuthGuard";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    router.replace("/admin");
  }

  return (
    <RefreshAuthGuard>
      <AuthContainer>
        <BannerSection>
          <BackHomeLink href="/">
            <ArrowLeftIcon size={16} />
            Back to Home
          </BackHomeLink>
          <BannerContent>
            <Logo>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Agentify
            </Logo>

            <Quote>
              &ldquo;The future of customer engagement is here. Build simpler,
              smarter, and faster with AI agents.&rdquo;
            </Quote>
            <Author>Platform Vision</Author>
          </BannerContent>
          <div /> {/* Spacer */}
        </BannerSection>

        <FormSection>
          <FormContainer>
            <Header>
              <Title>Welcome Back</Title>
              <Subtitle>Please enter your details to sign in.</Subtitle>
            </Header>

            {error && (
              <ErrorMessage>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 8V12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="16" r="1" fill="currentColor" />
                </svg>
                {error}
              </ErrorMessage>
            )}

            <Form onSubmit={handleLogin}>
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="password">Password</Label>
                <PasswordInputWrapper>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon size={20} />
                    ) : (
                      <EyeIcon size={20} />
                    )}
                  </PasswordToggle>
                </PasswordInputWrapper>
              </FormGroup>

              <SubmitButton type="submit" disabled={loading}>
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <CircleNotchIcon size={20} className="animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </SubmitButton>
            </Form>

            <Footer>
              Don&apos;t have an account?
              <LinkText href="/signup">Sign up for free</LinkText>
            </Footer>
          </FormContainer>
        </FormSection>
      </AuthContainer>
    </RefreshAuthGuard>
  );
}
