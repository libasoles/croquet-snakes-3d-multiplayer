const Q = Croquet.Constants;

Q.sceneBoundaries = {
  FORWARD: -22,
  BACKWARD: 28,
  LEFT: -20,
  RIGHT: 25,
};

Q.colors = [
  "#ff9fe5",
  "#75485e",
  "#7192be",
  "#70ee9c",
  "#d4aa7d",
  "#ef6f6c",
  "#edae49",
  "#087ca7",
  "#3c5a14",
  "#5b8c5a",
  "orange",
];

Q.messages = {
  go: "Go! Eat the apples",
  eat: [
    "Yum!",
    "Delicious!",
    "That was a nice one!",
    "Lovely bite",
    "Ñam!",
    "I'd like some more!",
    "Tasty!",
    "Feels goood",
    "Give me more",
    "Sweet",
    "Mhhh, get some more!",
    "Oh, do I like this",
    "❤️ I love apples ❤️",
  ],
  collision: "* Ouch!",
};

Q.tick = 1000 / 30;
Q.speed = 0.5;
Q.unit = 0.5;

Q.appleDropTime = 1000 * 14;

export default Q;
