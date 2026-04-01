import { userResolvers } from "./users";
import { postResolvers } from "./posts";
import { commentResolvers } from "./comments";
import { productResolvers } from "./products";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...commentResolvers.Query,
    ...productResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...productResolvers.Mutation,
  },
  Subscription: {
    ...productResolvers.Subscription,
  },
  User: userResolvers.User,
  Post: postResolvers.Post,
  Comment: commentResolvers.Comment,
  Product: productResolvers.Product,
};
