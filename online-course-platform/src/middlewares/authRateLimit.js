// Bound memory and count failed and successful attempts to limit password guessing.
module.exports = ({ windowMs = 600000, max = 20, maxClients = 10000 } = {}) => {
  const clients = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [ip, entry] of clients) if (entry.resetAt <= now) clients.delete(ip);
    const ip = req.ip;
    let entry = clients.get(ip);
    if (!entry) {
      if (clients.size >= maxClients) return res.status(429).json({ message: "Too many authentication attempts" });
      entry = { count: 0, resetAt: now + windowMs };
      clients.set(ip, entry);
    }
    if (++entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ message: "Too many authentication attempts" });
    }
    next();
  };
};
