export const validateBalance = (lines: Array<{ debit: bigint; credit: bigint }>): boolean => {
  const totalDebit = lines.reduce((acc, l) => acc + l.debit, 0n);
  const totalCredit = lines.reduce((acc, l) => acc + l.credit, 0n);
  return totalDebit === totalCredit;
};
