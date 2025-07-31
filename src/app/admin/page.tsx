
import ManagePageContent from "@/components/manage-page-content";

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ManagePageContent showBackendConfig={true} />
    </div>
  );
}
