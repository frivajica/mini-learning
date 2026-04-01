import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query GetPosts($offset: Int, $limit: Int) {
    posts(offset: $offset, limit: $limit) {
      items {
        id
        title
        content
        createdAt
        author {
          id
          name
          email
        }
        comments {
          id
          content
          createdAt
          author {
            id
            name
          }
        }
      }
      totalCount
      hasMore
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts($cursor: String, $limit: Int) {
    products(cursor: $cursor, limit: $limit) {
      items {
        id
        name
        description
        price
        stock
        createdAt
      }
      totalCount
      hasMore
      cursor
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
    }
  }
`;

export const STOCK_UPDATED_SUBSCRIPTION = gql`
  subscription StockUpdated {
    stockUpdated {
      id
      name
      stock
    }
  }
`;
