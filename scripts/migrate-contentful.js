const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env.local");
const logPath = path.join(__dirname, "migrate-log.txt");

function log(message) {
  const line = `${new Date().toISOString()} ${message}`;
  fs.appendFileSync(logPath, line + "\n");
  console.log(message);
}

function readEnv() {
  return Object.fromEntries(
    fs.readFileSync(envPath, "utf8").split(/\n/).filter((line) => line.includes("=") && !line.trim().startsWith("#")).map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    })
  );
}

function writeEnv(updates) {
  let text = fs.readFileSync(envPath, "utf8");
  for (const [key, value] of Object.entries(updates)) {
    const pattern = new RegExp(`^${key}=.*$`, "m");
    if (pattern.test(text)) text = text.replace(pattern, `${key}=${value}`);
    else text += `\n${key}=${value}`;
  }
  if (!text.endsWith("\n")) text += "\n";
  fs.writeFileSync(envPath, text);
}

const env = readEnv();
const csHeaders = {
  api_key: env.CONTENTSTACK_API_KEY,
  authorization: env.CONTENTSTACK_MANAGEMENT_TOKEN,
};
const token = env.CONTENTFUL_CMA_TOKEN;
const ORG = "6cjTC0Ob1g0cdKmhBHzYg5";
const LONG = /^(text|body|description|lede|note|copyright|message|fine)$|_(body|text|note|lead|rule|message)$/;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cf(method, url, { body, headers, rawBody } = {}) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(rawBody ? { "Content-Type": "application/octet-stream" } : body !== undefined ? { "Content-Type": "application/vnd.contentful.management.v1+json" } : {}),
        ...headers,
      },
      body: rawBody || (body !== undefined ? JSON.stringify(body) : undefined),
    });
    if (response.status === 429) {
      const reset = Number(response.headers.get("x-contentful-ratelimit-reset") || 1);
      await sleep(Math.max(reset, 1) * 1000);
      continue;
    }
    const text = await response.text();
    let json = null;
    if (text) {
      try { json = JSON.parse(text); } catch { json = { message: text }; }
    }
    if (!response.ok) {
      const error = new Error(`${method} ${url} ${response.status} ${(text || "").slice(0, 400)}`);
      error.status = response.status;
      error.body = json;
      throw error;
    }
    return json;
  }
  throw new Error(`Rate limited: ${method} ${url}`);
}

async function csGet(urlPath) {
  const response = await fetch(urlPath, { headers: csHeaders });
  const text = await response.text();
  if (!response.ok) throw new Error(`Contentstack ${response.status} ${text.slice(0, 240)}`);
  return JSON.parse(text);
}

async function allEntries(type, locale) {
  const entries = [];
  for (let skip = 0; ; skip += 100) {
    const data = await csGet(`https://eu-api.contentstack.com/v3/content_types/${type}/entries?locale=${locale}&limit=100&skip=${skip}&include_count=true`);
    entries.push(...(data.entries || []));
    if (!data.entries?.length || entries.length >= data.count) break;
  }
  return entries;
}

