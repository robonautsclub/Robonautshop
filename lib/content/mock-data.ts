import type {
  CodeExample,
  DocPage,
  ProductDatasheet,
  RobotGuide,
  Tutorial,
} from "@/lib/content/types";

/**
 * Curated development fixture content for Phase 13 UI, made realistic in
 * tasks/phase-18-hardening/117. Not production CMS data — swap for D1 later
 * without rewriting pages.
 *
 * Every product/project slug referenced here must exist in the mock catalog
 * (lib/catalog/generate-mock-catalog.ts) — lib/content/mock-data.test.ts
 * checks it.
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
  {
    id: "tut-tb6612fng",
    slug: "tb6612fng-vs-l298n",
    title: "Switching from L298N to TB6612FNG",
    shortDescription:
      "Why the TB6612FNG runs cooler and faster on small N20 robots, and how to rewire.",
    body: [
      "The L298N drops around 2 V across its bipolar transistors, so a 7.4 V pack delivers barely 5 V to the motors. The TB6612FNG uses MOSFETs and loses only a fraction of a volt.",
      "Wire VM to the motor battery, VCC to the 5 V logic rail, and tie STBY high (or to a GPIO if you want a software kill switch).",
      "Each channel needs two direction pins (AIN1/AIN2) and one PWM pin (PWMA). On a Nano, use D5/D6/D9/D10 for PWM.",
      "Keep each motor under 1.2 A continuous. N20 motors are well within that; large yellow TT motors under stall can exceed it.",
    ],
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 25,
    relatedProductSlugs: ["tb6612fng-motor-driver", "n20-metal-gear-motor", "arduino-nano-v3"],
    relatedProjectSlugs: ["line-following-robot", "mini-sumo-robot"],
  },
  {
    id: "tut-servo-sweep",
    slug: "sweeping-a-servo-with-arduino",
    title: "Sweeping an SG90 servo for a scanning sensor",
    shortDescription:
      "Mount an ultrasonic sensor on an SG90 and sweep it left, centre, and right.",
    body: [
      "Power the SG90 from a separate 5 V supply when possible — servo current spikes can reset the Arduino.",
      "Connect the orange signal wire to D3, red to 5 V, brown to GND, and share GND with the board.",
      "Use the Servo library: attach the pin, then write 30°, 90°, and 150° with a short delay so the sensor settles before each reading.",
      "Glue or screw the HC-SR04 bracket to the horn only after centring the servo at 90°.",
    ],
    difficulty: "BEGINNER",
    estimatedMinutes: 20,
    relatedProductSlugs: ["sg90-micro-servo", "hc-sr04-ultrasonic", "arduino-uno-r3"],
    relatedProjectSlugs: ["obstacle-avoiding-robot"],
  },
  {
    id: "tut-mpu6050",
    slug: "reading-mpu-6050-angles",
    title: "Reading tilt from an MPU-6050",
    shortDescription:
      "I²C wiring, raw accelerometer/gyro data, and a simple complementary filter.",
    body: [
      "Connect VCC to 5 V (the module has a regulator), GND to GND, SDA to A4 and SCL to A5 on Uno/Nano, or GPIO21/22 on ESP32.",
      "Run an I²C scanner first — the MPU-6050 should answer at address 0x68 (0x69 if AD0 is pulled high).",
      "Accelerometer angles are noisy but don't drift; gyro angles are smooth but drift. Blend them: angle = 0.98 × (angle + gyro × dt) + 0.02 × accelAngle.",
      "Keep the sensor rigidly mounted — a loose module on foam tape adds vibration that looks like motion.",
    ],
    difficulty: "ADVANCED",
    estimatedMinutes: 40,
    relatedProductSlugs: ["mpu-6050-imu", "arduino-nano-v3", "esp32-devkit-v1"],
    relatedProjectSlugs: ["mini-sumo-robot"],
  },
  {
    id: "tut-esp32-bluetooth",
    slug: "esp32-bluetooth-robot-control",
    title: "Controlling a robot over ESP32 Bluetooth",
    shortDescription:
      "Use the ESP32's built-in Bluetooth Classic with a phone app to drive two motors.",
    body: [
      "The ESP32 has Bluetooth built in, so no HC-05 module is needed. Install the ESP32 board package and select 'ESP32 Dev Module'.",
      "Use BluetoothSerial to advertise a name like 'Robonaut-01', then pair from any Bluetooth serial controller app on Android.",
      "Map single-character commands — F, B, L, R, S — to motor driver pin states. Always default to stop when the connection drops.",
      "ESP32 GPIOs are 3.3 V: the TB6612FNG accepts 3.3 V logic directly; the L298N usually does too, but check your module.",
    ],
    difficulty: "INTERMEDIATE",
    estimatedMinutes: 35,
    relatedProductSlugs: ["esp32-devkit-v1", "tb6612fng-motor-driver", "2wd-acrylic-chassis"],
    relatedProjectSlugs: ["bluetooth-controlled-robot"],
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
  {
    id: "guide-bluetooth",
    slug: "bluetooth-controlled-robot-guide",
    title: "Bluetooth Controlled Robot build guide",
    shortDescription:
      "An ESP32-based 2WD robot you drive from your phone — the easiest first robot.",
    projectSlug: "bluetooth-controlled-robot",
    difficulty: "BEGINNER",
    body: [
      "Bolt the two N20 motors and the caster to the 2WD acrylic chassis before mounting any electronics.",
      "Place the ESP32 and TB6612FNG on a half-size breadboard on top; keep motor wires on one side and logic on the other.",
      "Power the motors from the 2-cell 18650 holder through the mini toggle switch, and feed the ESP32 from a 5 V regulator or USB power bank.",
      "Flash the Bluetooth sketch, pair your phone, and test each direction with the wheels off the ground first.",
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
      "We currently ship across Bangladesh. Delivery is ৳80 inside Dhaka metro and ৳130 outside Dhaka, shown at checkout before you pay.",
      "Dhaka orders usually arrive in 1–2 working days; outside Dhaka typically takes 2–4 working days.",
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
    title: "Payments (bKash)",
    section: "Checkout",
    shortDescription: "How payment works on Robonautsshop.",
    body: [
      "bKash is currently the only payment method. At checkout you are redirected to bKash; the order is confirmed only after payment succeeds.",
      "If the payment fails or you cancel it, the order stays under Account → Orders with a 'Pay again with bKash' button. Unpaid orders do not hold stock, so items can sell out meanwhile.",
      "Your bKash transaction ID appears on the order page once payment is confirmed — quote it if you contact support.",
      "Never send payment to personal numbers posted outside the official checkout flow.",
    ],
  },
  {
    id: "doc-order-status",
    slug: "order-status",
    title: "Understanding your order status",
    section: "Orders",
    shortDescription: "What Paid, Processing, Packed, Shipped, and Delivered mean.",
    body: [
      "Paid — bKash confirmed your payment. Processing — we are picking your parts. Packed — your parcel is sealed and waiting for pickup.",
      "Shipped — the parcel has left our store; the courier will call the number on your order. Delivered — it reached you.",
      "Order status and payment status are shown separately on Account → Orders, so a refunded order will show both.",
      "Orders can be cancelled before they ship. Contact support with your order ID; paid orders are refunded to the same bKash account.",
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
    notes: "Range 2–400 cm, 15° measuring angle, 10 µs trigger pulse.",
  },
  {
    id: "ds-tb6612fng",
    productSlug: "tb6612fng-motor-driver",
    title: "TB6612FNG dual motor driver datasheet",
    url: "https://cdn.sparkfun.com/datasheets/Robotics/TB6612FNG.pdf",
    fileType: "PDF",
    notes: "VM 2.5–13.5 V, 1.2 A continuous / 3.2 A peak per channel.",
  },
  {
    id: "ds-mpu6050",
    productSlug: "mpu-6050-imu",
    title: "MPU-6000/MPU-6050 product specification",
    url: "https://invensense.tdk.com/wp-content/uploads/2015/02/MPU-6000-Datasheet1.pdf",
    fileType: "PDF",
    notes: "3-axis gyro + 3-axis accelerometer, I²C address 0x68/0x69.",
  },
  {
    id: "ds-sg90",
    productSlug: "sg90-micro-servo",
    title: "SG90 micro servo specifications",
    url: "http://www.towerpro.com.tw/product/sg90-7/",
    fileType: "LINK",
    notes: "4.8–6 V, about 1.8 kg·cm stall torque, 50 Hz PWM (1–2 ms pulse).",
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
  {
    id: "code-l298n-forward-reverse",
    title: "L298N forward, reverse, and stop",
    language: "cpp",
    description: "One motor on ENA (D5, PWM), IN1 (D7), IN2 (D8).",
    productSlugs: ["l298n-motor-driver", "n20-metal-gear-motor", "arduino-uno-r3"],
    projectSlugs: ["obstacle-avoiding-robot"],
    code: `const int ENA = 5;
const int IN1 = 7;
const int IN2 = 8;

void drive(int speed) {
  // speed: -255 (full reverse) .. 255 (full forward)
  digitalWrite(IN1, speed > 0);
  digitalWrite(IN2, speed < 0);
  analogWrite(ENA, abs(speed));
}

void setup() {
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
}

void loop() {
  drive(180);   // forward
  delay(1500);
  drive(0);     // stop
  delay(500);
  drive(-180);  // reverse
  delay(1500);
  drive(0);
  delay(1000);
}`,
  },
  {
    id: "code-lfr-basic",
    title: "Basic line follower (5-channel array + TB6612FNG)",
    language: "cpp",
    description:
      "Weighted line position steering — no PID yet. Black line on white reads as 1.",
    productSlugs: ["ir-sensor-array-5ch", "tb6612fng-motor-driver", "arduino-nano-v3"],
    projectSlugs: ["line-following-robot"],
    code: `const int irPins[5] = {A0, A1, A2, A3, A4};
const int weights[5] = {-2, -1, 0, 1, 2};

const int PWMA = 5, AIN1 = 7, AIN2 = 8;   // left motor
const int PWMB = 6, BIN1 = 9, BIN2 = 10;  // right motor
const int STBY = 4;
const int BASE_SPEED = 140;

void setMotor(int pwm, int in1, int in2, int speed) {
  speed = constrain(speed, -255, 255);
  digitalWrite(in1, speed > 0);
  digitalWrite(in2, speed < 0);
  analogWrite(pwm, abs(speed));
}

const int motorPins[7] = {PWMA, AIN1, AIN2, PWMB, BIN1, BIN2, STBY};

void setup() {
  for (int i = 0; i < 7; i++) pinMode(motorPins[i], OUTPUT);
  for (int i = 0; i < 5; i++) pinMode(irPins[i], INPUT);
  digitalWrite(STBY, HIGH);
}

void loop() {
  int sum = 0, seen = 0;
  for (int i = 0; i < 5; i++) {
    if (digitalRead(irPins[i])) {
      sum += weights[i];
      seen++;
    }
  }

  if (seen == 0) {  // line lost: stop rather than run off the table
    setMotor(PWMA, AIN1, AIN2, 0);
    setMotor(PWMB, BIN1, BIN2, 0);
    return;
  }

  int turn = (sum * 60) / seen;
  setMotor(PWMA, AIN1, AIN2, BASE_SPEED + turn);
  setMotor(PWMB, BIN1, BIN2, BASE_SPEED - turn);
}`,
  },
  {
    id: "code-servo-scan",
    title: "Servo scan with HC-SR04",
    language: "cpp",
    description: "Look left, centre, and right; print the clearest direction.",
    productSlugs: ["sg90-micro-servo", "hc-sr04-ultrasonic"],
    projectSlugs: ["obstacle-avoiding-robot"],
    code: `#include <Servo.h>

Servo scanner;
const int trigPin = 9;
const int echoPin = 10;

float readCm() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duration = pulseIn(echoPin, HIGH, 30000);  // 30 ms timeout ≈ 5 m
  return duration == 0 ? 400 : duration * 0.034 / 2;
}

float lookAt(int angle) {
  scanner.write(angle);
  delay(250);  // let the servo settle before measuring
  return readCm();
}

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  scanner.attach(3);
}

void loop() {
  float left = lookAt(150);
  float centre = lookAt(90);
  float right = lookAt(30);

  if (centre > 25) Serial.println("forward");
  else if (left > right) Serial.println("turn left");
  else Serial.println("turn right");
}`,
  },
  {
    id: "code-esp32-bt-drive",
    title: "ESP32 Bluetooth drive commands",
    language: "cpp",
    description: "F/B/L/R/S from a phone Bluetooth serial app; stops if nothing arrives for 1 s.",
    productSlugs: ["esp32-devkit-v1", "tb6612fng-motor-driver"],
    projectSlugs: ["bluetooth-controlled-robot"],
    code: `#include <BluetoothSerial.h>

BluetoothSerial bt;
const int AIN1 = 25, AIN2 = 26, PWMA = 27;
const int BIN1 = 14, BIN2 = 12, PWMB = 13;
const int STBY = 33;
unsigned long lastCommandAt = 0;

void motor(int in1, int in2, int pwm, int speed) {
  digitalWrite(in1, speed > 0);
  digitalWrite(in2, speed < 0);
  analogWrite(pwm, abs(speed));
}

void drive(int left, int right) {
  motor(AIN1, AIN2, PWMA, left);
  motor(BIN1, BIN2, PWMB, right);
}

void setup() {
  for (int pin : {AIN1, AIN2, PWMA, BIN1, BIN2, PWMB, STBY}) pinMode(pin, OUTPUT);
  digitalWrite(STBY, HIGH);
  bt.begin("Robonaut-01");
}

void loop() {
  if (bt.available()) {
    lastCommandAt = millis();
    switch (bt.read()) {
      case 'F': drive(200, 200); break;
      case 'B': drive(-200, -200); break;
      case 'L': drive(-150, 150); break;
      case 'R': drive(150, -150); break;
      default:  drive(0, 0);
    }
  }
  if (millis() - lastCommandAt > 1000) drive(0, 0);  // connection lost: stop
}`,
  },
];
