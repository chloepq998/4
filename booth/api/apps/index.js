const { listApps, addApp } = require("../../lib/store");

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json(await listApps());
    return;
  }

  if (req.method === "POST") {
    try {
      const app = await addApp(req.body || {});
      res.status(201).json(app);
    } catch (e) {
      res.status(e.status || 500).json({ error: e.message });
    }
    return;
  }

  res.status(405).json({ error: "method not allowed" });
};
