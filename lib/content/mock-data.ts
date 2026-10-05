import type {
  CodeExample,
  DocPage,
  ProductDatasheet,
  RobotGuide,
  Tutorial,
} from "@/lib/content/types";

/**
 * Curated development fixture content for Phase 13 UI.
 * Not production CMS data — swap for D1 later without rewriting pages.
 */

export const tutorials: Tutorial[] = [
  {
    id: "tut-getting-started-arduino",
    slug: "getting-started-with-arduino-nano",
    title: "Getting started with Arduino Nano",
    shortDescription:
      "Install the IDE, select the board, and blink an LED on a Nano.",
    body: [
      "Install the Arduino IDE (or use Arduino Cloud Editor) and add USB drivers if your OS needs them.",
      "Connect the Nano with a data USB cable. In Tools, choose the Nano board and the correct COM/serial port.",
      "Open File → Examples → 01.Basics → Blink, then Upload. The onboard LED should blink once a second.",
      "If upload fails, try the old bootloader option or a different USB cable — charge-only cables are a common issue.",
    ],
    difficulty: "BEGINNER",
    estimatedMinutes: 20,
    relatedProductSlugs: ["arduino-nano-v3"],
    relatedProjectSlugs: ["line-following-robot"],
  },
  {
    id: "tut-ir-array",
    slug: "reading-an-ir-sensor-array",
    title: "Reading a 5-channel IR sensor array",
    shortDescription:
      "Wire a line sensor array and print digital readings over Serial.",
    body: [
      "Power the array from 5V and GND shared with your microcontroller.",
      "Connect each channel output to a digital input pin. Keep wire runs short to reduce noise.",
      "Write a small sketch that digitalRead()s each pin and prints a 5-bit pattern to Serial at 9600 baud.",
      "Calibrate on a white sheet with a black line — adjust the module potentiometer until edges are crisp.",
    ],
    difficulty: "BEGINNER",
    estimatedMinutes: 25,
    relatedProductSlugs: ["ir-sensor-array-5ch", "arduino-nano-v3"],
    relatedProjectSlugs: ["line-following-robot"],
  },
  {
    id: "tut-l298n",
    slug: "driving-motors-with-l298n",
    title: "Driving DC motors with L298N",
    shortDescription:
      "Safe wiring, enable pins, and basic forward/reverse control.",
    body: [
      "Use a separate motor supply when possible. Share GND with the logic supply.",
      "Wire IN1–IN4 to four GPIO pins and ENA/ENB to PWM-capable pins for speed control.",
      "Never power motors from the MCU 5V pin — brownouts will reset your board mid-run.",
      "Start with low PWM duty cycles on a stand so the chassis does not race across the desk.",
    ],
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 30,
    relatedProductSlugs: ["l298n-motor-driver", "n20-metal-gear-motor"],
    relatedProjectSlugs: ["line-following-robot", "obstacle-avoiding-robot"],
  },
];

export const robotGuides: RobotGuide[] = [
  {
    id: "guide-lfr",
    slug: "line-following-robot-guide",
    title: "Line Following Robot build guide",
    shortDescription:
      "Assembly order, sensor height, and a simple PID-free control loop.",
    projectSlug: "line-following-robot",
    difficulty: "BEGINNER",
    body: [
      "Assemble the chassis and mount motors so both wheels sit flat on the track.",
      "Mount the IR array 2–5 mm above the surface, centered under the front of the robot.",
      "Flash a sketch that steers left/right based on which sensors see the line.",
      "Tune speed on a practice track before competition — slower is more reliable at first.",
    ],
  },
  {
    id: "guide-obstacle",
    slug: "obstacle-avoiding-robot-guide",
    title: "Obstacle Avoiding Robot build guide",
    shortDescription:
      "Ultrasonic mounting, servo sweep, and escape maneuvers.",
    projectSlug: "obstacle-avoiding-robot",
    difficulty: "INTERMEDIATE",
    body: [
      "Mount the HC-SR04 on a servo so it can scan left and right without hitting the chassis.",
      "Keep the ultrasonic clear of motor wiring EMI — twisted power leads help.",
      "Implement a simple state machine: drive forward, stop under threshold, scan, turn toward the clearer side.",
      "Test in an open room before adding rugs or dark floors that confuse distance readings.",
    ],
  },
  {
    id: "guide-sumo",
    slug: "mini-sumo-robot-guide",
    title: "Mini Sumo Robot competition guide",
    shortDescription:
      "Weight distribution, edge detection, and push strategy notes.",
    projectSlug: "mini-sumo-robot",
    difficulty: "ADVANCED",
    body: [
      "Keep the center of gravity low and slightly forward for better pushing.",
      "Use edge sensors to reverse when you detect the white dohyo border.",
      "Start with a forward rush, then switch to search if no opponent is found quickly.",
      "Always respect event rules for size, weight, and allowed sensors.",
    ],
  },
];

