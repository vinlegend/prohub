'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';

import AppShell from '@/components/layout/appshell';
import FormInput from '@/components/form/FormInput';
import FormSelect from '@/components/form/FormSelect';
import FormTextArea from '@/components/form/FormTextArea';
import FormFileUpload from '@/components/form/FormFileUpload';
import AlertBanner from '@/components/form/AlertBanner';
import { Button } from '@/components/ui/Button';
import ConfirmDialog from '@/components/form/ConfirmDialog';

import { INCIDENTS } from '@/data/data';
import {
  IncidentEditSchema,
  type IncidentEditInput,
  type Incident,
} from '@/types/typedata';

const INCIDENT_TYPES = [
  'Damaged Item',
  'Failed Pickup/Delivery',
  'Documentation Error',
  'Other',
];



async function fetchIncidentById(id: string): Promise<Incident | null> {
  await new Promise((r) => setTimeout(r, 120));
  const key = id.trim().toLowerCase();
  return INCIDENTS.find((i) => i.id.trim().toLowerCase() === key) ?? null;
}

export default function EditIncidentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(String(params?.id ?? ''));

  const empty: IncidentEditInput = {
    id,
    caseNo: '',
    incidentType: '',
    description: '',
    capa: '',
    attachments: [],
    status: 'Active',
  };

  const [values, setValues] = React.useState<IncidentEditInput>(empty);
  const [errors, setErrors] =
    React.useState<Partial<Record<keyof IncidentEditInput, string>>>({});
  const [loading, setLoading] = React.useState(true);

  const [isSaving, setIsSaving] = React.useState(false);
  const [isResolving, setIsResolving] = React.useState(false);

  const [bannerOpen, setBannerOpen] = React.useState(false);
  const [bannerType, setBannerType] = React.useState<'success' | 'error'>('success');
  const [bannerTitle, setBannerTitle] = React.useState('');
  const [bannerDesc, setBannerDesc] = React.useState('');

  // dialog state
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setErrors({});
      setValues({ ...empty, id });

      try {
        const row = await fetchIncidentById(id);
        if (!active) return;

        if (!row) {
          setBannerType('error');
          setBannerTitle('Incident not found');
          setBannerDesc(`No incident with ID ${id}.`);
          setBannerOpen(true);
          setLoading(false);
          return;
        }

        setValues({
          id: row.id,
          caseNo: row.case,
          incidentType: row.issueType,
          description: row.description ?? '',
          capa: row.capa ?? '',
          attachments: [],
          status: row.status,
        });
      } catch {
        if (!active) return;
        setBannerType('error');
        setBannerTitle('Failed to load incident');
        setBannerDesc('Could not load incident data. Please try again.');
        setBannerOpen(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  function setField<K extends keyof IncidentEditInput>(key: K, val: IncidentEditInput[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function validate(): boolean {
    const parsed = IncidentEditSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const next: Partial<Record<keyof IncidentEditInput, string>> = {};
      (Object.keys(fieldErrors) as (keyof IncidentEditInput)[]).forEach((k) => {
        const msg = fieldErrors[k]?.[0];
        if (msg) next[k] = msg;
      });
      setErrors(next);
      return false;
    }
    setErrors({});
    return true;
  }

async function handleSave(e?: React.FormEvent) {
  if (e) e.preventDefault();
  setBannerOpen(false);
  if (!validate()) return;

  try {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate API

    // ✅ go back to the list with a toast
    router.push(`/ops/incident?toast=updated&id=${encodeURIComponent(values.id)}`);
    return;
  } catch {
    setBannerType('error');
    setBannerTitle('Update failed');
    setBannerDesc(`We couldn't save changes for ${values.id}. Please try again.`);
    setBannerOpen(true);
  } finally {
    setIsSaving(false);
  }
}
  // open confirm modal
  function askResolve() {
    setConfirmOpen(true);
  }

  // called when user confirms in modal
  async function handleResolveConfirmed() {
    // If validation fails, close the dialog and show the field errors.
    if (!validate()) {
      setConfirmOpen(false);
      return;
    }

    try {
      setIsResolving(true);
      await new Promise((r) => setTimeout(r, 600));
      setValues((prev) => ({ ...prev, status: 'Resolved' }));

      // redirect to list with success toast
      router.push(`/ops/incident?toast=resolved&id=${encodeURIComponent(values.id)}`);
    } catch {
      setBannerType('error');
      setBannerTitle('Resolve failed');
      setBannerDesc(`We couldn't resolve ${values.id}. Please try again.`);
      setBannerOpen(true);
    } finally {
      setIsResolving(false);
      setConfirmOpen(false);
    }
  }

  const canResolve = values.status === 'Active';
  const isResolved = values.status === 'Resolved';

  const statusClass =
  values.status === 'Resolved'
    ? 'bg-badge-success-bg text-badge-success-text border border-badge-success-bd'
    : values.status === 'Pending Approval'
    ? 'bg-alert-warning-bg text-alert-warning-text border-alert-warning-border'
    : 'bg-alert-success-bg text-alert-success-text border-alert-success-border';

  return (
    <AppShell title="Edit Incident">
      <div className="mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            Edit Incident — {id}
          </h2>

          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>
              {values.status}
          </span>
        </div>

        <AlertBanner
          open={bannerOpen}
          variant={bannerType}
          title={bannerTitle}
          description={bannerDesc}
          onClose={() => setBannerOpen(false)}
        />

        <form
          onSubmit={handleSave}
          className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm"
          noValidate
        >
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <>
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
                rows={8}
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
                      onClick={() => setField('attachments', [])}
                    >
                      Clear all
                    </Button>
                  ) : undefined
                }
              />

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/ops/incident')}
                >
                  Cancel
                </Button>

                <Button type="submit" isLoading={isSaving}>
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </Button>

                {!isResolved && (
                  <Button
                    type="button"
                    onClick={askResolve}
                    isLoading={isResolving}
                    disabled={!canResolve || isResolving}
                    className={!canResolve ? 'opacity-60 cursor-not-allowed' : ''}
                    title={
                      canResolve
                        ? 'Mark this incident as Resolved'
                        : 'Cannot resolve while status is not Active'
                    }
                  >
                    Resolve Incident
                  </Button>
                )}
              </div>
            </>
          )}
        </form>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Incident Resolution"
        message={
          <>
            Are you sure you want to mark <b>{values.id}</b> as <b>Resolved</b>?<br />
            This action cannot be undone.
          </>
        }
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleResolveConfirmed}
        confirmLoading={isResolving}
      />
    </AppShell>
  );
}
