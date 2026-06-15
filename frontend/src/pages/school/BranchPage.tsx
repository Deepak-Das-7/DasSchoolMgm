import { ModuleListPage } from '@/features/ModuleListPage';

export function SchoolBranchPage() {
  // Maps your flat form payload into the nested address format your backend expects
  const transformPayload = (formData: Record<string, any>) => {
    return {
      name: formData.name,
      code: formData.code,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
      },
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      isMain: formData.isMain ?? false,
      status: formData.status ?? 'active',
    };
  };

  return (
    <ModuleListPage
      title="Branches"
      description="Manage branch records"
      endpoint="/schools/branches"
      // onSave={(data: any) => transformPayload(data)}
      fields={[
        { key: 'name', label: 'Branch Name', required: true, colSpan: 2 },
        { key: 'code', label: 'Branch Code', required: true, colSpan: 1 },

        // Flat keys map 1:1 with your UI input fields
        { key: 'street', label: 'Street Address', required: true, colSpan: 3 },
        { key: 'city', label: 'City', required: true, colSpan: 1 },
        { key: 'state', label: 'State/Province', required: true, colSpan: 1 },
        { key: 'country', label: 'Country', required: true, colSpan: 1 },
        { key: 'pincode', label: 'Postal/Pincode', required: true, colSpan: 1 },

        { key: 'phone', label: 'Phone', required: false, colSpan: 2 },
        { key: 'email', label: 'Email', required: false, colSpan: 2 },
        {
          key: 'status', label: 'Status', required: false, colSpan: 1, type: 'select', options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]
        },
        { key: 'isMain', label: 'Is Main Branch?', required: false, colSpan: 1, type: 'boolean' },
      ]}
    />
  );
}