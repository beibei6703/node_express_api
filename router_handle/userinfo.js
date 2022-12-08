const db = require("../db/index");

//使用 bcryptjs 对用户密码进行加密
//加密之后的密码，无法被逆向破解
//同一明文密码多次加密，得到的加密结果各不相同，保证了安全性
const bcrypt = require("bcryptjs");

exports.userInfo = function (req, res) {
  //  为了保证用户账号的安全性，password不在查询条件中
  const sql = "select username,email,id,user_pic from ev_users where id=?";

  console.log(req, req.auth, "333");
  db.query(sql, req.auth.id, (err, result) => {
    if (err) return res.cc(err);

    if (result.length !== 1) return res.cc("未查到该用户");

    return res.send({
      status: 0,

      message: "获取成功",

      data: result[0],
    });
  });
};

exports.updateUserInfo = function (req, res) {
  const sql = "update ev_users set ?where id =?";

  const user = req.body;

  db.query(sql, [user, req.body.id], (err, result) => {
    if (err) return res.cc(err);

    if (result.affectedRows !== 1) return res.cc("更新用户信息失败");

    res.send({
      status: 0,
      message: "获取成功",
    });
  });
};

//更新密码
exports.updatepwd = function (req, res) {
  //查询用户信息，
  //判断原密码是否正确
  //新密码符合规范，
  //更新用户密码
  const sql = "select * from ev_users where id=?";
  db.query(sql, [req.auth.id], (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc("用户信息不存在");

    const comparePwd = bcrypt.compareSync(req.body.oldPwd, results[0].password);
    if (!comparePwd) res.cc("原密码不正确");

    const sqlStr = `update ev_users set password=? where id=?`;
    //对新密码进行加密

    const newPwd = bcrypt.hashSync(req.body.newPwd, 10);

    // 执行 SQL 语句，根据 id 更新用户的密码
    db.query(sqlStr, [newPwd, req.auth.id], (err, results) => {
      // SQL 语句执行失败
      if (err) return res.cc(err);

      // SQL 语句执行成功，但是影响行数不等于 1
      if (results.affectedRows !== 1) return res.cc("更新密码失败！");

      // 更新密码成功
      res.cc("更新密码成功！", 0);
    });
  });
};

//上传头像
exports.updateAvatar = (req, res) => {
  const sql = "select * from ev_users where id =?";
  db.query(sql, req.auth.id, (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc("用户不存在/用户信息错误");
    const sqlStr = "update ev_users set user_pic=? where id=? ";
    db.query(sqlStr, [req.body.avatar, req.auth.id], (err, result) => {
      if (err) return res.cc(err);
      if (result.affectedRows !== 1) return res.cc("用户头像修改失败");
      res.send({
        status: 0,
        message: "修改成功",
      });
    });
  });
};
