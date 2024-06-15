const express = require("express");
const router = express.Router();
const {
  isAuthenticated,
  customRole,
} = require("../middleware/isAuthenticated");

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPass,
  getLoggedInUser,
  updatePass,
  updateProfile,
  adminUserAll,
  managerUserAll,
  singleUser,
  adminupdateProfile,
  deleteUser,
} = require("../controller/user");
const { updateMany } = require("../models/user");

router.route("/signup").post(signup);

router.route("/login").post(login);

router.route("/logout").post(isAuthenticated, logout);

router.route("/forgotpassword").post(forgotPassword);

router.route("/password/reset/:token").post(resetPass);

router.route("/userDashboard").post(isAuthenticated, getLoggedInUser);

router.route("/updatePass/:id").put(isAuthenticated, updatePass);
router
  .route("/userDashboard/updateDetails")
  .post(isAuthenticated, updateProfile);
router
  .route("/admin/users")
  .get(isAuthenticated, customRole("admin"), adminUserAll);
router
  .route("/manager/users")
  .get(isAuthenticated, customRole("manager"), managerUserAll);
router
  .route("/admin/users/:id")
  .get(isAuthenticated, customRole("admin"), singleUser)
  .put(isAuthenticated, customRole("admin"), adminupdateProfile)
  .delete(isAuthenticated, customRole("admin"), deleteUser);

module.exports = router;
