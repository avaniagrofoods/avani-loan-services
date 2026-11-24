// src/calculators/pages/loan/LoanComparisonPage.jsx
// ─────────────────────────────────────────────────────────────────
// 1.7 Loan Comparison Calculator (Side-by-Side Analysis)
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateLoanComparison } from '../../utils/calculations.js';
import { formatINR } from '../../utils/formatters.js';
import { validateLoanAmount, validateInterestRate, validateTenure, validateNumber } from '../../utils/validation.js';
import { Award } from 'lucide-react';

export default function LoanComparisonPage() {
  const [loanA, setLoanA] = useState({
    amount: '1000000',
    rate: '9.5',
    tenureYears: '5',
    processingFeePercent: '1.0',
    processingFeeFlat: '0',
    otherCharges: '0',
  });

  const [loanB, setLoanB] = useState({
    amount: '1000000',
    rate: '10.25',
    tenureYears: '5',
    processingFeePercent: '0.25',
    processingFeeFlat: '0',
    otherCharges: '0',
  });

  const errors = useMemo(() => ({
    amountA: validateLoanAmount(loanA.amount, 'Loan A Amount'),
    rateA: validateInterestRate(loanA.rate, 'Loan A Interest Rate'),
    tenureA: validateTenure(loanA.tenureYears, 'years', 'Loan A Tenure'),
    feeA: validateNumber(loanA.processingFeePercent, { min: 0, max: 25, fieldName: 'Loan A Processing Fee %' }),
    amountB: validateLoanAmount(loanB.amount, 'Loan B Amount'),
    rateB: validateInterestRate(loanB.rate, 'Loan B Interest Rate'),
    tenureB: validateTenure(loanB.tenureYears, 'years', 'Loan B Tenure'),
    feeB: validateNumber(loanB.processingFeePercent, { min: 0, max: 25, fieldName: 'Loan B Processing Fee %' }),
  }), [loanA, loanB]);

  const result = useMemo(() => {
    return calculateLoanComparison({ loanA, loanB });
  }, [loanA, loanB]);

  const handleReset = () => {
    setLoanA({
      amount: '1000000',
      rate: '9.5',
      tenureYears: '5',
      processingFeePercent: '1.0',
      processingFeeFlat: '0',
      otherCharges: '0',
    });
    setLoanB({
      amount: '1000000',
      rate: '10.25',
      tenureYears: '5',
      processingFeePercent: '0.25',
      processingFeeFlat: '0',
      otherCharges: '0',
    });
  };

  const inputsComponent = (
    <div>
      <div className="calc-form-row" style={{ gap: '20px' }}>
        {/* Loan Option A */}
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontWeight: 700, color: 'var(--calc-primary)', marginBottom: '14px' }}>Loan Option A</h4>
          
          <div className="calc-field-wrap">
            <label className="calc-field-label" htmlFor="comp-loan-a-amount">Loan Amount (₹)</label>
            <input
              id="comp-loan-a-amount"
              type="number"
              value={loanA.amount}
              onChange={(e) => setLoanA({ ...loanA, amount: e.target.value })}
              className={`calc-input ${errors.amountA ? 'calc-input-error' : ''}`}
              placeholder="1000000"
              min="1000"
            />
            {errors.amountA && <span className="calc-error-text">{errors.amountA}</span>}
          </div>

          <div className="calc-field-wrap">
            <label className="calc-field-label" htmlFor="comp-loan-a-rate">Interest Rate (% p.a.)</label>
            <input
              id="comp-loan-a-rate"
              type="number"
              value={loanA.rate}
              onChange={(e) => setLoanA({ ...loanA, rate: e.target.value })}
              className={`calc-input ${errors.rateA ? 'calc-input-error' : ''}`}
              step="0.05"
              min="0"
              max="100"
            />
            {errors.rateA && <span className="calc-error-text">{errors.rateA}</span>}
          </div>

          <div className="calc-field-wrap">
            <label className="calc-field-label" htmlFor="comp-loan-a-tenure">Tenure (Years)</label>
            <input
              id="comp-loan-a-tenure"
              type="number"
              value={loanA.tenureYears}
              onChange={(e) => setLoanA({ ...loanA, tenureYears: e.target.value })}
              className={`calc-input ${errors.tenureA ? 'calc-input-error' : ''}`}
              min="1"
              max="50"
            />
            {errors.tenureA && <span className="calc-error-text">{errors.tenureA}</span>}
          </div>

          <div className="calc-field-wrap">
            <label className="calc-field-label" htmlFor="comp-loan-a-fee">Processing Fee (%)</label>
            <input
              id="comp-loan-a-fee"
              type="number"
              value={loanA.processingFeePercent}
              onChange={(e) => setLoanA({ ...loanA, processingFeePercent: e.target.value })}
              className={`calc-input ${errors.feeA ? 'calc-input-error' : ''}`}
              step="0.1"
              min="0"
              max="25"
            />
            {errors.feeA && <span className="calc-error-text">{errors.feeA}</span>}
          </div>
        </div>

        {/* Loan Option B */}
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontWeight: 700, color: 'var(--calc-accent)', marginBottom: '14px' }}>Loan Option B</h4>
          
          <div className="calc-field-wrap">
            <label className="calc-field-label" htmlFor="comp-loan-b-amount">Loan Amount (₹)</label>
            <input
              id="comp-loan-b-amount"
              type="number"
              value={loanB.amount}
              onChange={(e) => setLoanB({ ...loanB, amount: e.target.value })}
              className={`calc-input ${errors.amountB ? 'calc-input-error' : ''}`}
              placeholder="1000000"
              min="1000"
            />
            {errors.amountB && <span className="calc-error-text">{errors.amountB}</span>}
          </div>

          <div className="calc-field-wrap">
            <label className="calc-field-label" htmlFor="comp-loan-b-rate">Interest Rate (% p.a.)</label>
            <input
              id="comp-loan-b-rate"
              type="number"
              value={loanB.rate}
              onChange={(e) => setLoanB({ ...loanB, rate: e.target.value })}
              className={`calc-input ${errors.rateB ? 'calc-input-error' : ''}`}
              step="0.05"
              min="0"
              max="100"
            />
            {errors.rateB && <span className="calc-error-text">{errors.rateB}</span>}
          </div>

          <div className="calc-field-wrap">
            <label className="calc-field-label" htmlFor="comp-loan-b-tenure">Tenure (Years)</label>
            <input
              id="comp-loan-b-tenure"
              type="number"
              value={loanB.tenureYears}
              onChange={(e) => setLoanB({ ...loanB, tenureYears: e.target.value })}
              className={`calc-input ${errors.tenureB ? 'calc-input-error' : ''}`}
              min="1"
              max="50"
            />
            {errors.tenureB && <span className="calc-error-text">{errors.tenureB}</span>}
          </div>

          <div className="calc-field-wrap">
            <label className="calc-field-label" htmlFor="comp-loan-b-fee">Processing Fee (%)</label>
            <input
              id="comp-loan-b-fee"
              type="number"
              value={loanB.processingFeePercent}
              onChange={(e) => setLoanB({ ...loanB, processingFeePercent: e.target.value })}
              className={`calc-input ${errors.feeB ? 'calc-input-error' : ''}`}
              step="0.1"
              min="0"
              max="25"
            />
            {errors.feeB && <span className="calc-error-text">{errors.feeB}</span>}
          </div>
        </div>
      </div>
    </div>
  );

  const resultsComponent = (
    <div>
      {/* Winner Recommendation Banner */}
      <div style={{
        background: result.betterLoan === 'Loan A' ? '#f0f9ff' : result.betterLoan === 'Loan B' ? '#fefce8' : '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        padding: '18px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', color: '#0369a1', textTransform: 'uppercase' }}>
          <Award size={18} />
          <span>Recommended Choice (Lower Overall Cost)</span>
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--calc-primary)', margin: '6px 0' }}>
          {result.betterLoan} is Better
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--calc-text-muted)' }}>
          You save approx <strong>{formatINR(result.totalCostDifference)}</strong> in total out-of-pocket expenses.
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="calc-table-scroll">
        <table className="calc-table" style={{ textAlign: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Metric</th>
              <th style={{ color: 'var(--calc-primary)' }}>Loan A</th>
              <th style={{ color: 'var(--calc-accent)' }}>Loan B</th>
              <th>Difference</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ textAlign: 'left', fontWeight: 600 }}>Monthly EMI</td>
              <td>{formatINR(result.loanA.monthlyEmi)}</td>
              <td>{formatINR(result.loanB.monthlyEmi)}</td>
              <td style={{ fontWeight: 600 }}>{formatINR(result.emiDifference)}</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'left', fontWeight: 600 }}>Total Interest</td>
              <td>{formatINR(result.loanA.totalInterest)}</td>
              <td>{formatINR(result.loanB.totalInterest)}</td>
              <td style={{ fontWeight: 600 }}>{formatINR(result.interestDifference)}</td>
            </tr>
            <tr>
              <td style={{ textAlign: 'left', fontWeight: 600 }}>Processing Fees</td>
              <td>{formatINR(result.loanA.totalProcessingFee)}</td>
              <td>{formatINR(result.loanB.totalProcessingFee)}</td>
              <td>{formatINR(Math.abs(result.loanA.totalProcessingFee - result.loanB.totalProcessingFee))}</td>
            </tr>
            <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
              <td style={{ textAlign: 'left' }}>Total Cost (All-in)</td>
              <td style={{ color: 'var(--calc-primary)' }}>{formatINR(result.loanA.totalCost)}</td>
              <td style={{ color: 'var(--calc-accent)' }}>{formatINR(result.loanB.totalCost)}</td>
              <td style={{ color: 'var(--calc-success)' }}>{formatINR(result.totalCostDifference)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="Loan Comparison Calculator">
      <CalculatorShell
        title="Loan Comparison Calculator"
        category="Loan Calculators"
        description="Compare two loan offers side-by-side evaluating interest rate, tenure, EMI, and upfront processing fees."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="Total Cost Comparison Formula"
        formulaCode="Total Cost = Total Repayment (Principal + Interest) + Processing Fee + Incidental Charges"
        formulaDescription="A lower interest rate does not always guarantee the lowest cost if the lender charges high upfront administrative fees."
        disclaimerText="Comparison is indicative. Verify all loan sanction letters for additional hidden fees, insurance premiums, stamp duty, or documentation charges."
        calcTag="comparison"
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
