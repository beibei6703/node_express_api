const express = require("express");
const router = express.Router();

const expressJoi = require("@escook/express-joi");

const { update_userinfo_schema,update_pwd_schema,update_avatar_schema } = require("../schema/user");

const userInforHandler = require("../router_handle/userinfo");

router.get("/userInfo", userInforHandler.userInfo);
router.post(
  "/userInfo",
  expressJoi(update_userinfo_schema),
  userInforHandler.updateUserInfo
);

router.post("/updatepwd",expressJoi(update_pwd_schema),userInforHandler.updatepwd)
router.post("/updateAvatar", expressJoi(update_avatar_schema),userInforHandler.updateAvatar)


module.exports = router;
