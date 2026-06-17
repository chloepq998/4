const { castVote } = require("../../../lib/store");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  try {
    const app = await castVote(req.query.id, (req.body || {}).option);
    res.status(200).json(app);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
};
