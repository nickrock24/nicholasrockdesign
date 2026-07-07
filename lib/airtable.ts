const AIRTABLE_API_URL = "https://api.airtable.com/v0";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

// Airtable formula strings are double-quoted; escape backslashes and quotes
// so values coming from user-editable fields (e.g. a Slug) can't break out
// of the string literal.
export function escapeFormulaValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export type AirtableRecord<F = Record<string, unknown>> = {
  id: string;
  createdTime: string;
  fields: F;
};

export type AirtableListOptions = {
  filterByFormula?: string;
  sort?: { field: string; direction?: "asc" | "desc" }[];
  fields?: string[];
  /** Next.js cache tag for this query; also used as the 1hr time-based fallback. */
  tag: string;
};

export async function listRecords<F = Record<string, unknown>>(
  table: string,
  options: AirtableListOptions
): Promise<AirtableRecord<F>[]> {
  const baseId = getEnv("AIRTABLE_BASE_ID");
  const apiKey = getEnv("AIRTABLE_API_KEY");

  const records: AirtableRecord<F>[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(table)}`);
    if (options.filterByFormula) {
      url.searchParams.set("filterByFormula", options.filterByFormula);
    }
    if (options.fields) {
      for (const field of options.fields) {
        url.searchParams.append("fields[]", field);
      }
    }
    if (options.sort) {
      options.sort.forEach((s, i) => {
        url.searchParams.set(`sort[${i}][field]`, s.field);
        url.searchParams.set(`sort[${i}][direction]`, s.direction ?? "asc");
      });
    }
    if (offset) {
      url.searchParams.set("offset", offset);
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { tags: [options.tag], revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Airtable list failed for "${table}" (${res.status}): ${await res.text()}`);
    }

    const json = (await res.json()) as { records: AirtableRecord<F>[]; offset?: string };
    records.push(...json.records);
    offset = json.offset;
  } while (offset);

  return records;
}

export async function getRecordById<F = Record<string, unknown>>(
  table: string,
  recordId: string
): Promise<AirtableRecord<F> | null> {
  const baseId = getEnv("AIRTABLE_BASE_ID");
  const apiKey = getEnv("AIRTABLE_API_KEY");
  const url = `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(table)}/${recordId}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Airtable get failed for "${table}/${recordId}" (${res.status}): ${await res.text()}`);
  }

  return res.json();
}

export async function updateRecordFields(
  table: string,
  recordId: string,
  fields: Record<string, unknown>
): Promise<AirtableRecord> {
  const baseId = getEnv("AIRTABLE_BASE_ID");
  const apiKey = getEnv("AIRTABLE_API_KEY");
  const url = `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(table)}/${recordId}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    throw new Error(`Airtable update failed for "${table}/${recordId}" (${res.status}): ${await res.text()}`);
  }

  return res.json();
}

export async function createRecords(
  table: string,
  records: { fields: Record<string, unknown> }[]
): Promise<AirtableRecord[]> {
  const baseId = getEnv("AIRTABLE_BASE_ID");
  const apiKey = getEnv("AIRTABLE_API_KEY");
  const url = `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(table)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records, typecast: true }),
  });

  if (!res.ok) {
    throw new Error(`Airtable create failed for "${table}" (${res.status}): ${await res.text()}`);
  }

  const json = (await res.json()) as { records: AirtableRecord[] };
  return json.records;
}
