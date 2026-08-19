// src/calculators/pages/loan/FoirEligibilityPage.jsx
// ─────────────────────────────────────────────────────────────────
// 1.2 Eligibility Calculator — FOIR Method
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import CalculatorLayout from '../../layouts/CalculatorLayout';
import CalculatorShell from '../../components/CalculatorShell';
import { calculateFOIREligibility } from '../../utils/calculations.js';
import { formatINR, parseNumber } from '../../utils/formatters.js';
import { validateNumber, validateFOIR, validateInterestRate, validateTenure } from '../../utils/validation.js';

export default function FoirEligibilityPage() {
  const [monthlyIncome, setMonthlyIncome] = useState('75000');
  const [existingEmi, setExistingEmi] = useState('15000');
  const [foirPercent, setFoirPercent] = useState('50');
  const [rate, setRate] = useState('9.5');
  const [tenureYears, setTenureYears] = useState('15');

  const errors = useMemo(() => {
    return {
      monthlyIncome: validateNumber(monthlyIncome, { min: 5000, max: 50000000, fieldName: 'Monthly Income' }),
      existingEmi: validateNumber(existingEmi, { min: 0, max: 50000000, fieldName: 'Existing EMI' }),
      foirPercent: validateFOIR(foirPercent),
      rate: validateInterestRate(rate),
      tenureYears: validateTenure(tenureYears, 'years', 'Tenure'),
    };
  }, [monthlyIncome, existingEmi, foirPercent, rate, tenureYears]);

  const hasErrors = Object.values(errors).some(Boolean);

  const result = useMemo(() => {
    if (hasErrors) {
      return {
        maxPermissibleEmi: 0,
        availableEmi: 0,
        eligibleLoanAmount: 0,
      };
    }
    return calculateFOIREligibility({
      monthlyIncome: parseNumber(monthlyIncome),
      existingEmi: parseNumber(existingEmi),
      foirPercent: parseNumber(foirPercent),
      rate: parseNumber(rate),
      tenureYears: parseNumber(tenureYears),
    });
  }, [monthlyIncome, existingEmi, foirPercent, rate, tenureYears, hasErrors]);

  const handleReset = () => {
    setMonthlyIncome('75000');
    setExistingEmi('15000');
    setFoirPercent('50');
    setRate('9.5');
    setTenureYears('15');
  };

  const inputsComponent = (
    <div>
      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="foir-income">Net Monthly Income (₹)</label>
          <span className="calc-field-hint">{formatINR(monthlyIncome)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="foir-income"
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className={`calc-input has-prefix ${errors.monthlyIncome ? 'calc-input-error' : ''}`}
            placeholder="e.g. 75000"
            min="5000"
            step="5000"
          />
        </div>
        {errors.monthlyIncome && <span className="calc-error-text">{errors.monthlyIncome}</span>}
      </div>

      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="foir-existing">Existing Monthly EMIs (₹)</label>
          <span className="calc-field-hint">{formatINR(existingEmi)}</span>
        </div>
        <div className="calc-input-addon-wrap">
          <span className="calc-addon-prefix">₹</span>
          <input
            id="foir-existing"
            type="number"
            value={existingEmi}
            onChange={(e) => setExistingEmi(e.target.value)}
            className={`calc-input has-prefix ${errors.existingEmi ? 'calc-input-error' : ''}`}
            placeholder="e.g. 15000"
            min="0"
            step="1000"
          />
        </div>
        {errors.existingEmi && <span className="calc-error-text">{errors.existingEmi}</span>}
      </div>

      <div className="calc-form-row">
        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="foir-pct">Bank FOIR Limit (%)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="foir-pct"
              type="number"
              value={foirPercent}
              onChange={(e) => setFoirPercent(e.target.value)}
              className={`calc-input has-suffix ${errors.foirPercent ? 'calc-input-error' : ''}`}
              placeholder="e.g. 50"
              min="10"
              max="90"
              step="5"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.foirPercent && <span className="calc-error-text">{errors.foirPercent}</span>}
        </div>

        <div className="calc-field-wrap">
          <div className="calc-field-header">
            <label className="calc-field-label" htmlFor="foir-rate">Expected Rate (% p.a.)</label>
          </div>
          <div className="calc-input-addon-wrap">
            <input
              id="foir-rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className={`calc-input has-suffix ${errors.rate ? 'calc-input-error' : ''}`}
              placeholder="e.g. 9.5"
              min="1"
              max="35"
              step="0.1"
            />
            <span className="calc-addon-suffix">%</span>
          </div>
          {errors.rate && <span className="calc-error-text">{errors.rate}</span>}
        </div>
      </div>

      <div className="calc-field-wrap">
        <div className="calc-field-header">
          <label className="calc-field-label" htmlFor="foir-tenure">Desired Tenure (Years)</label>
          <span className="calc-field-hint">{tenureYears} Years</span>
        </div>
        <div className="calc-input-addon-wrap">
          <input
            id="foir-tenure"
            type="number"
            value={tenureYears}
            onChange={(e) => setTenureYears(e.target.value)}
            className={`calc-input has-suffix ${errors.tenureYears ? 'calc-input-error' : ''}`}
            placeholder="e.g. 15"
            min="1"
            max="35"
            step="1"
          />
          <span className="calc-addon-suffix">Yrs</span>
        </div>
        {errors.tenureYears && <span className="calc-error-text">{errors.tenureYears}</span>}
      </div>
    </div>
  );

  const resultsComponent = (
    <div>
      <div className="calc-primary-result-box">
        <div className="calc-primary-result-label">Estimated Loan Eligibility</div>
        <div className="calc-primary-result-value">{formatINR(result.eligibleLoanAmount)}</div>
        <div className="calc-primary-result-caption">
          Based on {foirPercent}% FOIR limit & {tenureYears} Years tenure
        </div>
      </div>

      <div className="calc-secondary-metrics-grid">
        <div className="calc-metric-card">
          <div className="calc-metric-label">Max Permissible EMI ({foirPercent}%)</div>
          <div className="calc-metric-value">{formatINR(result.maxPermissibleEmi)}</div>
        </div>
        <div className="calc-metric-card">
          <div className="calc-metric-label">Available Monthly EMI</div>
          <div className="calc-metric-value" style={{ color: 'var(--calc-success)' }}>
            {formatINR(result.availableEmi)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <CalculatorLayout currentTitle="FOIR Eligibility Calculator">
      <CalculatorShell
        title="Eligibility Calculator (FOIR Method)"
        category="Loan Calculators"
        description="Estimate loan eligibility based on Fixed Obligation to Income Ratio (FOIR) standards followed by Indian Banks and NBFCs."
        inputsComponent={inputsComponent}
        resultsComponent={resultsComponent}
        formulaTitle="FOIR Capacity Formula"
        formulaCode="Available EMI = (Net Income × FOIR%) - Existing EMIs"
        formulaDescription="The eligible loan amount is calculated by determining the principal loan sum whose monthly repayment matches the available EMI over the requested tenure."
        disclaimerText="Eligibility is an indicative estimate and may vary based on lender policy, credit profile, income documentation, CIBIL score, and other underwriting factors. This calculation does not constitute loan approval or guarantee."
        onReset={handleReset}
      />
    </CalculatorLayout>
  );
}