function niceName(title, uid) {
  const raw = title && title.toLowerCase() !== uid.toLowerCase() ? title : uid.replace(/_/g, " ");
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function fieldOf(field) {
  const base = {
    id: field.uid,
    name: String(field.display_name || field.uid).slice(0, 50),
    required: Boolean(field.mandatory),
    localized: !field.non_localizable,
    omitted: false,
    disabled: false,
    validations: [],
  };
  if (field.data_type === "text" && field.multiple) {
    return { ...base, type: "Array", items: { type: "Symbol", validations: [] } };
  }
  if (field.data_type === "text") {
    const validations = [];
    if (field.enum?.choices?.length) validations.push({ in: field.enum.choices.map((choice) => String(choice.value)) });
    const type = field.uid !== "title" && LONG.test(field.uid) ? "Text" : "Symbol";
    return { ...base, type, validations };
  }
  if (field.data_type === "number") return { ...base, type: "Number" };
  if (field.data_type === "boolean") return { ...base, type: "Boolean" };
  if (field.data_type === "file") {
    if (field.multiple) return { ...base, type: "Array", items: { type: "Link", linkType: "Asset", validations: [] } };
    return { ...base, type: "Link", linkType: "Asset" };
  }
  if (field.data_type === "reference") {
    const ids = Array.isArray(field.reference_to) ? field.reference_to : [field.reference_to];
    return {
      ...base,
      type: "Array",
      items: { type: "Link", linkType: "Entry", validations: [{ linkContentType: ids }] },
    };
  }
  return { ...base, type: "Object" };
}

const titleField = {
  id: "title",
  name: "Title",
  type: "Symbol",
  required: true,
  localized: true,
  omitted: false,
  disabled: false,
  validations: [],
};

function partition(contentType) {
  const fields = contentType.schema.map(fieldOf);
  if (fields.length <= 50) {
    return [{ id: contentType.uid, name: niceName(contentType.title, contentType.uid), fields, sourceIds: fields.map((field) => field.id) }];
  }
  const firstIds = fields.slice(0, 49).map((field) => field.id);
  const rest = fields.slice(49);
  const moreId = `${contentType.uid}_more`;
  const moreFields = [titleField, ...rest];
  const head = [
    ...fields.slice(0, 49),
    {
      id: "continued",
      name: "Continued",
      required: false,
      localized: false,
      omitted: false,
      disabled: false,
      type: "Link",
      linkType: "Entry",
      validations: [{ linkContentType: [moreId] }],
    },
  ];
  return [
    { id: moreId, name: `${niceName(contentType.title, contentType.uid)} continued`, fields: moreFields, sourceIds: rest.map((field) => field.id), more: true, parentId: contentType.uid },
    { id: contentType.uid, name: niceName(contentType.title, contentType.uid), fields: head, sourceIds: firstIds, moreId },
  ];
}

function isAsset(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && value.uid && value.url && (value.filename || value.content_type));
}

function collectAssets(value, into) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectAssets(item, into));
    return;
  }
  if (isAsset(value)) into.set(value.uid, value);
  Object.values(value).forEach((item) => collectAssets(item, into));
}

function safeName(name) {
  return String(name || "file").split(/[/\\]/).pop().replace(/[^a-zA-Z0-9._-]/g, "_") || "file";
}

async function ensureSpace() {
  if (env.CONTENTFUL_SPACE_ID) return env.CONTENTFUL_SPACE_ID;
  try {
    const space = await cf("POST", "https://api.contentful.com/spaces", {
      body: { name: "Storefront" },
      headers: { "X-Contentful-Organization": ORG },
    });
    log(`created space ${space.sys.id}`);
    return space.sys.id;
  } catch (error) {
    log(`space create failed: ${error.message}`);
    const spaceId = "gxi1o5umqf81";
    const base = `https://api.contentful.com/spaces/${spaceId}/environments/master`;
    const entries = await cf("GET", `${base}/entries?limit=1000`);
    for (const item of entries.items || []) {
      try {
        await cf("DELETE", `${base}/entries/${item.sys.id}/published`, { headers: { "X-Contentful-Version": String(item.sys.version) } });
      } catch { /* already a draft */ }
      const fresh = await cf("GET", `${base}/entries/${item.sys.id}`);
      await cf("DELETE", `${base}/entries/${item.sys.id}`, { headers: { "X-Contentful-Version": String(fresh.sys.version) } });
    }
    try {
      const current = await cf("GET", `${base}/content_types/product`);
      try { await cf("DELETE", `${base}/content_types/product/published`); } catch { /* unpublished */ }
      const again = await cf("GET", `${base}/content_types/product`);
      await cf("DELETE", `${base}/content_types/product`, { headers: { "X-Contentful-Version": String(again.sys.version || current.sys.version) } });
      log("removed starter product type from Blank");
    } catch (inner) {
      log(`no starter product type to remove: ${inner.message}`);
    }
    return spaceId;
  }
}

