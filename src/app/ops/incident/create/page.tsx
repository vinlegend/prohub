'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import AppShell from '@/components/layout/appshell';
import FormInput from '@/components/form/FormInput';
import FormSelect from '@/components/form/FormSelect';
import FormTextArea from '@/components/form/FormTextArea';
import FormFileUpload from '@/components/form/FormFileUpload';
import { Button } from '@/components/ui/Button';
import AlertBanner from '@/components/form/AlertBanner';

import {
  IncidentCreateSchema,
  type IncidentCreateInput,
  type IncidentStatus,
} from '@/types/typedata';

const INCIDENT_TYPES = [
  'Damaged Item',
  'Failed Pickup/Delivery',
  'Documentation Error',
  'Other',
];

const STATUS_OPTIONS: IncidentStatus[] = [
  'Pending Approval',
  'Active',
  'Resolved',
];

export default function CreateIncidentPage() {
  const router = useRouter();

  const initial: IncidentCreateInput = {
    caseNo: '',
    incidentType: '',
    description: '',
    attachments: [] as File[],   // ✅ File[] not never[]
    capa: '',
    status: 'Pending Approval',  // default
  };

  const [values, setValues] = React.useState<IncidentCreateInput>(initial);
  const [errors, setErrors] =
    React.useState<Partial<Record<keyof IncidentCreateInput, string>>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const [bannerOpen, setBannerOpen] = React.useState(false);
  const [bannerType, setBannerType] = React.useState<'success' | 'error'>('success');
  const [bannerTitle, setBannerTitle] = React.useState<string>('');
  const [bannerDesc, setBannerDesc] = React.useState<string>('');

  function setField<K extends keyof IncidentCreateInput>(key: K, val: IncidentCreateInput[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setBannerOpen(false);

    const parsed = IncidentCreateSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const next: Partial<Record<keyof IncidentCreateInput, string>> = {};
      (Object.keys(fieldErrors) as (keyof IncidentCreateInput)[]).forEach((k) => {
        const msg = fieldErrors[k]?.[0];
        if (msg) next[k] = msg;
      });
      setErrors(next);
      setSubmitting(false);
      return;
    }

    try {
      await new Promise((r) => setTimeout(r, 700)); // simulate API call

      setBannerType('success');
      setBannerTitle('Incident submitted');
      setBannerDesc('Your incident report has been recorded.');
      setBannerOpen(true);

      // ✅ reset form for new entry
      setValues(initial);
      setErrors({});

    } catch {
      setBannerType('error');
      setBannerTitle('Submission failed');
      setBannerDesc('A server or network error occurred. Please try again.');
      setBannerOpen(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Incident Reporting">
      <div className="mx-auto space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Incident Reporting</h2>

        <AlertBanner
          open={bannerOpen}
          variant={bannerType}
          title={bannerTitle}
          description={bannerDesc}
          onClose={() => setBannerOpen(false)}
        />

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm"
          noValidate
        >
          <FormInput
            label="Case Number"
            placeholder="e.g. TYIM250620"
            value={values.caseNo}
            onChange={(e) => setField('caseNo', e.target.value)}
            error={errors.caseNo}
            showBrowserTooltip={false}
            required
          />

          <FormSelect
            label="Incident Type"
            value={values.incidentType}
            onChange={(val) => setField('incidentType', val)}
            options={INCIDENT_TYPES}
            optionLabel="-- Select incident type --"
            error={errors.incidentType}
            showBrowserTooltip={false}
            required
          />

          <FormTextArea
            label="Description"
            value={values.description}
            onChange={(e) => setField('description', e.currentTarget.value)}
            placeholder="Describe what happened…"
            rows={8}
            error={errors.description}
            showBrowserTooltip={false}
            required
          />

          <FormTextArea
            label="Corrective & Preventive Action (CAPA)"
            value={values.capa}
            onChange={(e) => setField('capa', e.currentTarget.value)}
            placeholder="What did you do to fix it, and how will you prevent it?"
            rows={6}
            error={errors.capa}
            showBrowserTooltip={false}
            required
          />

          <FormFileUpload
            label="Attachments"
            value={values.attachments}
            onChange={(files) => setField('attachments', files)}
            maxFiles={5}
            error={errors.attachments}
            showBrowserTooltip={false}
            right={
              values.attachments.length > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setField('attachments', [] as File[])}
                >
                  Clear all
                </Button>
              ) : undefined
            }
          />

          <div className="mt-6 flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/ops/incident')}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              {submitting ? 'Submitting…' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
