"use client";

/**
 * Student route: connect wallet, set name once, add semester rows, list on-chain records.
 */
import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import styled from "styled-components";
import { DAppPageShell } from "@/components/DAppPageShell";
import {
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
} from "@/lib/contract";
import { getInjectedProvider } from "@/lib/getInjectedEthereum";
import { useWallet } from "@/lib/WalletContext";

const gpaFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function mapRecords(raw) {
  if (!raw?.length) return [];
  return raw.map((row) => {
    const year = Number(row.year ?? row[0]);
    const semesterNumber = Number(row.semesterNumber ?? row[1]);
    const gpaTimes100 = Number(row.gpaTimes100 ?? row[2]);
    return { year, semesterNumber, gpa: gpaTimes100 / 100 };
  });
}

export default function Home() {
  const { account, loading: walletLoading } = useWallet();
  const [nameInput, setNameInput] = useState("");
  const [yearInput, setYearInput] = useState("");
  const [semesterNumInput, setSemesterNumInput] = useState("");
  const [gpaInput, setGpaInput] = useState("");
  const [record, setRecord] = useState({
    name: "",
    nameLocked: false,
    records: [],
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const getContract = useCallback(async (withSigner) => {
    const eth = getInjectedProvider();
    if (!eth) {
      throw new Error("Connect a wallet first.");
    }
    const provider = new ethers.BrowserProvider(eth);
    const runner = withSigner ? await provider.getSigner() : provider;
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, runner);
  }, []);

  const refreshRecord = useCallback(async () => {
    if (!account || !getInjectedProvider()) return;
    try {
      const contract = await getContract(false);
      const [studentName, nameLocked, rawRecords] = await contract.getStudent(
        account
      );
      setRecord({
        name: studentName,
        nameLocked,
        records: mapRecords(rawRecords),
      });
    } catch (error) {
      setStatus(
        error?.reason || error?.message || "Unable to fetch your records."
      );
    }
  }, [account, getContract]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (account) {
        void refreshRecord();
      } else {
        setRecord({ name: "", nameLocked: false, records: [] });
      }
    }, 0);
    return () => clearTimeout(t);
  }, [account, refreshRecord]);

  const saveName = async () => {
    if (!nameInput.trim()) {
      setStatus("Enter your name first.");
      return;
    }
    try {
      setLoading(true);
      const contract = await getContract(true);
      const tx = await contract.setName(nameInput.trim());
      setStatus("Confirming name on chain…");
      await tx.wait();
      setNameInput("");
      setStatus("Name saved and locked.");
      await refreshRecord();
    } catch (error) {
      setStatus(error?.reason || error?.message || "Failed to set name.");
    } finally {
      setLoading(false);
    }
  };

  const addSemester = async () => {
    const year = Number(yearInput);
    const semesterNumber = Number(semesterNumInput);
    const gpaDecimal = Number.parseFloat(gpaInput);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      setStatus("Enter a valid year (e.g. 2024).");
      return;
    }
    if (!Number.isInteger(semesterNumber) || semesterNumber <= 0) {
      setStatus("Semester number must be a positive integer.");
      return;
    }
    if (
      Number.isNaN(gpaDecimal) ||
      gpaDecimal < 0 ||
      gpaDecimal > 4
    ) {
      setStatus("GPA must be a number from 0.00 to 4.00 (e.g. 3.85).");
      return;
    }
    const gpaTimes100 = Math.round(gpaDecimal * 100);
    if (gpaTimes100 > 400) {
      setStatus("GPA must be at most 4.00.");
      return;
    }
    try {
      setLoading(true);
      const contract = await getContract(true);
      const tx = await contract.addSemester(year, semesterNumber, gpaTimes100);
      setStatus("Confirming semester record…");
      await tx.wait();
      setYearInput("");
      setSemesterNumInput("");
      setGpaInput("");
      setStatus("Semester record added.");
      await refreshRecord();
    } catch (error) {
      setStatus(error?.reason || error?.message || "Failed to add semester.");
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || walletLoading;

  return (
    <DAppPageShell activeTab="student">
      <Hero>
        <HeroTitle>Student Portal</HeroTitle>
        <HeroSub>
          Enter and track your GPA records.
        </HeroSub>
      </Hero>

      {!account ? (
        <Placeholder>
          Please connect your wallet to access student features or enter a student address to view records.
        </Placeholder>
      ) : (
        <Stack>
          <Card>
            <CardTitle>Your Wallet Address</CardTitle>
            <MutedBox>
              <SmallLabel>Connected Address</SmallLabel>
              <MonoAddr>{account}</MonoAddr>
              <HelpText>
                This is your student wallet address. All your records are linked
                to this address.
              </HelpText>
            </MutedBox>
          </Card>

          <Card>
            <CardTitle>Set Your Display Name</CardTitle>
            <FieldInput
              placeholder="Enter your name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              disabled={record.nameLocked || busy}
            />
            <HelpText>Name is locked and cannot be changed.</HelpText>
            <SetNameBtn
              type="button"
              onClick={saveName}
              disabled={record.nameLocked || busy || !nameInput.trim()}
            >
              Set Name
            </SetNameBtn>
          </Card>

          <Card>
            <CardTitle>Add Semester GPA Record</CardTitle>
            <ThreeCol>
              <Field>
                <SmallLabel>Year</SmallLabel>
                <FieldInput
                  placeholder="e.g., 2024"
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                  disabled={busy}
                />
              </Field>
              <Field>
                <SmallLabel>Semester Number</SmallLabel>
                <FieldInput
                  placeholder="e.g., 1"
                  value={semesterNumInput}
                  onChange={(e) => setSemesterNumInput(e.target.value)}
                  disabled={busy}
                />
              </Field>
              <Field>
                <SmallLabel>GPA</SmallLabel>
                <FieldInput
                  placeholder="e.g., 3.85"
                  inputMode="decimal"
                  value={gpaInput}
                  onChange={(e) => setGpaInput(e.target.value)}
                  disabled={busy}
                />
              </Field>
            </ThreeCol>
            <AddSemesterBtn type="button" onClick={addSemester} disabled={busy}>
              Add Semester Record
            </AddSemesterBtn>
          </Card>

          <Card>
            <CardHeadRow>
              <CardTitle style={{ marginBottom: 0 }}>Your Records</CardTitle>
              <RefreshBtn
                type="button"
                onClick={() => refreshRecord()}
                disabled={busy}
              >
                Refresh
              </RefreshBtn>
            </CardHeadRow>

            <MutedBox>
              <SmallLabel>Name</SmallLabel>
              <NameValue>{record.name || "—"}</NameValue>
              <LockNote>
                {record.nameLocked ? "Name is locked." : "Name not set yet."}
              </LockNote>
            </MutedBox>

            <TableLabel>Semester Records</TableLabel>
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Semester</th>
                    <th>GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {record.records.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", color: "#6b7280" }}>
                        No records yet.
                      </td>
                    </tr>
                  ) : (
                    record.records.map((r, i) => (
                      <tr key={`${r.year}-${r.semesterNumber}-${i}`}>
                        <td>{r.year}</td>
                        <td>{r.semesterNumber}</td>
                        <td>{gpaFormatter.format(r.gpa)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableWrap>
          </Card>
        </Stack>
      )}

      {status ? <StatusLine>{status}</StatusLine> : null}
    </DAppPageShell>
  );
}

const Hero = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const HeroTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const HeroSub = styled.p`
  font-size: 0.95rem;
  color: #6b7280;
`;

const Placeholder = styled.p`
  text-align: center;
  color: #374151;
  font-size: 1rem;
  padding: 3rem 1rem;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const Card = styled.section`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;

const CardTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
`;

const CardHeadRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const MutedBox = styled.div`
  background: #f3f4f6;
  border-radius: 10px;
  padding: 1rem;
`;

const SmallLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.35rem;
`;

const MonoAddr = styled.div`
  font-family: var(--font-geist-mono), ui-monospace, monospace;
  font-size: 0.85rem;
  word-break: break-all;
  color: #111827;
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.75rem;
  line-height: 1.4;
`;

const FieldInput = styled.input`
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const SetNameBtn = styled.button`
  margin-top: 0.25rem;
  padding: 0.55rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e40af;
  background: #bfdbfe;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ThreeCol = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div``;

const AddSemesterBtn = styled.button`
  padding: 0.6rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  background: #16a34a;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RefreshBtn = styled.button`
  padding: 0.4rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
  background: #e5e7eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
  }
`;

const NameValue = styled.div`
  font-weight: 700;
  font-size: 1rem;
  color: #111827;
`;

const LockNote = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.35rem;
`;

const TableLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 1rem 0 0.5rem;
`;

const TableWrap = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  th {
    text-align: left;
    text-transform: uppercase;
    font-size: 0.7rem;
    font-weight: 700;
    color: #4b5563;
    background: #f9fafb;
    padding: 0.65rem 0.75rem;
    border-bottom: 1px solid #e5e7eb;
  }
  td {
    padding: 0.65rem 0.75rem;
    border-bottom: 1px solid #f3f4f6;
    color: #111827;
  }
  tr:last-child td {
    border-bottom: none;
  }
`;

const StatusLine = styled.p`
  text-align: center;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #6b7280;
`;