async function ensureLocale(base) {
  const locales = await cf("GET", `${base}/locales`);
  if ((locales.items || []).some((locale) => locale.code === "fr-FR")) return;
  await cf("POST", `${base}/locales`, {
    body: {
      name: "French (France)",
      code: "fr-FR",
      fallbackCode: "en-US",
      optional: true,
      contentManagementApi: true,
      contentDeliveryApi: true,
    },
  });
  log("added fr-FR");
}

async function upsertType(base, part) {
  const url = `${base}/content_types/${part.id}`;
  const body = {
    name: part.name,
    description: "Same content model as the Contentstack type.",
    displayField: "title",
    fields: part.fields,
  };
  let current;
  try { current = await cf("GET", url); } catch (error) {
    if (error.status !== 404) throw error;
  }
  const saved = await cf("PUT", url, {
    body,
    headers: current ? { "X-Contentful-Version": String(current.sys.version) } : {},
  });
  const published = await cf("PUT", `${url}/published`, { headers: { "X-Contentful-Version": String(saved.sys.version) } });
  log(`type ${part.id} v${published.sys.version}`);
}

function assetLink(file, urls) {
  if (!file?.uid || !urls.has(file.uid)) return undefined;
  return { sys: { type: "Link", linkType: "Asset", id: file.uid } };
}

function entryLinks(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.flatMap((item) => {
    const id = typeof item === "string" ? item : item?.uid;
    return id ? [{ sys: { type: "Link", linkType: "Entry", id } }] : [];
  });
}

function sanitize(value, urls) {
  if (Array.isArray(value)) return value.map((item) => sanitize(item, urls));
  if (!value || typeof value !== "object") return value;
  if (isAsset(value)) {
    const url = urls.get(value.uid) || value.url;
    return { uid: value.uid, url, title: value.title || "", filename: value.filename || "" };
  }
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === "_metadata" || key === "ACL" || key === "publish_details" || key.startsWith("_")) continue;
    out[key] = sanitize(child, urls);
  }
  return out;
}

function convert(field, value, urls) {
  if (value == null) return undefined;
  if (field.type === "Symbol" || field.type === "Text") return typeof value === "string" ? value : String(value);
  if (field.type === "Number") return typeof value === "number" ? value : undefined;
  if (field.type === "Boolean") return typeof value === "boolean" ? value : undefined;
  if (field.type === "Array" && field.items?.type === "Symbol") {
    const list = Array.isArray(value) ? value : [value];
    return list.filter((item) => typeof item === "string");
  }
  if (field.type === "Link" && field.linkType === "Asset") return assetLink(value, urls);
  if (field.type === "Array" && field.items?.linkType === "Asset") {
    const list = (Array.isArray(value) ? value : [value]).map((item) => assetLink(item, urls)).filter(Boolean);
    return list.length ? list : undefined;
  }
  if (field.type === "Array" && field.items?.linkType === "Entry") {
    const list = entryLinks(value);
    return list.length ? list : undefined;
  }
  if (field.type === "Object") return sanitize(value, urls);
  return undefined;
}

function localized(field, enValue, frValue, urls) {
  const en = convert(field, enValue, urls);
  if (en === undefined || en === "") return undefined;
  if (Array.isArray(en) && en.length === 0) return undefined;
  const out = { "en-US": en };
  if (field.localized && frValue !== undefined) {
    const fr = convert(field, frValue, urls);
    if (fr !== undefined && JSON.stringify(fr) !== JSON.stringify(en)) out["fr-FR"] = fr;
  }
  return out;
}

