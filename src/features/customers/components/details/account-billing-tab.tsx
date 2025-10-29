import React from 'react';
import { useCustomerProfile } from './customer-profile-context';
import { formatCurrency } from '@/types/api';
import { formatDate } from '@/utils/customer-helpers';

const formatValue = (value?: string | number | null, currency?: string) => {
  if (value == null) {
    return 'N/A';
  }

  if (typeof value === 'number' && currency) {
    return formatCurrency(value, currency);
  }

  return value;
};

export const CustomerAccountBillingTab: React.FC = () => {
  const { accountBilling, rawCustomer } = useCustomerProfile();
  const currency = rawCustomer?.currency ?? 'USD';

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-surface-secondary/40 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">CRM Snapshot</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-primary/90 border border-border-primary/30 rounded-xl">
                <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Pipeline Stage</div>
                <div className="text-lg font-semibold text-text-primary mt-2">{accountBilling.crm.pipelineStage ?? 'Not assigned'}</div>
              </div>
              <div className="p-4 bg-surface-primary/90 border border-border-primary/30 rounded-xl">
                <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Account Executive</div>
                <div className="text-lg font-semibold text-text-primary mt-2">{accountBilling.crm.accountExecutive ?? 'Unassigned'}</div>
              </div>
              <div className="p-4 bg-surface-primary/90 border border-border-primary/30 rounded-xl">
                <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Monthly Recurring Revenue</div>
                <div className="text-lg font-semibold text-text-primary mt-2">
                  {formatValue(accountBilling.crm.monthlyRecurringRevenue, currency)}
                </div>
              </div>
              <div className="p-4 bg-surface-primary/90 border border-border-primary/30 rounded-xl">
                <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Contract Value</div>
                <div className="text-lg font-semibold text-text-primary mt-2">
                  {formatValue(accountBilling.crm.contractValue, currency)}
                </div>
              </div>
              <div className="p-4 bg-surface-primary/90 border border-border-primary/30 rounded-xl">
                <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Contract Start</div>
                <div className="text-lg font-semibold text-text-primary mt-2">
                  {accountBilling.crm.contractStart ? formatDate(accountBilling.crm.contractStart) : 'N/A'}
                </div>
              </div>
              <div className="p-4 bg-surface-primary/90 border border-border-primary/30 rounded-xl">
                <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Renewal Date</div>
                <div className="text-lg font-semibold text-text-primary mt-2">
                  {accountBilling.crm.renewalDate ? formatDate(accountBilling.crm.renewalDate) : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Renewal Timeline</h3>
            {accountBilling.renewalTimeline.length === 0 ? (
              <div className="p-6 bg-surface-primary/60 border border-border-primary/30 rounded-xl text-sm text-text-muted">
                No renewal timeline events recorded. Add contract milestones to visualize the renewal journey.
              </div>
            ) : (
              <div className="space-y-4">
                {accountBilling.renewalTimeline.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 bg-surface-primary/90 border border-border-primary/30 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-accent-primary/15 text-accent-primary flex items-center justify-center text-sm font-semibold uppercase">
                      {item.label.slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-text-primary">{item.label}</div>
                      <div className="text-xs text-text-secondary/80">
                        {item.date ? formatDate(item.date) : 'Date pending'}
                        {item.status && <span className="ml-2 uppercase tracking-wide font-semibold">{item.status}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-secondary/40 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Payment Health</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary/80">Annual Recurring Revenue</span>
                <span className="font-semibold text-text-primary">
                  {formatValue(accountBilling.paymentHealth.arr, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary/80">Monthly Recurring Revenue</span>
                <span className="font-semibold text-text-primary">
                  {formatValue(accountBilling.paymentHealth.mrr, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary/80">Lifetime Value</span>
                <span className="font-semibold text-text-primary">
                  {formatValue(accountBilling.paymentHealth.lifetimeValue, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary/80">Delinquency Status</span>
                <span className="font-semibold text-text-primary">
                  {accountBilling.paymentHealth.delinquencyStatus ?? 'Healthy'}
                </span>
              </div>
              <div className="text-xs text-text-secondary/70">
                Billing contacts: {accountBilling.paymentHealth.billingContacts.length > 0 ? accountBilling.paymentHealth.billingContacts.join(', ') : 'Not configured'}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Invoices</h3>
            {accountBilling.paymentHealth.invoices.length === 0 ? (
              <div className="mt-3 p-4 bg-surface-primary/90 border border-border-primary/20 rounded-xl text-sm text-text-muted">
                Connect billing data to track invoice history and payment behavior.
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {accountBilling.paymentHealth.invoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 bg-surface-primary/90 border border-border-primary/20 rounded-xl">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-text-primary">Invoice {invoice.id}</span>
                      <span className="text-text-secondary/70">{invoice.status ?? 'Unknown'}</span>
                    </div>
                    <div className="mt-2 text-sm text-text-secondary">
                      Amount: {formatValue(invoice.amount, currency)}
                      <br />
                      Due: {invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}
                      <br />
                      Issued: {invoice.issuedDate ? formatDate(invoice.issuedDate) : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface-primary/90 border border-border-primary/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">Contract Change Log</h3>
        {accountBilling.contractLog.length === 0 ? (
          <div className="p-6 bg-surface-secondary/40 border border-border-primary/20 rounded-xl text-sm text-text-muted">
            No historical contract changes logged for this customer. Log term updates or commercial addendums to track context.
          </div>
        ) : (
          <div className="space-y-3">
            {accountBilling.contractLog.map((entry) => (
              <details key={entry.id} className="group bg-surface-secondary/40 border border-border-primary/30 rounded-xl">
                <summary className="cursor-pointer list-none p-4 sm:p-5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{entry.summary}</div>
                    <div className="text-xs text-text-secondary/70">
                      {entry.date ? formatDate(entry.date) : 'Date unavailable'}
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-text-secondary transition-transform duration-200 group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                {entry.details && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-sm text-text-secondary/80">
                    {entry.details}
                  </div>
                )}
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
