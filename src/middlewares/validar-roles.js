const esAdminRol = (req, res, next) => {
  const user = req.userAuth;
  if (!user) {
    return res.status(500).json({ msg: "Se quiere user auth" });
  }
  const { rol } = user;
  if (rol !== "ADMIN_ROLE") {
    return res.status(401).json({ msg: "El usuario no es ADMIN" });
  }
  next();
};

module.exports = { esAdminRol };
