"use client";

/**
 * Sponsor route: fetch any student by address via JSON-RPC (no wallet needed to read).
 */
import { useState } from "react";
import { ethers } from "ethers";
import styled from "styled-components";
import { DAppPageShell } from "@/components/DAppPageShell";
import {
  BSC_TESTNET_RPC,
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
} from "@/lib/contract";

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

export default function SponsorPage() {
  const [studentAddress, setStudentAddress] = useState("");
  const [record, setRecord] = useState(null);
  const [status, setStatus] = useState("");

  const fetchRecords = async () => {
    if (!ethers.isAddress(studentAddress)) {
      setStatus("Please enter a valid student address.");
      return;
    }
    try {
      setStatus("Loading…");
      const provider = new ethers.JsonRpcProvider(BSC_TESTNET_RPC);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );
      const [name, nameLocked, rawRecords] = await contract.getStudent(
        studentAddress
      );
      setRecord({
        name,
        nameLocked,
        records: mapRecords(rawRecords),
      });
      setStatus("");
    } catch (error) {
      setRecord(null);
      setStatus(
        error?.reason || error?.message || "Failed to load student records."
      );
    }
  };

  return (
    <DAppPageShell activeTab="sponsor">
      <Hero>
        <HeroTitle>Sponsor Portal</HeroTitle>
        <HeroSub>Check GPA records of any student by address</HeroSub>
        <HeroHint>Using read-only mode — no wallet required.</HeroHint>
      </Hero>

      <Card>
        <CardTitle>Fetch Student Records</CardTitle>
        <SmallLabel>Student Address</SmallLabel>
        <FieldInput
          value={studentAddress}
          onChange={(e) => setStudentAddress(e.target.value.trim())}
          placeholder="0x..."
        />
        <FetchBtn type="button" onClick={fetchRecords}>
          Fetch Records
        </FetchBtn>
        {status ? <StatusLine>{status}</StatusLine> : null}
      </Card>

      {record ? (
        <Card style={{ marginTop: "1.25rem" }}>
          <CardTitle>Student Records</CardTitle>
          <MutedBox>
            <SmallLabel>Name</SmallLabel>
            <NameValue>{record.name || "—"}</NameValue>
            <LockNote>
              {record.nameLocked ? "Name is locked." : "Name not set."}
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
                      No semester records.
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
      ) : null}
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

const HeroHint = styled.p`
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 0.35rem;
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

const SmallLabel = styled.div`
  font-size: 0.8rem;
  color: #111827;
  margin-bottom: 0.35rem;
`;

const FieldInput = styled.input`
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  font-size: 0.9rem;
  margin-bottom: 1rem;
`;

const FetchBtn = styled.button`
  padding: 0.55rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  background: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const StatusLine = styled.p`
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #6b7280;
`;

const MutedBox = styled.div`
  background: #f3f4f6;
  border-radius: 10px;
  padding: 1rem;
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
