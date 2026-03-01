import dns from "dns";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const dnsResolver = dns.promises;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const disposableDomainsPath = path.resolve(__dirname, "..", "data", "disposableDomains.json");

let disposableDomainCache = null;

const normalizeDomain = (domain) => String(domain || "").trim().toLowerCase().replace(/\.$/, "");

const extractDomain = (email) => {
  const normalized = String(email || "").trim().toLowerCase();
  const atIndex = normalized.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === normalized.length - 1) return "";
  return normalizeDomain(normalized.slice(atIndex + 1));
};

const loadDisposableDomains = async () => {
  if (disposableDomainCache) return disposableDomainCache;
  const raw = await readFile(disposableDomainsPath, "utf8");
  const parsed = JSON.parse(raw);
  disposableDomainCache = new Set(
    (Array.isArray(parsed) ? parsed : []).map((item) => normalizeDomain(item)).filter(Boolean)
  );
  return disposableDomainCache;
};

export const isEmailFormatValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

export const isDisposableEmail = async (email) => {
  const domain = extractDomain(email);
  if (!domain) return false;
  const blockedDomains = await loadDisposableDomains();
  if (blockedDomains.has(domain)) return true;

  for (const blocked of blockedDomains) {
    if (domain.endsWith(`.${blocked}`)) return true;
  }
  return false;
};

export const hasValidMxRecord = async (emailOrDomain, timeoutMs = 3500) => {
  const input = String(emailOrDomain || "").trim().toLowerCase();
  const domain = input.includes("@") ? extractDomain(input) : normalizeDomain(input);
  if (!domain) return false;

  const isTemporaryDnsError = (error) => {
    const code = String(error?.code || "").toUpperCase();
    return ["ETIMEOUT", "EAI_AGAIN", "SERVFAIL", "REFUSED", "ECONNREFUSED"].includes(code);
  };

  const hasAddressRecord = async () => {
    try {
      const [a, aaaa] = await Promise.allSettled([
        dnsResolver.resolve4(domain),
        dnsResolver.resolve6(domain),
      ]);
      const hasA = a.status === "fulfilled" && Array.isArray(a.value) && a.value.length > 0;
      const hasAAAA = aaaa.status === "fulfilled" && Array.isArray(aaaa.value) && aaaa.value.length > 0;
      return hasA || hasAAAA;
    } catch {
      return false;
    }
  };

  try {
    const records = await Promise.race([
      dnsResolver.resolveMx(domain),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("MX lookup timeout")), timeoutMs)
      ),
    ]);
    if (Array.isArray(records) && records.length > 0) return true;
    return hasAddressRecord();
  } catch (error) {
    const code = String(error?.code || "").toUpperCase();
    if (["ENODATA", "ENOTFOUND", "NXDOMAIN", "NOTFOUND"].includes(code)) {
      // RFC fallback: a domain without MX can still receive mail via A/AAAA.
      return hasAddressRecord();
    }

    if (error?.message === "MX lookup timeout" || isTemporaryDnsError(error)) {
      return true;
    }

    // Fail open for unknown DNS resolver failures so valid domains are not blocked.
    return true;
  }
};
