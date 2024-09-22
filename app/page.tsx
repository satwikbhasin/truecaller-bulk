"use client";

import { useState } from "react";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Eye, EyeOff } from "lucide-react";

export default function Home() {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-10 bg-red-500">
      <div className="mt-8 flex flex-col gap-4 bg-red-500">
        <Input type="file" label="Upload CSV" style={{ fontWeight: 200 }} />
        <Input
          type={showApiKey ? "text" : "password"}
          label="Enter API Key"
          style={{
            display: "flex",
            alignItems: "center",
          }}
          endContent={
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              style={{
                padding: "0.5rem",
              }}
            >
              {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
        />
        <Button style={{
          padding: "0.75rem 1.5rem",
          marginTop: 30,
          fontWeight: 600,
        }}>Submit</Button>
      </div>
    </div>
  );
}