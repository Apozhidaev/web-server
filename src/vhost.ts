import { Request, Handler } from "express";

const ASTERISK_REGEXP = /\*/g;
const ASTERISK_REPLACE = "([^.]+)";
const END_ANCHORED_REGEXP = /(?:^|[^\\])(?:\\\\)*\$$/;
const ESCAPE_REGEXP = /([.+?^=!:${}()|[\]/\\])/g;
const ESCAPE_REPLACE = "\\$1";

export function vhost(hostname: string, handle: Handler) {
  if (!hostname) {
    throw new TypeError("argument hostname is required");
  }

  if (!handle) {
    throw new TypeError("argument handle is required");
  }

  if (typeof handle !== "function") {
    throw new TypeError("argument handle must be a function");
  }

  // create regular expression for hostname
  const regexp = hostregexp(hostname);

  const vhostHandler: Handler = (req, res, next) => {
    if (!vhostof(req, regexp)) {
      return next();
    }
    // handle
    handle(req, res, next);
  };

  return vhostHandler;
}

function hostregexp(val: string) {
  let source = String(val)
    .replace(ESCAPE_REGEXP, ESCAPE_REPLACE)
    .replace(ASTERISK_REGEXP, ASTERISK_REPLACE);

  // force leading anchor matching
  if (source[0] !== "^") {
    source = "^" + source;
  }

  // force trailing anchor matching
  if (!END_ANCHORED_REGEXP.test(source)) {
    source += "$";
  }

  return new RegExp(source, "i");
}

function vhostof(req: Request, regexp: RegExp) {
  const host = req.hostname;

  if (!host) {
    return false;
  }

  const match = regexp.exec(host);

  if (!match) {
    return false;
  }

  return true;
}
