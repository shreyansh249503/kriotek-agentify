"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {  CircleNotchIcon, EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
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
  SuccessMessage,
  Footer,
  LinkText,
} from "./styled";
import { RefreshAuthGuard } from "@/components/AuthGuard";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  }

  return (
    <RefreshAuthGuard>
      <AuthContainer>
        <BannerSection>
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
          <BannerContent>
            <Quote>
              &ldquo;Join the revolution of automated customer support. Create
              intelligent agents in minutes.&rdquo;
            </Quote>
            <Author>Start Your Journey</Author>
          </BannerContent>
          <div />
        </BannerSection>

        <FormSection>
          <FormContainer>
            <Header>
              <Title>Create Account</Title>
              <Subtitle>Get started with your free account today.</Subtitle>
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

            {success && (
              <SuccessMessage>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Account created! Redirecting to login...
              </SuccessMessage>
            )}

            <Form onSubmit={handleSignup}>
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={success}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="password">Password</Label>
                <PasswordInputWrapper>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={success}
                    minLength={6}
                  />
                  <PasswordToggle
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeSlashIcon size={20} /> : <EyeIcon size={20} />}
                  </PasswordToggle>
                </PasswordInputWrapper>
              </FormGroup>

              <SubmitButton type="submit" disabled={loading || success}>
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
                    Creating account...
                  </div>
                ) : (
                  "Sign Up"
                )}
              </SubmitButton>
            </Form>

            <Footer>
              Already have an account?
              <LinkText href="/login">Sign in</LinkText>
            </Footer>
          </FormContainer>
        </FormSection>
      </AuthContainer>
    </RefreshAuthGuard>
  );
}
