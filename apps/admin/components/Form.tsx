"use client";

import styled from "styled-components";

export const Form = styled.form`
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 520px;
`;

export const Field = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  margin-bottom: 6px;
`;

export const Input = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
`;

export const Button = styled.button`
  background: #4f46e5;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
`;
