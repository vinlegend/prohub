'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';

import AppShell from '@/components/layout/appshell';
import FormInput from '@/components/form/FormInput';
import { Button } from '@/components/ui/Button';
import AlertBanner from '@/components/form/AlertBanner';

import { TAXES } from '@/data/data';
import { TaxCreateSchema, type TaxCreateInput } from '@/types/typedata';


export default function EditTaxPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const taxId = decodeURIComponent(String(params?.id ?? ''));

  // Lookup existing tax by id (demo data source)
  const tax = React.useMemo(() => TAXES.find((t) => t.id === taxId), [taxId]);
  const notFound = !tax;

  // Prefilled form state
  const [values, setValues] = React.useState<TaxCreateInput>({
    name_en: '',
    name_jp: undefined,
    rate: 0,
  });

  React.useEffect(() => {
    if (tax) {
      setValues({
        name_en: tax.name_en,
        name_jp: tax.name_jp ?? undefined,
        rate: tax.rate,
      });
    }
  }, [tax]);

  const [errors, setErrors] =
    React.useState<Partial<Record<keyof TaxCreateInput, string>>>({});
  const [submitting, setSubmitting] = React.useState(false);

  // Banner only for API/network result (not Zod)
  const [bannerOpen, setBannerOpen] = React.useState(false);
  const [bannerType, setBannerType] = React.useState<'success' | 'error'>('success');
  const [bannerTitle, setBannerTitle] = React.useState('');
  const [bannerDesc,   setBannerDesc]   = React.useState('');

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
      await new Promise((r) => setTimeout(r, 700));

      router.push(`/ops/finances/taxes?toast=updated&id=${encodeURIComponent(taxId)}`);
      return;
    } catch (err) {
      setBannerType('error');
      setBannerTitle('Update failed');
      setBannerDesc('A server or network error occurred. Please try again.');
      setBannerOpen(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Edit Data Taxes">
      <div className="mx-auto space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          {notFound ? 'Tax not found' : `Edit Tax — ${taxId}`}
        </h2>

        {notFound ? (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">
              We couldn’t find a tax with ID <span className="font-medium">{taxId}</span>.
            </p>
            <div className="mt-4">
              <Button variant="secondary" onClick={() => router.push('/ops/finances/taxes')}>
                Back to Taxes
              </Button>
            </div>
          </div>
        ) : (
          <>
            <AlertBanner
              open={bannerOpen}
              variant={bannerType}
              title={bannerTitle}
              description={bannerDesc}
              onClose={() => setBannerOpen(false)}
            />

            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4"
            >
              <FormInput
                label="Tax Name (EN)"
                placeholder="e.g. Consumption Tax"
                value={values.name_en}
                onChange={(e) => setField('name_en', e.target.value)}
                error={errors.name_en}
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
                type="text" // avoid native number tooltip; Zod handles validation
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
                  {submitting ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </AppShell>
  );
}
