"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function signup() {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            alert(error.message);
            return;
        }

        window.location.href = "/login";
    }

    return (
        <div style={{ maxWidth: 400, margin: "80px auto" }}>
            <h2>Create Account</h2>

            <input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", marginBottom: 12 }}
            />

            <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", marginBottom: 12 }}
            />

            <button onClick={signup} style={{ width: "100%" }}>
                Sign up
            </button>
        </div>
    );
}
