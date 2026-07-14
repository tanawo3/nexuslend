# NexusLend — AI-Driven DeFi Lending Protocol

A GenLayer DeFi Lending Protocol that implements the **full lending lifecycle**: collateral-backed loan applications, AI-driven underwriting via Subjective Consensus, value disbursement, and on-chain repayment with collateral release.

## Core Lending Lifecycle

### 1. Create Lending Pool (Investor)
An investor deploys a capital pool with a specified amount and **semantic lending conditions** written in plain English (e.g., "Only lend to renewable energy projects with a clear business plan").

### 2. Apply for a Loan (Borrower — Collateral-backed)
A borrower submits a loan application by:
- Writing a **pitch** in any language explaining why they qualify.
- Sending **collateral** (native GEN tokens) with the transaction. The collateral is locked in the contract.
- The `apply_for_loan` method is `@gl.public.payable` — the borrower must send value.

### 3. AI Evaluation (Subjective Consensus)
GenLayer's **Leader-Validator multi-agent protocol** evaluates the application:
- The **Leader** translates the pitch to English, fetches external risk data via `gl.nondet.web.get`, scores the application (0–10000 basis points), and renders a verdict.
- The **Validators** independently critique the translation and reasoning.
- Consensus is reached via `gl.vm.run_nondet_unsafe`.

### 4. Disbursement (On Approval)
If the AI approves:
- The borrower receives **50% of their collateral** as the loan amount, disbursed via `gl.transfer`.
- A **5% interest rate** is applied to calculate the outstanding `debt`.
- The remaining collateral stays locked as security.

### 5. Repayment (Borrower)
The borrower repays by calling `repay_loan` with value equal to their `debt`:
- The contract verifies **authorization** (`gl.message.sender_address == app.applicant`).
- The contract verifies the **payment covers the debt**.
- On success, the **collateral is returned** to the borrower via `gl.transfer`.
- The loan status transitions to `REPAID`.

### 6. Revocation (Borrower)
A borrower can revoke a `PENDING_EVALUATION` application to reclaim collateral.

## Authorization Model
- `apply_for_loan`: Records `gl.message.sender_address` as the applicant.
- `repay_loan`: Only the original applicant can repay.
- `revoke_application`: Only the original applicant can revoke.

## Verifiable Evidence
The AI evaluation is grounded in **external verifiable data** fetched via `gl.nondet.web.get`. The leader fetches real-world data from URLs embedded in the pitch (or a default source) to inform its underwriting decision. This ensures the AI's judgment is not based purely on unverifiable text claims.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + GSAP
- **Blockchain SDK**: `genlayer-js`
- **Smart Contract**: GenLayer Python GenVM (`DeFiLendingProtocol.py`)

## How to Run
1. **Connect Wallet**: Configure your Web3 wallet to the GenLayer Network.
2. **Deploy Contract**: Click "Deploy Contract" to deploy `DeFiLendingProtocol.py`.
3. **Interact**:
   - Create lending pools with semantic conditions.
   - Apply for loans with collateral (GEN tokens sent with the transaction).
   - Run AI Consensus to evaluate applications.
   - Repay loans to release collateral.
