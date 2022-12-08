const express = require("express");
// 创建 express 的服务器实例
const app = express();

// 导入 Joi 来定义验证规则
const joi = require("joi");

const config = require("./config");

//一定在路由之前定义expressJwt
const { expressjwt } = require("express-jwt");
app.use(expressjwt({ secret: config.jwtSecretKey ,algorithms: ["HS256"]}).unless({ path: [/^\/api\//] }))

//路由
const userRouter = require("./routers/user");
const userInfoRouter = require("./routers/userinfo")

// 配置解析表单请求数据   相当去body-parser中的urlencoded一样的作用
//application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

//一定要在路由之前，配置 cors 这个中间件，从而解决接口跨域的问题
const cors = require("cors");
app.use(cors());

// 在路由之前封装res.cc函数
app.use((req, res, next) => {
  res.cc = function (err, status = 1) {
    res.send({
      status,
      message: err instanceof Error ? err.message : err,
    });
  };
  next();
});

//添加前缀/api 配置路由
app.use("/api", userRouter);

app.use("/my",userInfoRouter)

// 4.1 错误级别中间件
app.use(function (err, req, res, next) {
  // 数据验证失败
  if (err instanceof joi.ValidationError) return res.cc(err);
  if (err.name === 'UnauthorizedError') return res.send({status:1,msg:'身份认证失败！'})
  // 未知错误
  res.cc(err);
});
//启动
app.listen(3030, () => {
  console.log("启动成功");
});
