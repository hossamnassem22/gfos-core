export const transformLedgerToTable = (ledgerData: any[]) => {
  return ledgerData.map(entry => ({
    id: entry.reference,
    client: entry.tenant_id,
    unit: entry.description,
    user: "System", // في المستقبل سيتم ربطه بـ User Context
    status: entry.is_reversed ? "Reversed" : "Completed",
    time: new Date(entry.created_at).toLocaleString()
  }));
};
