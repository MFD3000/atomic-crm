import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Welcome = () => (
  <Card>
    <CardHeader className="px-4">
      <CardTitle>Welcome to US Prosthetix CRM</CardTitle>
    </CardHeader>
    <CardContent className="px-4">
      <p className="text-sm mb-4">
        Manage your franchisee network, patient relationships, and prosthetics/orthotics
        workflows in one integrated platform.
      </p>
      <p className="text-sm mb-4">
        Track 51 Oakwood prospects, monitor patient assessments, and streamline your
        device fabrication and delivery pipeline with precision and care.
      </p>
      <p className="text-sm">
        Use the navigation above to access Contacts, Companies, and Deals. Get started
        by exploring your dashboard metrics or creating your first patient record.
      </p>
    </CardContent>
  </Card>
);
