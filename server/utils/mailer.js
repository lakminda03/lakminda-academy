import tls from "tls";
<<<<<<< HEAD
=======
import crypto from "crypto";
>>>>>>> 2894c84 (Update README and env template)

const DEFAULT_SMTP_HOST = "smtp.gmail.com";
const DEFAULT_SMTP_PORT = 465;

const toBase64 = (value) => Buffer.from(value, "utf8").toString("base64");
<<<<<<< HEAD
=======
const stripCrlf = (value) => String(value || "").replace(/[\r\n]+/g, " ").trim();
const normalizeText = (value) => String(value || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

const parseMailbox = (input) => {
  const raw = stripCrlf(input);
  const angled = raw.match(/^(.*)<([^>]+)>$/);
  if (angled) {
    const name = stripCrlf(angled[1]).replace(/^["']|["']$/g, "").trim();
    const address = stripCrlf(angled[2]).toLowerCase();
    return { name, address };
  }
  return { name: "", address: raw.toLowerCase() };
};

const formatMailbox = ({ name, address }) => {
  if (!name) return address;
  return `"${name.replace(/"/g, '\\"')}" <${address}>`;
};

const getDomain = (email) => {
  const at = String(email || "").lastIndexOf("@");
  if (at <= 0) return "";
  return String(email).slice(at + 1).toLowerCase();
};

const htmlToText = (html) =>
  String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
>>>>>>> 2894c84 (Update README and env template)

const readSmtpResponse = async (state, socket) => {
  while (state.lines.length === 0) {
    if (state.error) throw state.error;
    await new Promise((resolve, reject) => {
      state.waiter = { resolve, reject };
    });
  }

  const first = state.lines.shift();
  const code = first.slice(0, 3);
  let lastLine = first;

  if (first[3] === "-") {
    while (true) {
      while (state.lines.length === 0) {
        if (state.error) throw state.error;
        await new Promise((resolve, reject) => {
          state.waiter = { resolve, reject };
        });
      }
      const next = state.lines.shift();
      lastLine = next;
      if (next.startsWith(`${code} `)) break;
    }
  }

  return { code: Number(code), line: lastLine };
};

const expectResponse = async (state, socket, expectedCodes) => {
  const res = await readSmtpResponse(state, socket);
  if (!expectedCodes.includes(res.code)) {
    throw new Error(`SMTP error ${res.code}: ${res.line}`);
  }
};

const writeCommand = (socket, command) =>
  new Promise((resolve, reject) => {
    socket.write(`${command}\r\n`, (err) => (err ? reject(err) : resolve()));
  });

<<<<<<< HEAD
const sendSmtpMail = async ({ host, port, user, pass, from, to, subject, html }) => {
=======
const sendSmtpMail = async ({
  host,
  port,
  user,
  pass,
  fromAddress,
  fromHeader,
  toAddress,
  subject,
  html,
  text,
  heloDomain,
  listUnsubscribe,
}) => {
>>>>>>> 2894c84 (Update README and env template)
  await new Promise((resolve, reject) => {
    const socket = tls.connect(
      {
        host,
        port,
        servername: host,
      },
      async () => {
        const state = { buffer: "", lines: [], waiter: null, error: null };

        socket.on("data", (chunk) => {
          state.buffer += chunk.toString("utf8");
          const parts = state.buffer.split("\r\n");
          state.buffer = parts.pop() || "";
          state.lines.push(...parts.filter(Boolean));
          if (state.waiter) {
            const { resolve: wake } = state.waiter;
            state.waiter = null;
            wake();
          }
        });

        socket.on("error", (err) => {
          state.error = err;
          if (state.waiter) {
            const { reject: fail } = state.waiter;
            state.waiter = null;
            fail(err);
          }
        });

        socket.on("end", () => {
          const err = new Error("SMTP connection closed unexpectedly");
          state.error = err;
          if (state.waiter) {
            const { reject: fail } = state.waiter;
            state.waiter = null;
            fail(err);
          }
        });

        try {
          await expectResponse(state, socket, [220]);
<<<<<<< HEAD
          await writeCommand(socket, "EHLO localhost");
=======
          await writeCommand(socket, `EHLO ${heloDomain}`);
>>>>>>> 2894c84 (Update README and env template)
          await expectResponse(state, socket, [250]);
          await writeCommand(socket, "AUTH LOGIN");
          await expectResponse(state, socket, [334]);
          await writeCommand(socket, toBase64(user));
          await expectResponse(state, socket, [334]);
          await writeCommand(socket, toBase64(pass));
          await expectResponse(state, socket, [235]);
<<<<<<< HEAD
          await writeCommand(socket, `MAIL FROM:<${from}>`);
          await expectResponse(state, socket, [250]);
          await writeCommand(socket, `RCPT TO:<${to}>`);
=======
          await writeCommand(socket, `MAIL FROM:<${fromAddress}>`);
          await expectResponse(state, socket, [250]);
          await writeCommand(socket, `RCPT TO:<${toAddress}>`);
>>>>>>> 2894c84 (Update README and env template)
          await expectResponse(state, socket, [250, 251]);
          await writeCommand(socket, "DATA");
          await expectResponse(state, socket, [354]);

<<<<<<< HEAD
          const message = [
            `From: ${from}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            "MIME-Version: 1.0",
            "Content-Type: text/html; charset=UTF-8",
            "",
            html,
=======
          const messageId = `<${crypto.randomBytes(16).toString("hex")}@${getDomain(fromAddress) || "localhost"}>`;
          const dateHeader = new Date().toUTCString();
          const boundary = `----lakminda-${crypto.randomBytes(12).toString("hex")}`;
          const message = [
            `Date: ${dateHeader}`,
            `Message-ID: ${messageId}`,
            `From: ${fromHeader}`,
            `Sender: ${fromAddress}`,
            `Reply-To: ${fromAddress}`,
            `To: ${toAddress}`,
            `Subject: ${stripCrlf(subject)}`,
            "MIME-Version: 1.0",
            "X-Mailer: Lakminda Academy SMTP Mailer",
            "Auto-Submitted: auto-generated",
            ...(listUnsubscribe ? [`List-Unsubscribe: <${listUnsubscribe}>`] : []),
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            "",
            `--${boundary}`,
            "Content-Type: text/plain; charset=UTF-8",
            "Content-Transfer-Encoding: 8bit",
            "",
            text,
            "",
            `--${boundary}`,
            "Content-Type: text/html; charset=UTF-8",
            "Content-Transfer-Encoding: 8bit",
            "",
            html,
            "",
            `--${boundary}--`,
>>>>>>> 2894c84 (Update README and env template)
            ".",
          ].join("\r\n");

          await writeCommand(socket, message);
          await expectResponse(state, socket, [250]);
          await writeCommand(socket, "QUIT");
          socket.end();
          resolve();
        } catch (err) {
          socket.destroy();
          reject(err);
        }
      }
    );

    socket.on("error", reject);
  });
};

<<<<<<< HEAD
export const sendEmail = async ({ to, subject, html }) => {
=======
export const sendEmail = async ({ to, subject, html, text }) => {
>>>>>>> 2894c84 (Update README and env template)
  const host = String(process.env.SMTP_HOST || DEFAULT_SMTP_HOST).trim();
  const port = Number(process.env.SMTP_PORT || DEFAULT_SMTP_PORT);
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();
<<<<<<< HEAD
  const from = String(process.env.MAIL_FROM || "").trim();

  if (!user || !pass || !from) {
    return { skipped: true };
  }

  await sendSmtpMail({ host, port, user, pass, from, to, subject, html });
=======
  const fromRaw = String(process.env.MAIL_FROM || "").trim();
  const listUnsubscribe = String(process.env.MAIL_LIST_UNSUBSCRIBE || "").trim();

  if (!user || !pass || !fromRaw) {
    throw new Error("SMTP credentials are missing. Set SMTP_USER, SMTP_PASS, and MAIL_FROM.");
  }

  const fromMailbox = parseMailbox(fromRaw);
  const toMailbox = parseMailbox(to);
  if (!fromMailbox.address || !toMailbox.address) {
    throw new Error("MAIL_FROM and recipient email address are required");
  }
  const heloDomain = String(
    process.env.SMTP_HELO_DOMAIN || getDomain(fromMailbox.address) || "localhost"
  ).trim();

  const customDomain = String(process.env.MAIL_DOMAIN || "").trim().toLowerCase();
  const fromDomain = getDomain(fromMailbox.address);
  if (customDomain && fromDomain !== customDomain) {
    throw new Error("MAIL_FROM must use MAIL_DOMAIN for SPF/DKIM/DMARC alignment");
  }

  const plainText = normalizeText(text || htmlToText(html) || "Please view this message in HTML.");

  await sendSmtpMail({
    host,
    port,
    user,
    pass,
    fromAddress: fromMailbox.address,
    fromHeader: formatMailbox(fromMailbox),
    toAddress: toMailbox.address,
    subject,
    html,
    text: plainText,
    heloDomain,
    listUnsubscribe,
  });
>>>>>>> 2894c84 (Update README and env template)
  return { skipped: false };
};
