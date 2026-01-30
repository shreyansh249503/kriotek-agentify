"use client";
import { createGlobalStyle } from "styled-components";
import { Roboto, Josefin_Sans } from "next/font/google";
import { Open_Sans } from "next/font/google";
import { Poppins } from "next/font/google";

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "700", "800"],
  variable: "--font-roboto",
});

export const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-josefin",
});

export const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-Open_Sans",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-Poppins",
});

export const GlobalStyle = createGlobalStyle`
html {
  scroll-behavior: smooth;
}

  body, #__next  {
    margin: 0;
    padding: 0;
    width: 100% ;
    height: 100%;
    font-family: poppins, sans-serif;
    overflow-x: hidden;
  }

    * {
    box-sizing: border-box;
  }

  h1, h2, h3, h4, h5, h6, p {
    margin: 0;
    padding: 0;
    font-family: poppins, sans-serif;  }

  input, button, textarea {
   font-family: poppins, sans-serif;  }

  ::placeholder {
   font-family: poppins, sans-serif;  }

input:-webkit-autofill,
textarea:-webkit-autofill {
  background-color: transparent ;
  -webkit-box-shadow: 0 0 0 1000px white inset ;
  -webkit-text-fill-color: #333 ;
}


  /* SCROLLBAR */
 ::-webkit-scrollbar {
    width: 10px; 
  }

  ::-webkit-scrollbar-track {
    background: transparent;
   
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3); 
    border: 2px solid white; 
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.5); 
  }
`;
