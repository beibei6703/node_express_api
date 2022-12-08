//导入数据库模块
const db = require("../db/index");

//使用 bcryptjs 对用户密码进行加密
//加密之后的密码，无法被逆向破解
//同一明文密码多次加密，得到的加密结果各不相同，保证了安全性
const bcrypt = require("bcryptjs");

//用这个包来生成 Token 字符串
const jwt = require("jsonwebtoken");
const config = require("../config");

// 注册用户的处理函数
exports.register = (req, res) => {
  const userInfo = req.body;

  //   if (!userInfo.username || !userInfo.password) {
  //     // return res.send({
  //     //   status: 1,
  //     //   message: "用户名或者密码不能为空",
  //     // });
  //     res.cc("用户名或者密码不能为空")
  //   }
  const sql = `select * from ev_users where username=?`;

  db.query(sql, [userInfo.username], (err, results) => {
    if (err) return res.send({ status: 1, message: err.message });
    //判断用户名是否配占用
    if (results.length > 0) {
      return res.cc("用户名已存在");
    }

    //用户注册用户名密码可用

    //调用 bcrypt.hashSync(明文密码, 随机盐的长度) 方法，对用户的密码进行加密处理：
    userInfo.password = bcrypt.hashSync(userInfo.password, 10);
    console.log(userInfo.password, "userInfo.password");
    // 插入数据库
    const sqlStr = "insert into ev_users set ?";
    db.query(sqlStr, userInfo, (err, results) => {
      console.log(results, "results");

      if (err) {
        return res.cc(err);
      }

      if (results.affectedRows != 1) {
        return res.send({ status: 1, message: "注册用户失败，请稍后再试！" });
      } else {
        return res.cc("注册用户成功", 0);
      }
    });
  });
};

// 检测表单数据是否合法
// 根据用户名查询用户的数据
// 判断用户输入的密码是否正确
// 生成 JWT 的 Token 字符串
// 登录的处理函数
exports.login = (req, res) => {
  const userInfo = req.body;
  const sql = "select * from ev_users where username=?";
  db.query(sql, [userInfo.username], (err, results) => {
    if (err) return res.cc(err);
    if (results.length !== 1) return res.cc("登录失败！");
    const compareResult = bcrypt.compareSync(
      userInfo.password,
      results[0].password
    );

    const user = { ...results[0], password: '', user_pic: '' }
    if (!compareResult) {
      return res.cc("登录失败l！");
    }

    // 生成 Token 字符串
    const tokenStr = jwt.sign(user, config.jwtSecretKey, {
      expiresIn: "10h", // token 有效期为 10 个小时
    });

    res.send({
      status: 0,
      message: "登录成功！",
      // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀
      token: "Bearer " + tokenStr,
    });
  });
};



