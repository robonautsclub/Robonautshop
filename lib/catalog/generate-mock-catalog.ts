import { faker } from "@faker-js/faker";

import type {
  Category,
  InventorySummary,
  Kit,
  KitComponent,
  Product,
  ProductImage,
  ProductVariant,
  ProjectComponent,
  RobotProject,
} from "@/lib/catalog/types";

/** Fixed seed so the mock catalog is stable across reloads. */
export const MOCK_CATALOG_SEED = 20260328;

type CatalogBundle = {
  categories: Category[];
  products: Product[];
  variants: ProductVariant[];
  images: ProductImage[];
  inventory: InventorySummary[];
  kits: Kit[];
  kitComponents: KitComponent[];
  projects: RobotProject[];
  projectComponents: ProjectComponent[];
};

type ProductSeed = {
  name: string;
  slug: string;
  skuPrefix: string;
  brand: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  shortDescription: string;
  specifications: Record<string, string>;
  featured?: boolean;
  variantNames?: string[];
};

const CATEGORY_SEEDS: Omit<Category, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Microcontrollers",
    slug: "microcontrollers",
    description: "Arduino, ESP32, and other boards for robot brains.",
    sortOrder: 1,
  },
  {
    name: "Sensors",
    slug: "sensors",
    description: "IR, ultrasonic, IMU, and line-following sensors.",
    sortOrder: 2,
  },
  {
    name: "Motors",
    slug: "motors",
    description: "N20 gear motors, servos, and DC motors.",
    sortOrder: 3,
  },
  {
    name: "Motor Drivers",
    slug: "motor-drivers",
    description: "L298N, TB6612, and other motor driver modules.",
    sortOrder: 4,
  },
  {
    name: "Chassis",
    slug: "chassis",
    description: "2WD and 4WD robot chassis kits.",
    sortOrder: 5,
  },
  {
    name: "Wheels",
    slug: "wheels",
    description: "Rubber wheels, omni wheels, and casters.",
    sortOrder: 6,
  },
  {
    name: "Power",
    slug: "power",
    description: "Batteries, holders, switches, and regulators.",
    sortOrder: 7,
  },
  {
    name: "Wires & Connectors",
    slug: "wires-connectors",
    description: "Jumper wires, headers, and connectors.",
    sortOrder: 8,
  },
];

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    name: "Arduino Nano V3",
    slug: "arduino-nano-v3",
    skuPrefix: "MCU-NANO",
    brand: "Arduino",
    categorySlug: "microcontrollers",
    price: 450,
    compareAtPrice: 550,
    shortDescription: "Compact ATmega328 board for compact robots.",
    specifications: {
      "Operating Voltage": "5V",
      Microcontroller: "ATmega328P",
      "Digital I/O": "14",
      "Analog Inputs": "8",
    },
    featured: true,
    variantNames: ["Original", "Compatible"],
  },
  {
    name: "Arduino Uno R3",
    slug: "arduino-uno-r3",
    skuPrefix: "MCU-UNO",
    brand: "Arduino",
    categorySlug: "microcontrollers",
    price: 750,
    shortDescription: "Classic Uno board for beginners and classrooms.",
    specifications: {
      "Operating Voltage": "5V",
      Microcontroller: "ATmega328P",
      "Digital I/O": "14",
    },
    featured: true,
  },
  {
    name: "ESP32 DevKit V1",
    slug: "esp32-devkit-v1",
    skuPrefix: "MCU-ESP32",
    brand: "Espressif",
    categorySlug: "microcontrollers",
    price: 550,
    shortDescription: "Wi-Fi and Bluetooth dual-core microcontroller.",
    specifications: {
      "Operating Voltage": "3.3V",
      "Wireless": "Wi-Fi + Bluetooth",
      Cores: "2",
    },
    featured: true,
  },
  {
    name: "5-Channel IR Sensor Array",
    slug: "ir-sensor-array-5ch",
    skuPrefix: "SEN-IR5",
    brand: "Robonaut",
    categorySlug: "sensors",
    price: 320,
    shortDescription: "Line-following IR array for LFR builds.",
    specifications: {
      Channels: "5",
      Interface: "Digital",
      "Operating Voltage": "5V",
    },
    featured: true,
  },
  {
    name: "HC-SR04 Ultrasonic Sensor",
    slug: "hc-sr04-ultrasonic",
    skuPrefix: "SEN-US04",
    brand: "Generic",
    categorySlug: "sensors",
    price: 120,
    shortDescription: "Distance sensor for obstacle-avoiding robots.",
    specifications: {
      Range: "2cm–400cm",
      Interface: "Trigger/Echo",
      "Operating Voltage": "5V",
    },
  },
  {
    name: "MPU-6050 IMU",
    slug: "mpu-6050-imu",
    skuPrefix: "SEN-MPU6050",
    brand: "InvenSense",
    categorySlug: "sensors",
    price: 280,
    shortDescription: "6-axis accelerometer and gyroscope module.",
    specifications: {
      Interface: "I2C",
      Axes: "6",
      "Operating Voltage": "3.3V–5V",
    },
  },
  {
    name: "N20 Metal Gear Motor",
    slug: "n20-metal-gear-motor",
    skuPrefix: "MOT-N20",
    brand: "Robonaut",
    categorySlug: "motors",
    price: 180,
    shortDescription: "Compact metal gear motor for mini robots.",
    specifications: {
      Voltage: "6V",
      Shaft: "3mm D-shaft",
    },
    featured: true,
    variantNames: ["100 RPM", "200 RPM", "300 RPM"],
  },
  {
    name: "SG90 Micro Servo",
    slug: "sg90-micro-servo",
    skuPrefix: "MOT-SG90",
    brand: "Tower Pro",
    categorySlug: "motors",
    price: 150,
    shortDescription: "9g servo for sensor mounts and small arms.",
    specifications: {
      Torque: "1.8 kg·cm",
      "Operating Voltage": "4.8V–6V",
    },
  },
  {
    name: "L298N Motor Driver",
    slug: "l298n-motor-driver",
    skuPrefix: "DRV-L298N",
    brand: "Generic",
    categorySlug: "motor-drivers",
    price: 220,
    shortDescription: "Dual H-bridge driver for two DC motors.",
    specifications: {
      Channels: "2",
      "Max Current": "2A per channel",
      "Logic Voltage": "5V",
    },
    featured: true,
  },
  {
    name: "TB6612FNG Motor Driver",
    slug: "tb6612fng-motor-driver",
    skuPrefix: "DRV-TB6612",
    brand: "Toshiba",
    categorySlug: "motor-drivers",
    price: 260,
    shortDescription: "Efficient dual motor driver for compact builds.",
    specifications: {
      Channels: "2",
      "Max Current": "1.2A continuous",
    },
  },
  {
    name: "2WD Acrylic Robot Chassis",
    slug: "2wd-acrylic-chassis",
    skuPrefix: "CHS-2WD",
    brand: "Robonaut",
    categorySlug: "chassis",
    price: 650,
    shortDescription: "Clear acrylic 2WD chassis with mounts.",
    specifications: {
      Drive: "2WD",
      Material: "Acrylic",
    },
    featured: true,
  },
  {
    name: "4WD Smart Robot Chassis",
    slug: "4wd-smart-chassis",
    skuPrefix: "CHS-4WD",
    brand: "Robonaut",
    categorySlug: "chassis",
    price: 950,
    shortDescription: "Four-wheel chassis for sumo and exploration bots.",
    specifications: {
      Drive: "4WD",
      Material: "Acrylic + plastic",
    },
  },
  {
    name: "65mm Robot Wheel",
    slug: "65mm-robot-wheel",
    skuPrefix: "WHL-65",
    brand: "Robonaut",
    categorySlug: "wheels",
    price: 60,
    shortDescription: "Rubber grip wheel for N20 and yellow gear motors.",
    specifications: {
      Diameter: "65mm",
      Bore: "5.5mm / D-shaft adapter",
    },
  },
  {
    name: "Omni Wheel 48mm",
    slug: "omni-wheel-48mm",
    skuPrefix: "WHL-OMNI48",
    brand: "Robonaut",
    categorySlug: "wheels",
    price: 350,
    shortDescription: "Omnidirectional wheel for holonomic robots.",
    specifications: {
      Diameter: "48mm",
      Type: "Omni",
    },
  },
  {
    name: "18650 Battery Holder 2-Cell",
    slug: "18650-holder-2cell",
    skuPrefix: "PWR-18650-2",
    brand: "Generic",
    categorySlug: "power",
    price: 80,
    shortDescription: "Series 2-cell holder with leads.",
    specifications: {
      Cells: "2",
      Configuration: "Series",
    },
  },
  {
    name: "AA Battery Holder 4-Cell",
    slug: "aa-holder-4cell",
    skuPrefix: "PWR-AA4",
    brand: "Generic",
    categorySlug: "power",
    price: 50,
    shortDescription: "4xAA holder for beginner robot kits.",
    specifications: {
      Cells: "4",
      Type: "AA",
    },
  },
  {
    name: "Mini Toggle Switch",
    slug: "mini-toggle-switch",
    skuPrefix: "PWR-SW-TGL",
    brand: "Generic",
    categorySlug: "power",
    price: 25,
    shortDescription: "Panel mount power switch for chassis.",
    specifications: {
      Type: "SPDT",
      Mount: "Panel",
    },
  },
  {
    name: "Jumper Wire Pack (Male-Male)",
    slug: "jumper-wire-mm",
    skuPrefix: "WR-JMP-MM",
    brand: "Generic",
    categorySlug: "wires-connectors",
    price: 90,
    shortDescription: "40-piece male-male Dupont jumper pack.",
    specifications: {
      Count: "40",
      Type: "Male-Male",
    },
  },
  {
    name: "Jumper Wire Pack (Male-Female)",
    slug: "jumper-wire-mf",
    skuPrefix: "WR-JMP-MF",
    brand: "Generic",
    categorySlug: "wires-connectors",
    price: 90,
    shortDescription: "40-piece male-female Dupont jumper pack.",
    specifications: {
      Count: "40",
      Type: "Male-Female",
    },
  },
  {
    name: "40-Pin Male Header Strip",
    slug: "header-male-40pin",
    skuPrefix: "WR-HDR-M40",
    brand: "Generic",
    categorySlug: "wires-connectors",
    price: 20,
    shortDescription: "Breakable 2.54mm male header strip.",
    specifications: {
      Pitch: "2.54mm",
      Pins: "40",
    },
  },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isoDaysAgo(days: number): string {
  return faker.date.recent({ days }).toISOString();
}

