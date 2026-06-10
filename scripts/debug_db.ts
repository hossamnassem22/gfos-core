import { sql } from "../src/infrastructure/database/connection.ts";

const data = await sql`
  SELECT id, status, due_date, 
         (due_date < CURRENT_DATE) as is_overdue,
         CURRENT_DATE as today
  FROM amortization_schedule;
`;

console.log("Current Database State:");
console.table(data);
