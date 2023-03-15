exports.errorHandler = (err, req, res, next) => {
  if (err) {
    res.status(err.code || 500).json({ success: false, message: err.message });
  } else {
    res.status(404).json({ success: false, message: "page not found" });
  }
};
