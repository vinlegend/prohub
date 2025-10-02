'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/appshell';
import FormInput from '@/components/form/FormInput';
import { Button } from '@/components/ui/Button';
import AlertBanner from '@/components/form/AlertBanner';
import { TaxCreateSchema, type TaxCreateInput } from '@/types/typedata';

export default function CreateTaxPage() {
  const router = useRouter();

  // ✅ define initial state
  const initial: TaxCreateInput = {
    name_en: '',
    name_jp: undefined,
    rate: 0,
  };

  const [values, setValues] = React.useState<TaxCreateInput>(initial);
  const [errors, setErrors] =
    React.useState<Partial<Record<keyof TaxCreateInput, string>>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const [bannerOpen, setBannerOpen] = React.useState(false);
  const [bannerType, setBannerType] = React.useState<'success' | 'error'>('success');
  const [bannerTitle, setBannerTitle] = React.useState<string>('');
  const [bannerDesc, setBannerDesc] = React.useState<string>('');

  function setField<K extends keyof TaxCreateInput>(key: K, val: TaxCreateInput[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setBannerOpen(false);

    const parsed = TaxCreateSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const next: any = {};
      Object.keys(fieldErrors).forEach((k) => {
        const msg = fieldErrors[k as keyof typeof fieldErrors]?.[0];
        if (msg) next[k] = msg;
      });
      setErrors(next);
      setSubmitting(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 800)); // simulate API

      setBannerType('success');
      setBannerTitle('Successfully uploaded');
      setBannerDesc('Your new tax record has been saved.');
      setBannerOpen(true);

      // ✅ reset form after success
      setValues(initial);
      setErrors({});

      // optional scroll to top so banner is visible
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      setBannerType('error');
      setBannerTitle('Upload failed');
      setBannerDesc('A server or network error occurred. Please try again.');
      setBannerOpen(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Input Taxes">
      <div className="max-w mx-auto space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Create New Tax</h2>

        <AlertBanner
          open={bannerOpen}
          variant={bannerType}
          title={bannerTitle}
          description={bannerDesc}
          onClose={() => setBannerOpen(false)}
        />

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4"
        >
          <FormInput
            label="Tax Name (EN)"
            placeholder="e.g. Consumption Tax"
            value={values.name_en}
            onChange={(e) => setField('name_en', e.target.value)}
            error={errors.name_en}
            required
            showBrowserTooltip={false}
          />

          <FormInput
            label="Tax Name (JP)"
            placeholder="（任意）"
            value={values.name_jp ?? ''}
            onChange={(e) => setField('name_jp', e.target.value)}
            error={errors.name_jp}
            showBrowserTooltip={false}
          />

          <FormInput
            label="Tax Rate"
            type="number"
            step="0.1"
            min={0}
            max={100}
            placeholder="e.g. 10"
            value={String(values.rate ?? '')}
            onChange={(e) => setField('rate', Number(e.target.value))}
            error={errors.rate}
            showBrowserTooltip={false}
          />

          <div className="mt-6 flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/ops/finances/taxes')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save New Tax'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
