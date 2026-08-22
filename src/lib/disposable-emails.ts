/**
 * Bloqueo de correos temporales / desechables.
 * Lista de dominios conocidos + heurística por palabras clave.
 */

const DISPOSABLE_DOMAINS = new Set<string>([
  "0-mail.com", "10minutemail.com", "10minutemail.net", "20minutemail.com",
  "33mail.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "guerrillamail.biz", "guerrillamail.de", "sharklasers.com", "grr.la",
  "spam4.me", "mailinator.com", "mailinator.net", "mailinator2.com",
  "notmailinator.com", "reallymymail.com", "binkmail.com", "bobmail.info",
  "chammy.info", "devnullmail.com", "letthemeatspam.com", "mailin8r.com",
  "mailnesia.com", "maildrop.cc", "mailnull.com", "spamgourmet.com",
  "tempmail.com", "temp-mail.org", "temp-mail.io", "tempmailo.com",
  "tempmail.net", "tempmailaddress.com", "tempail.com", "tmpmail.org",
  "tmpmail.net", "tmails.net", "moakt.com", "moakt.cc", "disposablemail.com",
  "trashmail.com", "trashmail.de", "trashmail.net", "trash-mail.com",
  "wegwerfmail.de", "yopmail.com", "yopmail.fr", "yopmail.net", "cool.fr.nf",
  "jetable.fr.nf", "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr", "courriel.fr.nf",
  "moncourrier.fr.nf", "monemail.fr.nf", "monmail.fr.nf", "getnada.com",
  "nada.email", "inboxkitten.com", "emailondeck.com", "fakemail.net",
  "fakeinbox.com", "throwawaymail.com", "dispostable.com", "mytemp.email",
  "mailcatch.com", "mintemail.com", "mohmal.com", "spambox.us", "spambog.com",
  "mailde.de", "mail-temporaire.fr", "mailtemp.info", "instant-mail.de",
  "burnermail.io", "anonaddy.me", "anonaddy.com", "simplelogin.com",
  "slmail.me", "1secmail.com", "1secmail.net", "1secmail.org", "esiix.com",
  "wwjmp.com", "xojxe.com", "yoggm.com", "linshiyouxiang.net", "mailpoof.com",
  "mail-temp.com", "tempinbox.com", "tempr.email", "discard.email",
  "dropmail.me", "emltmp.com", "minuteinbox.com", "10mail.org", "harakirimail.com",
  "byom.de", "cuvox.de", "dayrep.com", "einrot.com", "fleckens.hu",
  "gustr.com", "jourrapide.com", "rhyta.com", "superrito.com", "teleworm.us",
  "armyspy.com", "mailbox52.gq", "tmpeml.com", "vjuum.com", "laafd.com",
  "txcct.com", "kzccv.com", "uorak.com", "vddaz.com", "fexpost.com",
  "fexbox.org", "mailbox.in.ua", "rover.info", "chitthi.in", "fextemp.com",
  "any.pink", "merepost.com", "tempmailbox.net", "mailtm.com", "mail.tm",
  "edu.auction", "tidissajiiu.com", "punkass.com", "spamdecoy.net",
  "muellmail.com", "spam.care", "trashmailer.com", "emailtemporario.com.br",
  "correotemporal.org", "correo-temporal.com",
]);

const SUSPICIOUS_PATTERNS = [
  /(^|[.-])temp-?mail/i,
  /(^|[.-])tempmail/i,
  /throwaway/i,
  /disposable/i,
  /guerrilla/i,
  /mailinator/i,
  /trash-?mail/i,
  /fake-?(mail|inbox)/i,
  /10minute/i,
  /minutemail/i,
  /yopmail/i,
  /burner-?mail/i,
];

export function getEmailDomain(email: string): string {
  return email.trim().toLowerCase().split("@")[1] ?? "";
}

/** true si el correo pertenece a un servicio temporal/desechable. */
export function isDisposableEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain) return false;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;

  // Subdominios de un dominio bloqueado (ej: mail.yopmail.com)
  const parts = domain.split(".");
  for (let i = 1; i < parts.length - 1; i++) {
    if (DISPOSABLE_DOMAINS.has(parts.slice(i).join("."))) return true;
  }

  return SUSPICIOUS_PATTERNS.some((re) => re.test(domain));
}

export const DISPOSABLE_EMAIL_MESSAGE =
  "No se permiten correos temporales. Usá un email real.";
