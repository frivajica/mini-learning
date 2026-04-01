export const typeDefs = `#graphql
  scalar DateTime

  type User {
    id: ID!
    email: String!
    name: String!
    createdAt: DateTime!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    comments: [Comment!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Comment {
    id: ID!
    content: String!
    post: Post!
    author: User!
    createdAt: DateTime!
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    stock: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type PostsConnection {
    items: [Post!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type ProductsConnection {
    items: [Product!]!
    totalCount: Int!
    hasMore: Boolean!
    cursor: String
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreatePostInput {
    title: String!
    content: String!
  }

  input UpdatePostInput {
    title: String
    content: String
  }

  input CreateCommentInput {
    postId: ID!
    content: String!
  }

  input CreateProductInput {
    name: String!
    description: String
    price: Float!
    stock: Int!
  }

  input UpdateProductInput {
    name: String
    description: String
    price: Float
    stock: Int
  }

  type Query {
    me: User
    users: [User!]!
    user(id: ID!): User?
    posts(offset: Int, limit: Int): PostsConnection!
    post(id: ID!): Post?
    comments(postId: ID!): [Comment!]!
    products(cursor: String, limit: Int): ProductsConnection!
    product(id: ID!): Product?
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post
    deletePost(id: ID!): Boolean!
    createComment(input: CreateCommentInput!): Comment!
    deleteComment(id: ID!): Boolean!
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product
    deleteProduct(id: ID!): Boolean!
    updateStock(id: ID!, stock: Int!): Product
  }

  type Subscription {
    stockUpdated: Product!
  }
`;
