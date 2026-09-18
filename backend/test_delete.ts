import { deleteCase, addCase, getCases } from './src/services/dataService';

console.log("Initial cases count:", getCases().length);
addCase({ id: "TEST-CASE-1", title: "Test Case", caseNumber: "TEST-01" });
console.log("Cases after add:", getCases().length);

const result = deleteCase("TEST-CASE-1");
console.log("Delete result:", result);
console.log("Cases after delete:", getCases().length);
