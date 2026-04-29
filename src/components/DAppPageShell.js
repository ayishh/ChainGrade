"use client";

/**
 * Wraps each page with header, centered main column, and footer.
 */
import styled from "styled-components";
import { DAppFooter, DAppHeader } from "@/components/DAppChrome";

export function DAppPageShell({ activeTab, children }) {
  return (
    <Shell>
      <DAppHeader activeTab={activeTab} />
      <Main>{children}</Main>
      <DAppFooter />
    </Shell>
  );
}

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  padding: 2rem 1.25rem 1rem;
`;
