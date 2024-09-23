"use client";

import Main from "./main/page";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-10 h-full" style={{
      paddingBottom: 300,
    }}>
      <Main />
    </div>
  );
}