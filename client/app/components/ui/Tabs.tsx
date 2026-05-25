"use client";

import React from "react";

type TabsContextType = {
  value: string;
  setValue: (v: string) => void;
};

const TabsContext = React.createContext<TabsContextType | null>(null);

export function Tabs({
  defaultValue,
  children,
}: {
  defaultValue: string;
  children: React.ReactNode;
}) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

export function useTabs() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs must be used inside Tabs");
  return ctx;
}



{/*
  How to use:
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/Tabs";

export default function Page() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">
          Overview
        </TabsTrigger>

        <TabsTrigger value="details">
          Details
        </TabsTrigger>

        <TabsTrigger value="reviews">
          Reviews
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        Overview content here
      </TabsContent>

      <TabsContent value="details">
        Product details here
      </TabsContent>

      <TabsContent value="reviews">
        Reviews here
      </TabsContent>
    </Tabs>
  );
}

  */}