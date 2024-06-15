const cookieToken = (user, res) => {
  const token = user.getJwtToken();

  const option = {
    expries: new Date(Date.now() + 3 * 24 * 60 * 60 * 100),
    httpOnly: true,
  };

  user.password = undefined;

  res.status(200).cookie("token", token, option).json({
    sucess: true,
    user,
    token,
  });
};

module.exports = cookieToken;