async function uploadAsset(base, spaceId, asset, urls) {
  if (urls.has(asset.uid)) return;
  const download = await fetch(asset.url);
  if (!download.ok) throw new Error(`download ${asset.uid} ${download.status}`);
  const bytes = Buffer.from(await download.arrayBuffer());
  const upload = await cf("POST", `https://upload.contentful.com/spaces/${spaceId}/uploads`, { rawBody: bytes });
  const fileName = safeName(asset.filename || asset.title);
  let current;
  try { current = await cf("GET", `${base}/assets/${asset.uid}`); } catch (error) {
    if (error.status !== 404) throw error;
  }
  const saved = await cf("PUT", `${base}/assets/${asset.uid}`, {
    body: {
      fields: {
        title: { "en-US": asset.title || fileName },
        file: {
          "en-US": {
            contentType: asset.content_type || "application/octet-stream",
            fileName,
            uploadFrom: { sys: { type: "Link", linkType: "Upload", id: upload.sys.id } },
          },
        },
      },
    },
    headers: current ? { "X-Contentful-Version": String(current.sys.version) } : {},
  });
  await cf("PUT", `${base}/assets/${asset.uid}/files/en-US/process`, {
    headers: { "X-Contentful-Version": String(saved.sys.version) },
  });
  let processed = saved;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    processed = await cf("GET", `${base}/assets/${asset.uid}`);
    if (processed.fields?.file?.["en-US"]?.url) break;
    await sleep(1000);
  }
  const rawUrl = processed.fields?.file?.["en-US"]?.url || "";
  if (!rawUrl) throw new Error(`asset ${asset.uid} did not process`);
  await cf("PUT", `${base}/assets/${asset.uid}/published`, {
    headers: { "X-Contentful-Version": String(processed.sys.version) },
  });
  urls.set(asset.uid, rawUrl.startsWith("//") ? `https:${rawUrl}` : rawUrl);
}

