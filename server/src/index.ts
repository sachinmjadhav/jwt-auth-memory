import { createAccessToken, createRefreshToken } from "./auth";
import { verify } from "jsonwebtoken";
import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./UserResolver";
import { createConnection, getMongoManager } from "typeorm";
import cookieParser from "cookie-parser";
import { User } from "./entity/User";
import { sendRefreshToken } from "./sendRefreshToken";
const ObjectId = require("mongodb").ObjectId;

(async () => {
  const app = express();
  app.use(cookieParser());
  app.get("/", (_req, res) => res.send("Hello"));

  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }

    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (error) {
      console.log(error);
      return res.send({ ok: false, accessToken: "" });
    }

    // token is valid
    // we can send back an access token
    const manager = getMongoManager();
    const user = await manager.findOne(User, {
      _id: ObjectId(payload.userId)
    });

    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }

    sendRefreshToken(res, createRefreshToken(user));

    return res.send({
      ok: true,
      accessToken: createAccessToken(user)
    });
  });

  await createConnection();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver]
    }),
    context: ({ req, res }) => ({ req, res })
  });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => console.log("express server started"));
})();
