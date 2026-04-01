import mongoose from "mongoose";

jest.mock("mongoose", () => {
  const mDocument = {
    toObject: jest.fn().mockReturnThis(),
  };
  const mModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    exec: jest.fn(),
  };
  const ActualMongoose = jest.requireActual("mongoose");
  return {
    ...ActualMongoose,
    default: {
      ...ActualMongoose.default,
      model: jest.fn().mockReturnValue(mModel),
      Schema: ActualMongoose.default.Schema,
      Types: ActualMongoose.default.Types,
      connect: jest.fn().mockResolvedValue(true),
      connection: {
        readyState: 1,
      },
    },
  };
});

jest.mock("../src/config/redis.js", () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn().mockResolvedValue([]),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});
