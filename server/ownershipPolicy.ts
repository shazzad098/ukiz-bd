/** Secondary defense-in-depth owner check for a record already selected through a user-scoped database predicate. */
export function onlyForCustomer<T extends { id: number; userId: number | null }>(record: T | undefined, customerId: number) { return record?.userId === customerId ? record : undefined; }
