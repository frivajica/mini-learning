import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

describe("Card Component", () => {
  it("renders Card with children", () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("renders CardHeader with children", () => {
    render(
      <Card>
        <CardHeader>Header Content</CardHeader>
      </Card>,
    );
    expect(screen.getByText("Header Content")).toBeInTheDocument();
  });

  it("renders CardTitle with children", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders CardDescription with children", () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Description</CardDescription>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("renders CardContent with children", () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
      </Card>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders CardFooter with children", () => {
    render(
      <Card>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("renders full card composition", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>,
    );

    expect(screen.getByText("Card Title")).toBeInTheDocument();
    expect(screen.getByText("Card Description")).toBeInTheDocument();
    expect(screen.getByText("Card Content")).toBeInTheDocument();
    expect(screen.getByText("Card Footer")).toBeInTheDocument();
  });
});
