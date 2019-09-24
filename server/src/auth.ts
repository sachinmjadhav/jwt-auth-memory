import { User } from "./entity/User";
import { sign } from "jsonwebtoken";

export const createAccessToken = (user: User) => {
  return sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "15m"
    }
  );
};

export const createRefreshToken = (user: User) => {
  return sign(
    { userId: user._id, tokenVersion: user.tokenVersion + 1 },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d"
    }
  );
};
