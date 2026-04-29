"use client";

/**
 * Shared chrome: header (brand, Student/Sponsor tabs, wallet connect/disconnect) and footer.
 */
import Link from "next/link";
import styled from "styled-components";
import { useWallet } from "@/lib/WalletContext";

export function DAppFooter() {
  return <Footer>GPA Recorder DApp</Footer>;
}

export function DAppHeader({ activeTab }) {
  const { account, loading, connect, disconnect } = useWallet();

  return (
    <Header>
      <Brand href="/">GPARecorder</Brand>
      <HeaderRight>
        <TabGroup>
          <TabLink href="/" $active={activeTab === "student"}>
            Student
          </TabLink>
          <TabLink href="/sponsor" $active={activeTab === "sponsor"}>
            Sponsor
          </TabLink>
        </TabGroup>
        {account ? (
          <>
            <AddressPill title={account}>
              {account.slice(0, 6)}...{account.slice(-4)}
            </AddressPill>
            <DisconnectBtn type="button" onClick={disconnect}>
              Disconnect
            </DisconnectBtn>
          </>
        ) : (
          <ConnectBtn
            type="button"
            onClick={async () => {
              try {
                await connect();
              } catch (e) {
                window.alert(e?.message || "Could not connect wallet.");
              }
            }}
            disabled={loading}
          >
            Connect Wallet
          </ConnectBtn>
        )}
      </HeaderRight>
    </Header>
  );
}

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
`;

const Brand = styled(Link)`
  font-weight: 700;
  font-size: 1.05rem;
  color: #111827;
  text-decoration: none;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const TabGroup = styled.div`
  display: inline-flex;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
`;

const TabLink = styled(Link)`
  padding: 0.45rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  color: ${(p) => (p.$active ? "#ffffff" : "#374151")};
  background: ${(p) => (p.$active ? "#2563eb" : "transparent")};
  transition: background 0.15s, color 0.15s;
`;

const ConnectBtn = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AddressPill = styled.span`
  font-size: 0.8rem;
  padding: 0.35rem 0.75rem;
  background: #f3f4f6;
  border-radius: 999px;
  color: #374151;
  font-family: var(--font-geist-mono), ui-monospace, monospace;
`;

const DisconnectBtn = styled.button`
  padding: 0.45rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #b91c1c;
  background: #fee2e2;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const Footer = styled.footer`
  text-align: center;
  font-size: 0.75rem;
  color: #9ca3af;
  padding: 1.5rem 1rem 2rem;
  margin-top: auto;
`;
