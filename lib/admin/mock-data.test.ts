import { describe, expect, it } from "vitest";

import { summarizeOrderFinance } from "@/lib/admin/finances";
import { listAdminCustomers } from "@/lib/admin/mock-customers";
import { isRevenueOrder, listAdminOrders } from "@/lib/admin/mock-orders";
import { MOCK_CUSTOMER_PROFILES } from "@/lib/admin/mock-people";
import { listAdminUsers } from "@/lib/admin/mock-users";
import { mockProducts, mockVariants } from "@/lib/catalog/mock-data";
import { estimateShippingBdt } from "@/lib/checkout/types";

const orders = listAdminOrders();

function catalogPriceFor(lineName: string): number | null {
  const [productName, variantName] = lineName.split(" · ");
  const product = mockProducts.find((item) => item.name === productName);
  if (!product) return null;
  if (!variantName) return product.price;
  const variant = mockVariants.find(
    (item) => item.productId === product.id && item.name === variantName,
  );
  return variant ? (variant.price ?? product.price) : null;
}

describe("mock admin orders", () => {
  it("is a realistic number of orders, newest first, all bKash", () => {
    expect(orders.length).toBeGreaterThanOrEqual(25);
    expect(orders.every((order) => order.paymentMethod === "bKash")).toBe(true);
    const times = orders.map((order) => Date.parse(order.placedAt));
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  it("only sells real catalog products at catalog prices", () => {
    for (const order of orders) {
      for (const line of order.lines) {
        expect(catalogPriceFor(line.name), line.name).toBe(line.unitPrice);
      }
    }
  });

  it("has totals that add up, with the store's delivery charge", () => {
    for (const order of orders) {
      for (const line of order.lines) {
        expect(line.lineTotal).toBe(line.unitPrice * line.quantity);
      }
      const subtotal = order.lines.reduce((sum, line) => sum + line.lineTotal, 0);
      expect(order.subtotal).toBe(subtotal);
      expect(order.deliveryCharge).toBe(estimateShippingBdt(order.city).amount);
      expect(order.total).toBe(subtotal + order.deliveryCharge);
    }
  });

  it("never fulfils an unpaid order", () => {
    const fulfilment = ["PROCESSING", "PACKED", "SHIPPED", "DELIVERED"];
    for (const order of orders.filter((item) => fulfilment.includes(item.orderStatus))) {
      expect(order.paymentStatus).toBe("PAID");
    }
  });

  it("is placed by known customers after they joined", () => {
    for (const order of orders) {
      const profile = MOCK_CUSTOMER_PROFILES.find((item) => item.email === order.customerEmail);
      expect(profile).toBeDefined();
      expect(order.placedAt >= profile!.joinedAt).toBe(true);
    }
  });
});

describe("mock customers and users", () => {
  it("derives order counts and spend from the orders", () => {
    const customers = listAdminCustomers();
    expect(customers.reduce((sum, customer) => sum + customer.orderCount, 0)).toBe(
      orders.length,
    );
    const paidTotal = orders.filter(isRevenueOrder).reduce((sum, order) => sum + order.total, 0);
    expect(customers.reduce((sum, customer) => sum + customer.totalSpentBdt, 0)).toBe(paidTotal);
  });

  it("uses Bangladeshi mobile numbers and example.com emails", () => {
    for (const customer of listAdminCustomers()) {
      expect(customer.phone).toMatch(/^01[3-9]\d{8}$/);
      expect(customer.email).toMatch(/@example\.com$/);
    }
  });

  it("lists every customer as a shopper user", () => {
    const shoppers = listAdminUsers().filter((user) => user.role === "SHOPPER");
    expect(shoppers.map((user) => user.email).sort()).toEqual(
      MOCK_CUSTOMER_PROFILES.map((profile) => profile.email).sort(),
    );
  });
});

describe("summarizeOrderFinance", () => {
  const finance = summarizeOrderFinance(orders);

  it("matches a manual sum of paid orders", () => {
    const paid = orders.filter((order) => order.paymentStatus === "PAID");
    expect(finance.salesPaidOrderCount).toBe(paid.length);
    expect(finance.salesPaidBdt).toBe(paid.reduce((sum, order) => sum + order.total, 0));
  });

  it("splits revenue by month without losing any", () => {
    expect(finance.monthly.reduce((sum, row) => sum + row.revenueBdt, 0)).toBe(
      finance.salesPaidBdt,
    );
  });

  it("keeps refunds and unpaid attempts out of revenue", () => {
    const sample = summarizeOrderFinance([
      { ...orders[0], paymentStatus: "REFUNDED", orderStatus: "REFUNDED", total: 500 },
      { ...orders[0], paymentStatus: "FAILED", orderStatus: "PAYMENT_PENDING", total: 300 },
      { ...orders[0], paymentStatus: "PAID", orderStatus: "DELIVERED", total: 1000 },
    ]);
    expect(sample).toMatchObject({
      salesPaidBdt: 1000,
      refundedBdt: 500,
      unpaidBkashBdt: 300,
      averageOrderValueBdt: 1000,
    });
  });
});