function buildDescription(name: string, shortDescription: string): string {
  return [
    shortDescription,
    `${name} is stocked for robotics labs, STEM clubs, and competition teams in Bangladesh.`,
    "Compatible with common hobby robot builds. Check specifications before ordering.",
  ].join(" ");
}

export function generateMockCatalog(seed = MOCK_CATALOG_SEED): CatalogBundle {
  faker.seed(seed);

  const now = new Date().toISOString();
  const categories: Category[] = CATEGORY_SEEDS.map((seedCategory) => ({
    id: faker.string.uuid(),
    ...seedCategory,
    createdAt: isoDaysAgo(60),
    updatedAt: now,
  }));

  const categoryIdBySlug = new Map(
    categories.map((category) => [category.slug, category.id]),
  );

  const products: Product[] = [];
  const variants: ProductVariant[] = [];
  const images: ProductImage[] = [];
  const inventory: InventorySummary[] = [];

  for (const seedProduct of PRODUCT_SEEDS) {
    const categoryId = categoryIdBySlug.get(seedProduct.categorySlug);
    if (!categoryId) {
      throw new Error(`Unknown category slug: ${seedProduct.categorySlug}`);
    }

    const productId = faker.string.uuid();
    const createdAt = isoDaysAgo(45);

    products.push({
      id: productId,
      name: seedProduct.name,
      slug: seedProduct.slug,
      sku: `${seedProduct.skuPrefix}-BASE`,
      description: buildDescription(
        seedProduct.name,
        seedProduct.shortDescription,
      ),
      shortDescription: seedProduct.shortDescription,
      brand: seedProduct.brand,
      categoryId,
      price: seedProduct.price,
      compareAtPrice: seedProduct.compareAtPrice ?? null,
      weightGrams: faker.number.int({ min: 5, max: 450 }),
      status: "PUBLISHED",
      featured: Boolean(seedProduct.featured),
      specifications: seedProduct.specifications,
      createdAt,
      updatedAt: now,
    });

    images.push({
      id: faker.string.uuid(),
      productId,
      url: `https://picsum.photos/seed/${seedProduct.slug}/800/800`,
      alt: `${seedProduct.name} product photo`,
      sortOrder: 0,
    });

    if (seedProduct.variantNames?.length) {
      seedProduct.variantNames.forEach((variantName, index) => {
        const variantId = faker.string.uuid();
        const variantSku = `${seedProduct.skuPrefix}-${slugify(variantName).toUpperCase()}`;
        const priceDelta = index * 20;

        variants.push({
          id: variantId,
          productId,
          name: variantName,
          sku: variantSku,
          price: seedProduct.price + priceDelta,
          sortOrder: index,
          createdAt,
          updatedAt: now,
        });

        inventory.push({
          productId,
          variantId,
          sku: variantSku,
          stockQuantity: faker.number.int({ min: 5, max: 80 }),
          reservedQuantity: faker.number.int({ min: 0, max: 3 }),
          lowStockThreshold: 5,
        });
      });
    } else {
      inventory.push({
        productId,
        variantId: null,
        sku: `${seedProduct.skuPrefix}-BASE`,
        stockQuantity: faker.number.int({ min: 8, max: 120 }),
        reservedQuantity: faker.number.int({ min: 0, max: 4 }),
        lowStockThreshold: 5,
      });
    }
  }

  const productIdBySlug = new Map(
    products.map((product) => [product.slug, product.id]),
  );

  const requireProductId = (slug: string): string => {
    const id = productIdBySlug.get(slug);
    if (!id) {
      throw new Error(`Unknown product slug: ${slug}`);
    }
    return id;
  };

  const firstVariantId = (productId: string): string | null => {
    return variants.find((variant) => variant.productId === productId)?.id ?? null;
  };

  const projects: RobotProject[] = [
    {
      id: faker.string.uuid(),
      name: "Line Following Robot",
      slug: "line-following-robot",
      description:
        "Build a classic LFR with an IR array, Nano, dual N20 motors, and a 2WD chassis. Ideal first competition robot.",
      shortDescription: "Beginner LFR with IR array and N20 motors.",
      skillLevel: "BEGINNER",
      status: "PUBLISHED",
      featured: true,
      createdAt: isoDaysAgo(30),
      updatedAt: now,
    },
    {
      id: faker.string.uuid(),
      name: "Obstacle Avoiding Robot",
      slug: "obstacle-avoiding-robot",
      description:
        "Ultrasonic-driven robot that steers around obstacles using a servo-mounted HC-SR04.",
      shortDescription: "Ultrasonic obstacle avoidance with servo mount.",
      skillLevel: "BEGINNER",
      status: "PUBLISHED",
      featured: true,
      createdAt: isoDaysAgo(28),
      updatedAt: now,
    },
    {
      id: faker.string.uuid(),
      name: "Bluetooth Controlled Robot",
      slug: "bluetooth-controlled-robot",
      description:
        "Drive a 2WD chassis from a phone over Bluetooth using an ESP32 and dual motor driver.",
      shortDescription: "ESP32 Bluetooth drive robot.",
      skillLevel: "INTERMEDIATE",
      status: "PUBLISHED",
      featured: false,
      createdAt: isoDaysAgo(20),
      updatedAt: now,
    },
    {
      id: faker.string.uuid(),
      name: "Mini Sumo Robot",
      slug: "mini-sumo-robot",
      description:
        "Compact sumo bot on a 4WD chassis with higher-torque N20 motors and edge/opponent sensing.",
      shortDescription: "Competition-oriented mini sumo platform.",
      skillLevel: "COMPETITION",
      status: "PUBLISHED",
      featured: true,
      createdAt: isoDaysAgo(15),
      updatedAt: now,
    },
  ];

  const projectIdBySlug = new Map(
    projects.map((project) => [project.slug, project.id]),
  );

  const projectComponents: ProjectComponent[] = [];

  const pushProjectComponents = (
    projectSlug: string,
    lines: Array<{
      productSlug: string;
      quantity: number;
      optional?: boolean;
      useFirstVariant?: boolean;
    }>,
  ) => {
    const projectId = projectIdBySlug.get(projectSlug);
    if (!projectId) {
      throw new Error(`Unknown project slug: ${projectSlug}`);
    }

    for (const line of lines) {
      const productId = requireProductId(line.productSlug);
      projectComponents.push({
        id: faker.string.uuid(),
        projectId,
        productId,
        variantId: line.useFirstVariant ? firstVariantId(productId) : null,
        quantity: line.quantity,
        optional: Boolean(line.optional),
      });
    }
  };

  pushProjectComponents("line-following-robot", [
    { productSlug: "arduino-nano-v3", quantity: 1, useFirstVariant: true },
    { productSlug: "ir-sensor-array-5ch", quantity: 1 },
    { productSlug: "l298n-motor-driver", quantity: 1 },
    { productSlug: "n20-metal-gear-motor", quantity: 2, useFirstVariant: true },
    { productSlug: "65mm-robot-wheel", quantity: 2 },
    { productSlug: "2wd-acrylic-chassis", quantity: 1 },
    { productSlug: "aa-holder-4cell", quantity: 1 },
    { productSlug: "mini-toggle-switch", quantity: 1 },
    { productSlug: "jumper-wire-mm", quantity: 1 },
  ]);

  pushProjectComponents("obstacle-avoiding-robot", [
    { productSlug: "arduino-uno-r3", quantity: 1 },
    { productSlug: "hc-sr04-ultrasonic", quantity: 1 },
    { productSlug: "sg90-micro-servo", quantity: 1 },
    { productSlug: "l298n-motor-driver", quantity: 1 },
    { productSlug: "n20-metal-gear-motor", quantity: 2, useFirstVariant: true },
    { productSlug: "65mm-robot-wheel", quantity: 2 },
    { productSlug: "2wd-acrylic-chassis", quantity: 1 },
    { productSlug: "aa-holder-4cell", quantity: 1 },
    { productSlug: "jumper-wire-mf", quantity: 1 },
  ]);

  pushProjectComponents("bluetooth-controlled-robot", [
    { productSlug: "esp32-devkit-v1", quantity: 1 },
    { productSlug: "tb6612fng-motor-driver", quantity: 1 },
    { productSlug: "n20-metal-gear-motor", quantity: 2, useFirstVariant: true },
    { productSlug: "65mm-robot-wheel", quantity: 2 },
    { productSlug: "2wd-acrylic-chassis", quantity: 1 },
    { productSlug: "18650-holder-2cell", quantity: 1 },
    { productSlug: "mini-toggle-switch", quantity: 1 },
    { productSlug: "jumper-wire-mm", quantity: 1 },
  ]);

  pushProjectComponents("mini-sumo-robot", [
    { productSlug: "arduino-nano-v3", quantity: 1, useFirstVariant: true },
    { productSlug: "tb6612fng-motor-driver", quantity: 1 },
    { productSlug: "n20-metal-gear-motor", quantity: 4, useFirstVariant: true },
    { productSlug: "65mm-robot-wheel", quantity: 4 },
    { productSlug: "4wd-smart-chassis", quantity: 1 },
    { productSlug: "ir-sensor-array-5ch", quantity: 1 },
    { productSlug: "18650-holder-2cell", quantity: 1 },
    { productSlug: "mpu-6050-imu", quantity: 1, optional: true },
    { productSlug: "jumper-wire-mf", quantity: 1 },
  ]);

  const kits: Kit[] = [
    {
      id: faker.string.uuid(),
      name: "LFR Starter Kit",
      slug: "lfr-starter-kit",
      description:
        "Everything needed for a beginner line-following robot, bundled at a kit price.",
      shortDescription: "Complete beginner line-following robot kit.",
      price: 2490,
      compareAtPrice: 2790,
      status: "PUBLISHED",
      projectId: projectIdBySlug.get("line-following-robot") ?? null,
      featured: true,
      createdAt: isoDaysAgo(25),
      updatedAt: now,
    },
    {
      id: faker.string.uuid(),
      name: "Obstacle Avoider Kit",
      slug: "obstacle-avoider-kit",
      description:
        "Ultrasonic obstacle-avoiding robot kit with Uno, servo mount parts list, and 2WD chassis.",
      shortDescription: "Ultrasonic obstacle-avoiding starter kit.",
      price: 2690,
      compareAtPrice: null,
      status: "PUBLISHED",
      projectId: projectIdBySlug.get("obstacle-avoiding-robot") ?? null,
      featured: true,
      createdAt: isoDaysAgo(22),
      updatedAt: now,
    },
    {
      id: faker.string.uuid(),
      name: "Mini Sumo Starter Kit",
      slug: "mini-sumo-starter-kit",
      description:
        "4WD mini sumo bundle with Nano, TB6612, and high-grip wheels.",
      shortDescription: "Competition-ready mini sumo parts kit.",
      price: 4290,
      compareAtPrice: 4590,
      status: "PUBLISHED",
      projectId: projectIdBySlug.get("mini-sumo-robot") ?? null,
      featured: false,
      createdAt: isoDaysAgo(12),
      updatedAt: now,
    },
  ];

  const kitComponents: KitComponent[] = [];

  const pushKitFromProject = (kitSlug: string, projectSlug: string) => {
    const kit = kits.find((item) => item.slug === kitSlug);
    const projectId = projectIdBySlug.get(projectSlug);
    if (!kit || !projectId) {
      throw new Error(`Cannot map kit ${kitSlug} to project ${projectSlug}`);
    }

    for (const component of projectComponents.filter(
      (line) => line.projectId === projectId && !line.optional,
    )) {
      kitComponents.push({
        id: faker.string.uuid(),
        kitId: kit.id,
        productId: component.productId,
        variantId: component.variantId,
        quantity: component.quantity,
      });
    }
  };

  pushKitFromProject("lfr-starter-kit", "line-following-robot");
  pushKitFromProject("obstacle-avoider-kit", "obstacle-avoiding-robot");
  pushKitFromProject("mini-sumo-starter-kit", "mini-sumo-robot");

  return {
    categories,
    products,
    variants,
    images,
    inventory,
    kits,
    kitComponents,
    projects,
    projectComponents,
  };
}
