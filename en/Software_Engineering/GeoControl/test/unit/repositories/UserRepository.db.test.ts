import { UserRepository } from "@repositories/UserRepository";
import {
  initializeTestDataSource,
  closeTestDataSource,
  TestDataSource
} from "@test/setup/test-datasource";
import { UserType } from "@models/UserType";
import { UserDAO } from "@dao/UserDAO";
import { NotFoundError } from "@models/errors/NotFoundError";
import { ConflictError } from "@models/errors/ConflictError";

beforeAll(async () => {
  await initializeTestDataSource();
});

afterAll(async () => {
  await closeTestDataSource();
});

beforeEach(async () => {
  await TestDataSource.getRepository(UserDAO).clear();
});

describe("UserRepository: SQLite in-memory", () => {
  const repo = new UserRepository();

  it("create user", async () => {
    const user = await repo.createUser("john", "pass123", UserType.Admin);
    expect(user).toMatchObject({
      username: "john",
      password: "pass123",
      type: UserType.Admin
    });

    const found = await repo.getUserByUsername("john");
    expect(found.username).toBe("john");
  });

  it("find user by username: not found", async () => {
    await expect(repo.getUserByUsername("ghost")).rejects.toThrow(
      NotFoundError
    );
  });

  it("create user: conflict", async () => {
    await repo.createUser("john", "pass123", UserType.Admin);
    await expect(
      repo.createUser("john", "anotherpass", UserType.Viewer)
    ).rejects.toThrow(ConflictError);
  });

  it("create multiple users", async () => {
    await repo.createUser("alice", "123", UserType.Viewer);
    await repo.createUser("bob", "456", UserType.Admin);

    const alice = await repo.getUserByUsername("alice");
    const bob = await repo.getUserByUsername("bob");

    expect(alice).toBeDefined();
    expect(bob).toBeDefined();
    expect(alice.username).toBe("alice");
    expect(bob.username).toBe("bob");
  });

  it("getAllUsers returns all users", async () => {
    await repo.createUser("u1", "p1", UserType.Viewer);
    await repo.createUser("u2", "p2", UserType.Admin);

    const all = await repo.getAllUsers();
    expect(all).toHaveLength(2);
    expect(all.map(u => u.username)).toEqual(expect.arrayContaining(["u1", "u2"]));
  });

  it("delete user", async () => {
    await repo.createUser("deleteMe", "pass", UserType.Viewer);
    await repo.deleteUser("deleteMe");

    await expect(repo.getUserByUsername("deleteMe")).rejects.toThrow(NotFoundError);
  });

  it("delete user: not found", async () => {
    await expect(repo.deleteUser("ghost")).rejects.toThrow(NotFoundError);
  });

  it("username case sensitivity check", async () => {
    await repo.createUser("CaseTest", "abc", UserType.Admin);
    await expect(repo.getUserByUsername("casetest")).rejects.toThrow(NotFoundError);
  });
});