export const docPages: DocPage[] = [
  {
    id: "doc-shipping",
    slug: "shipping",
    title: "Shipping in Bangladesh",
    section: "Orders",
    shortDescription: "Delivery areas, timing, and what we need on the label.",
    body: [
      "We currently ship across Bangladesh. Dhaka metro orders usually move faster than outside-Dhaka routes.",
      "Provide a reachable mobile number — couriers call before delivery.",
      "Pin your location at checkout when possible so the rider can find you without extra calls.",
      "If a package is delayed, contact support with your order ID from Account → Orders.",
    ],
  },
  {
    id: "doc-returns",
    slug: "returns-and-replacements",
    title: "Returns and replacements",
    section: "Orders",
    shortDescription: "When we can replace DOA parts and how to request help.",
    body: [
      "Unopened items in original packaging may be eligible for return within a short window — contact us before shipping anything back.",
      "Dead-on-arrival electronics: photograph the packaging and the fault, then message support with your order ID.",
      "Soldering mistakes, reverse polarity damage, and competition crashes are not covered as DOA.",
      "We cannot accept returns of cut wire packs or opened consumables.",
    ],
  },
  {
    id: "doc-payments",
    slug: "payments",
    title: "Payments (bKash, COD, and more)",
    section: "Checkout",
    shortDescription: "How payment methods work on Robonautshop.",
    body: [
      "Cash on Delivery: pay the courier when your parcel arrives. The order stays pending payment until collected.",
      "bKash Checkout: you are redirected to bKash; the order is confirmed only after payment succeeds.",
      "Never send payment to personal numbers posted outside the official checkout flow.",
      "Nagad and other gateways may appear as placeholders until they are fully wired.",
    ],
  },
  {
    id: "doc-safety",
    slug: "lab-safety",
    title: "Lab and soldering safety",
    section: "Learning",
    shortDescription: "Basic habits for school labs and home benches.",
    body: [
      "Use eye protection when soldering and keep a ventilated space.",
      "Disconnect battery packs before rewiring motors or drivers.",
      "Li-ion cells need correct holders and chargers — do not free-wire unprotected cells.",
      "Supervise beginners around hot irons, sharp tools, and spinning wheels.",
    ],
  },
];

export const productDatasheets: ProductDatasheet[] = [
  {
    id: "ds-nano",
    productSlug: "arduino-nano-v3",
    title: "Arduino Nano pinout reference",
    url: "https://docs.arduino.cc/hardware/nano/",
    fileType: "HTML",
    notes: "Official board documentation and pinout.",
  },
  {
    id: "ds-uno",
    productSlug: "arduino-uno-r3",
    title: "Arduino Uno R3 documentation",
    url: "https://docs.arduino.cc/hardware/uno-rev3/",
    fileType: "HTML",
    notes: null,
  },
  {
    id: "ds-esp32",
    productSlug: "esp32-devkit-v1",
    title: "ESP32 DevKit overview",
    url: "https://docs.espressif.com/projects/esp-idf/en/latest/esp32/hw-reference/esp32/get-started-devkitc.html",
    fileType: "HTML",
    notes: "Espressif getting-started guide.",
  },
  {
    id: "ds-l298n",
    productSlug: "l298n-motor-driver",
    title: "L298N module wiring notes",
    url: "https://www.st.com/resource/en/datasheet/l298.pdf",
    fileType: "PDF",
    notes: "ST L298 IC datasheet (module silkscreen may differ).",
  },
  {
    id: "ds-hcsr04",
    productSlug: "hc-sr04-ultrasonic",
    title: "HC-SR04 ultrasonic timing",
    url: "https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf",
    fileType: "PDF",
    notes: null,
  },
];

export const codeExamples: CodeExample[] = [
  {
    id: "code-blink-nano",
    title: "Blink onboard LED",
    language: "cpp",
    description: "Minimal sketch for Arduino Nano / Uno.",
    productSlugs: ["arduino-nano-v3", "arduino-uno-r3"],
    projectSlugs: [],
    code: `void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}`,
  },
  {
    id: "code-ir-read",
    title: "Print IR array pattern",
    language: "cpp",
    description: "Five digital channels on pins 2–6.",
    productSlugs: ["ir-sensor-array-5ch", "arduino-nano-v3"],
    projectSlugs: ["line-following-robot"],
    code: `const int irPins[5] = {2, 3, 4, 5, 6};

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 5; i++) pinMode(irPins[i], INPUT);
}

void loop() {
  for (int i = 0; i < 5; i++) {
    Serial.print(digitalRead(irPins[i]));
  }
  Serial.println();
  delay(100);
}`,
  },
  {
    id: "code-hcsr04",
    title: "HC-SR04 distance cm",
    language: "cpp",
    description: "Trig on 9, echo on 10.",
    productSlugs: ["hc-sr04-ultrasonic"],
    projectSlugs: ["obstacle-avoiding-robot"],
    code: `const int trigPin = 9;
const int echoPin = 10;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH);
  float cm = duration * 0.034 / 2;
  Serial.println(cm);
  delay(200);
}`,
  },
];
