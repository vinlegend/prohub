'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/layout/appshell';
import FormInput from '@/components/form/FormInput';
import FormTextArea from '@/components/form/FormTextArea';
import { Button } from '@/components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import AlertBanner from '@/components/form/AlertBanner';

import { INCIDENTS } from '@/data/data';
import type { Incident } from '@/types/typedata';

export default function IncidentDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const incidentId = decodeURIComponent(String(id ?? ''));

  const [incident, setIncident] = React.useState<Incident | null>(null);
  const [bannerOpen, setBannerOpen] = React.useState(false);

  React.useEffect(() => {
    const row = INCIDENTS.find(
      (r) => r.id.trim().toLowerCase() === incidentId.trim().toLowerCase()
    );
    if (!row) {
      setBannerOpen(true);
      return;
    }
    setIncident(row);
  }, [incidentId]);

  if (!incident) {
    return (
      <AppShell title="Incident">
        <AlertBanner
          open={bannerOpen}
          variant="error"
          title="Incident not found"
          description={`No incident with ID ${incidentId}.`}
          onClose={() => setBannerOpen(false)}
        />
      </AppShell>
    );
  }

  // ✅ always work with a real array
  const attachments = incident.attachments ?? [];

  return (
    <AppShell title="Incident">
      <div className="mx-auto space-y-4">
        {/* header with button on the right */}
        <h3 className="flex items-center justify-between pb-3 text-lg font-semibold text-foreground">
          <span>Incident Details : {incident.id}</span>
          <Button variant="secondary" onClick={() => router.push('/ops/incident')}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </h3>

        <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
          <FormInput label="Case Number" value={incident.case} disabled className="bg-card" />
          <FormInput label="Incident Type" value={incident.issueType} disabled className="bg-card" />
          <FormInput label="Status" value={incident.status} disabled className="bg-card" />
          <FormInput label="Assigned To" value={incident.pic} disabled className="bg-card" />

          <FormTextArea
            label="Description"
            value={incident.description ?? ''}
            disabled
            rows={4}
            className="bg-card"
          />
          <FormTextArea
            label="CAPA"
            value={incident.capa ?? ''}
            disabled
            rows={4}
            className="bg-card"
          />

          {/* Attachments */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Attachments</label>
            <div className="rounded-md border border-border bg-card px-3 py-2 text-sm">
              {attachments.length > 0 ? (
                attachments.map((u, idx) => (
                  <React.Fragment key={`${u}-${idx}`}>
                    <a
                      href={u}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-primary hover:underline"
                    >
                      {u.split('/').pop()}
                    </a>
                    {idx < attachments.length - 1 ? ', ' : ''}
                  </React.Fragment>
                ))
              ) : (
                <span className="text-muted-foreground">No attachments</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
