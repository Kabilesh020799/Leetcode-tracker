const submissionModel = require("../model/submissionModel");

exports.handleSubmission = async (req, res) => {
  try {
    const result = await submissionModel.submit(req.body);
    res.json({ status: "success", message: result });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