async function pool(items, limit, worker) {
  const queue = [...items];
  const runners = Array.from({ length: limit }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(runners);
}

async function upsertEntry(base, id, contentType, fields) {
  const url = `${base}/entries/${id}`;
  let current;
  try { current = await cf("GET", url); } catch (error) {
    if (error.status !== 404) throw error;
  }
  const saved = await cf("PUT", url, {
    body: { fields },
    headers: {
      "X-Contentful-Content-Type": contentType,
      ...(current ? { "X-Contentful-Version": String(current.sys.version) } : {}),
    },
  });
  await cf("PUT", `${url}/published`, { headers: { "X-Contentful-Version": String(saved.sys.version) } });
}

async function ensureKeys(spaceId) {
  const base = `https://api.contentful.com/spaces/${spaceId}`;
  const existing = await cf("GET", `${base}/api_keys?limit=100`);
  let key = (existing.items || []).find((item) => item.name === "Storefront web");
  if (!key) {
    key = await cf("POST", `${base}/api_keys`, {
      body: {
        name: "Storefront web",
        environments: [{ sys: { type: "Link", linkType: "Environment", id: "master" } }],
      },
    });
  }
  const previewId = key.preview_api_key?.sys?.id;
  let previewToken = "";
  if (previewId) {
    const preview = await cf("GET", `${base}/preview_api_keys/${previewId}`);
    previewToken = preview.accessToken || "";
  }
  return { delivery: key.accessToken, preview: previewToken };
}

async function main() {
  fs.writeFileSync(logPath, "");
  const spaceId = await ensureSpace();
  writeEnv({ CONTENTFUL_SPACE_ID: spaceId, CONTENTFUL_ENVIRONMENT: "master" });
  const base = `https://api.contentful.com/spaces/${spaceId}/environments/master`;
  log(`space ${spaceId}`);
  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      await cf("GET", `${base}/locales`);
      break;
    } catch (error) {
      log(`waiting for environment ${error.message}`);
      await sleep(2000);
    }
  }
  await ensureLocale(base);

  const typeBody = await csGet("https://eu-api.contentstack.com/v3/content_types?include_count=true&limit=100");
  const contentTypes = typeBody.content_types;
  const parts = contentTypes.flatMap(partition);
  const bySource = new Map(contentTypes.map((type) => [type.uid, parts.filter((part) => part.id === type.uid || part.parentId === type.uid)]));

  log("loading entries");
  const english = new Map();
  const french = new Map();
  for (const type of contentTypes) {
    english.set(type.uid, await allEntries(type.uid, "en-us"));
    try {
      french.set(type.uid, await allEntries(type.uid, "fr-fr"));
    } catch (error) {
      log(`fr-fr ${type.uid} skipped ${error.message}`);
      french.set(type.uid, []);
    }
    log(`loaded ${type.uid} en=${english.get(type.uid).length} fr=${french.get(type.uid).length}`);
  }

  const assets = new Map();
  for (const entries of english.values()) entries.forEach((entry) => collectAssets(entry, assets));
  for (const entries of french.values()) entries.forEach((entry) => collectAssets(entry, assets));
  log(`assets ${assets.size}`);
  const urls = new Map();
  let uploaded = 0;
  await pool([...assets.values()], 2, async (asset) => {
    try {
      await uploadAsset(base, spaceId, asset, urls);
      uploaded += 1;
      if (uploaded % 5 === 0) log(`uploaded ${uploaded}/${assets.size}`);
    } catch (error) {
      log(`asset failed ${asset.uid} ${error.message}`);
    }
  });
  log(`uploaded ${uploaded}/${assets.size}`);

  const order = [];
  const pending = [...parts];
  const ready = new Set();
  while (pending.length) {
    const next = pending.findIndex((part) => part.fields.every((field) => {
      const links = field.linkType === "Entry" ? field.validations?.flatMap((rule) => rule.linkContentType || []) : field.items?.validations?.flatMap((rule) => rule.linkContentType || []) || [];
      return links.every((id) => ready.has(id) || !parts.some((candidate) => candidate.id === id));
    }));
    if (next < 0) throw new Error(`unresolved content types ${pending.map((part) => part.id).join(",")}`);
    const [part] = pending.splice(next, 1);
    order.push(part);
    ready.add(part.id);
  }
  for (const part of order) await upsertType(base, part);

  let written = 0;
  for (const part of order) {
    const sourceId = part.parentId || part.id;
    const frById = new Map((french.get(sourceId) || []).map((entry) => [entry.uid, entry]));
    for (const entry of english.get(sourceId) || []) {
      const fr = frById.get(entry.uid);
      const fields = {};
      for (const field of part.fields) {
        if (field.id === "continued") continue;
        if (field.id === "title" && part.more) {
          fields.title = localized(titleField, entry.title, fr?.title, urls);
          continue;
        }
        const schemaField = part.fields.find((item) => item.id === field.id);
        const value = localized(schemaField, entry[field.id], fr?.[field.id], urls);
        if (value) fields[field.id] = value;
      }
      if (part.moreId) {
        fields.continued = { "en-US": { sys: { type: "Link", linkType: "Entry", id: `${entry.uid}-more` } } };
      }
      const id = part.more ? `${entry.uid}-more` : entry.uid;
      try {
        await upsertEntry(base, id, part.id, fields);
        written += 1;
        if (written % 20 === 0) log(`entries ${written}`);
      } catch (error) {
        log(`entry failed ${part.id} ${id} ${error.message}`);
      }
    }
  }
  log(`entries written ${written}`);

  const keys = await ensureKeys(spaceId);
  writeEnv({
    CONTENTFUL_SPACE_ID: spaceId,
    CONTENTFUL_ENVIRONMENT: "master",
    CONTENTFUL_DELIVERY_TOKEN: keys.delivery,
    CONTENTFUL_PREVIEW_TOKEN: keys.preview,
  });
  log("env updated");
  log("done");
}

main().catch((error) => {
  log(`FATAL ${error.stack || error.message}`);
  process.exit(1);
});
