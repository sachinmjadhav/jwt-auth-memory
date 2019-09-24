import * as React from "react";
import { useUsersQuery } from "../generated/graphql";

interface Props {}

export const Home: React.FC<Props> = () => {
  const { data } = useUsersQuery({ fetchPolicy: "network-only" });

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>Users: </div>
      <ul>
        {data.users.map(x => {
          return (
            <li key={x._id}>
              {x.email}, {x._id}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
