// utils.test.ts

import {
    findOrThrowNotFound,
    throwConflictIfFound,
    parseISODateParamToUTC,
    parseStringArrayParam,
  } from "@utils";
  import { NotFoundError } from "@models/errors/NotFoundError";
  import { ConflictError } from "@models/errors/ConflictError";
  
  describe("utils.ts", () => {
    describe("findOrThrowNotFound", () => {
      const items = [{ id: 1 }, { id: 2 }];
  
      it("returns the found item if predicate matches", () => {
        const result = findOrThrowNotFound(items, (item) => item.id === 2, "Item not found");
        expect(result).toEqual({ id: 2 });
      });
  
      it("throws NotFoundError if predicate doesn't match", () => {
        expect(() =>
          findOrThrowNotFound(items, (item) => item.id === 3, "Item not found")
        ).toThrow(NotFoundError);
      });
    });
  
    describe("throwConflictIfFound", () => {
      const items = [{ name: "Alice" }, { name: "Bob" }];
  
      it("throws ConflictError if predicate matches", () => {
        expect(() =>
          throwConflictIfFound(items, (item) => item.name === "Bob", "Conflict")
        ).toThrow(ConflictError);
      });
  
      it("does not throw if predicate does not match", () => {
        expect(() =>
          throwConflictIfFound(items, (item) => item.name === "Charlie", "Conflict")
        ).not.toThrow();
      });
    });
  
    describe("parseISODateParamToUTC", () => {
      it("parses a valid ISO string into a Date", () => {
        const date = parseISODateParamToUTC("2023-01-01T00:00:00.000Z");
        expect(date).toBeInstanceOf(Date);
        expect(date?.toISOString()).toBe("2023-01-01T00:00:00.000Z");
      });
  
      it("returns undefined for invalid string", () => {
        const result = parseISODateParamToUTC("not-a-date");
        expect(result).toBeUndefined();
      });
  
      it("returns undefined for non-string input", () => {
        const result = parseISODateParamToUTC(1234);
        expect(result).toBeUndefined();
      });
    });
  
    describe("parseStringArrayParam", () => {
      it("parses a comma-separated string into array of strings", () => {
        const result = parseStringArrayParam("a,b , c , , d");
        expect(result).toEqual(["a", "b", "c", "d"]);
      });
  
      it("parses an array of strings into a cleaned string array", () => {
        const result = parseStringArrayParam(["a", " b", " ", "c"]);
        expect(result).toEqual(["a", "b", "c"]);
      });
  
      it("returns undefined for non-string and non-array input", () => {
        const result = parseStringArrayParam(1234);
        expect(result).toBeUndefined();
      });
    });
  });
  