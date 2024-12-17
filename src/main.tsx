import { Devvit, useState, useForm } from "@devvit/public-api";

const resolution = 3;
const height = 70;
const width = 70;
const blankCanvas = new Array(resolution * resolution).fill(0);
const gridSize = `${resolution * width}px`;

Devvit.configure({
  redditAPI: true,
});

Devvit.addCustomPostType({
  name: "Name",
  render: (context) => {
    const { useState } = context;
    const [currentScreen, setCurrentScreen] = useState("Home");
    const [data, setData] = useState(blankCanvas);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });
    const [score, setScore] = useState(0);
    const [isQuestionMode, setQuestionMode] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<null | { question: string; answer: string; options: string[] }>(null);

    const RedQuestions = [
      { question: "What is 2 + 2?", answer: "4", options: ['2', '4', '6', '8'] },
      { question: "What is the capital of France?", answer: "Paris", options: ['Paris', '4', '6', '8'] },
      { question: "What color is the sky on a clear day?", answer: "Blue", options: ['2', '4', 'Blue', '8']},
    ];

    const BlueQuestions = [
      { question: "What is 2 + 2?1", answer: "4", options: ['2', '4', '6', '8'] },
      { question: "What is the capital of France1?", answer: "Paris", options: ['Paris', '4', '6', '8'] },
      { question: "What color is the sky on a clear day1?", answer: "Blue", options: ['2', '4', 'Blue', '8']},
    ];

    const GreenQuestions = [
      { question: "What is 2 + 2?2", answer: "4", options: ['2', '4', '6', '8'] },
      { question: "What is the capital of France2?", answer: "Paris", options: ['Paris', '4', '6', '8'] },
      { question: "What color is the sky on a clear day2?", answer: "Blue", options: ['2', '4', 'Blue', '8']},
    ];

    const YellowQuestions = [
      { question: "What is 2 + 2?3", answer: "4", options: ['2', '4', '6', '8'] },
      { question: "What is the capital of France?3", answer: "Paris", options: ['Paris', '4', '6', '8'] },
      { question: "What color is the sky on a clear day?3", answer: "Blue", options: ['2', '4', 'Blue', '8']},
    ];

    const questionForm = useForm(
  {
    fields: [
      {
        type: 'select',
        name: 'answer',
        label: currentQuestion ? currentQuestion.question : "Question",
       options: currentQuestion 
          ? currentQuestion.options.map((option) => ({
              label: option,
              value: option,
          }))
          : [],
      },
    ],
  },
  (values) => {
    const userAnswer = Array.isArray(values.answer) ? values.answer[0] : values.answer ?? "";

    console.log(userAnswer);

    if (currentQuestion && userAnswer === currentQuestion.answer) {
      setQuestionMode(false);
      context.ui.showToast("Correct! You can now move.");
    } else {
      context.ui.showToast("Incorrect! Try again.");
    }
  }
);



    const moveSprite = (direction: "Up" | "Down" | "Left" | "Right") => {
      setSpritePosition((prev) => {
        let { x, y } = prev;

        switch (direction) {
          case "Up":
            y = Math.max(0, y - 1);
            break;
          case "Down":
            y = Math.min(resolution - 1, y + 1);
            break;
          case "Left":
            x = Math.max(0, x - 1);
            break;
          case "Right":
            x = Math.min(resolution - 1, x + 1);
            break;
        }

        const backgroundColor = getTileBackgroundColor(x, y);
        setQuestionBasedOnColor(backgroundColor);
        return { x, y };
      });
    };

    const updateTileColor = (x: number, y: number, color: string) => {
  const index = y * resolution + x;
  data[index].backgroundColor = color;
};
    const getTileBackgroundColor = (x: number, y: number) => {
  let backgroundColor = "white";
  if (x === 2 && y === 2) {
    backgroundColor = "#FF2400"; 
  } else if ((x === 2 && (y === 0 || y === 1)) || (y === 2 && (x === 0 || x === 1))) {
    backgroundColor = "#1773FE";
  } else if ((x === 1 && y === 0) || (x === 1 && y === 1) || (x === 0 && y === 1)) {
    backgroundColor = "yellow"; 
  } else if (x === 0 && y === 0) {
    backgroundColor = "green"; 
  }
  return backgroundColor;
};

    const setQuestionBasedOnColor = (color: string) => {
  let selectedQuestion = null;
      context.ui.showToast(color);
  switch (color) {
    case "#FF2400":
      // Red Question
      selectedQuestion = RedQuestions[Math.floor(Math.random() * RedQuestions.length)];
      break;
    case "#1773FE":
      // Blue Question
      selectedQuestion = BlueQuestions[Math.floor(Math.random() * BlueQuestions.length)];
      break;
    case "yellow":
      // Yellow Question
      selectedQuestion = YellowQuestions[Math.floor(Math.random() * YellowQuestions.length)];
      break;
    case "green":
      // Green Question
      selectedQuestion = GreenQuestions[Math.floor(Math.random() * GreenQuestions.length)];
      break;
  }

  if (selectedQuestion) {
    setCurrentQuestion(selectedQuestion); // Set the selected question
    setQuestionMode(true); // Activate question mode
    context.ui.showForm(questionForm); // Show the form to answer the question
  }
};


    const pixels = data.map((pixel, index) => {
      const row = Math.floor(index / resolution);
      const col = index % resolution;
      const isSprite = row === spritePosition.y && col === spritePosition.x;
      let backgroundColor = "white";

      if (row === 2 && col === 2) {
        backgroundColor = "#FF2400";
        if (isSprite) setScore((score) => score + 4);
      } else if (
        (row === 2 && (col === 0 || col === 1)) || 
        (col === 2 && (row === 0 || row === 1))
      ) {
        backgroundColor = "#1773FE";
        if (isSprite) setScore((score) => score + 3);
      } else if (
        (row === 1 && col === 0) || 
        (row === 1 && col === 1) || 
        (row === 0 && col === 1)
      ) {
        backgroundColor = "yellow";
        if (isSprite) setScore((score) => score + 2);
      } else if (row === 0 && col === 0) {
        backgroundColor = "green";
        if (isSprite) setScore((score) => score + 1);
      }


      return (
        <hstack
          height={`${height}px`}
          width={`${width}px`}
          backgroundColor={backgroundColor}
          border="thin"
          borderColor="darkgrey"
        >
          {isSprite && (
            <image
              url="bomb2.png"
              height="100%"
              width="100%"
              imageWidth={100}
              imageHeight={100}
              resizeMode="fit"
              description="Sprite Icon"
            />
          )}
        </hstack>
      );
    });

  
    const splitArray = <T,>(array: T[], segmentLength: number): T[][] => {
      const result: T[][] = [];
      for (let i = 0; i < array.length; i += segmentLength) {
        result.push(array.slice(i, i + segmentLength));
      }
      return result;
    };

    

    

    const Canvas = () => (
      
      <vstack gap="small" width="100%" height="100%" alignment="center middle">
        <vstack cornerRadius="none" border="thin" height={gridSize} width={gridSize}>
          {splitArray(pixels, resolution).map((row) => (
            <hstack>{row}</hstack>
          ))}
        </vstack>
        <vstack gap="small" alignment="bottom start">
          <hstack gap="small">
            <button icon="up-arrow-fill" width="70px" grow onPress={() => moveSprite("Up")}>
              Up
            </button>
            <button icon="back-fill" width="78px" grow onPress={() => moveSprite("Left")}>
              Left
            </button>
            <vstack alignment="middle center" padding="small">
              <text size="large">Score: {score}</text>
            </vstack>
          </hstack>
          <hstack gap="small">
            <button icon="down-arrow-fill" width="75px" grow onPress={() => moveSprite("Down")}>
              Down
            </button>
            <button icon="forward-fill" width="75px" grow onPress={() => moveSprite("Right")}>
              Right
            </button>
          </hstack>
        </vstack>
      </vstack>
    );

    const HomeScreen = () => (
      <vstack gap="medium" alignment="center middle" width="100%" height="100%" backgroundColor="#232054">
        <PixelText size={3} color="#d9c3a0">ESCAPE GRID</PixelText>
        <spacer></spacer>
        <button size="small" appearance="bordered" onPress={() => setCurrentScreen("Instructions")} minWidth="35%" >
              Instructions
            </button>
            <button size="small" appearance="bordered" onPress={() => setCurrentScreen("Game") } minWidth="35%">
              Start Game
            </button>
      </vstack>
    );

    return (
      <blocks>
        {currentScreen === "Home" && <HomeScreen />}
        {currentScreen === "Game" && <Canvas />}
      </blocks>
    );
  },
});


type SupportedGlyphs = keyof typeof Glyphs;

type Glyph = {
  path: string;
  width: number;
  height: number;
};

interface PixelTextProps {
  children: string;
  size?: number;
  color?: string;
}

export function PixelText(props: PixelTextProps): JSX.Element {
  const { children, size = 2, color = 'white' } = props;
  const line = children[0].split('');
  const gap = 1;
  const height = Glyphs['A'].height;
  let width = 0;
  let xOffset = 0;

  const characters: string[] = [];

  line.forEach((character) => {
    if (character === ' ') {
      xOffset += 6 + gap;
      return;
    }

    const glyph: Glyph = Glyphs[character as SupportedGlyphs];
    if (!glyph) {
      return;
    }
    characters.push(`<path
      d="${glyph.path}"
      transform="translate(${xOffset} 0)"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />`);

    xOffset += glyph.width + gap;
    width = xOffset;
  });

  width -= gap;

  const scaledHeight: Devvit.Blocks.SizeString = `${height * size}px`;
  const scaledWidth: Devvit.Blocks.SizeString = `${width * size}px`;

  return (
    <image
      imageHeight={height}
      imageWidth={width}
      height={scaledHeight}
      width={scaledWidth}
      description={children[0]}
      resizeMode="fill"
      url={`data:image/svg+xml;charset=UTF-8,
        <svg
            width="${width}"
            height="${height}"
            viewBox="0 0 ${width} ${height}"
            fill="${color}"
            xmlns="http://www.w3.org/2000/svg"
        >
        ${characters.join('')}
        </svg>
      `}
    />
  );
}


const Glyphs = {
  "A": {
    "path": "M2 0H4V1H5V2H6V6H4V5H2V6H0V2H1V1H2V0ZM2 2V4H4V2H2Z",
    "width": 6,
    "height": 7
  },
  "B": {
    "path": "M5 0H0V6H5V5H6V3H5V2H6V1H5V0ZM4 3H2V5H4V3ZM2 2V1H4V2H2Z",
    "width": 6,
    "height": 7
  },
  "C": {
    "path": "M1 0H5V1H6V2H4V1H2V5H4V4H6V5H5V6H1V5H0V1H1V0Z",
    "width": 6,
    "height": 7
  },
  "D": {
    "path": "M4 0H0V6H4V5H5V4H6V2H5V1H4V0ZM4 2H3V1H2V5H3V4H4V2Z",
    "width": 6,
    "height": 7
  },
  "E": {
    "path": "M6 0H0V6H6V5H2V3H5V2H2V1H6V0Z",
    "width": 6,
    "height": 7
  },
  "F": {
    "path": "M0 0H6V1H2V2H5V3H2V6H0V0Z",
    "width": 6,
    "height": 7
  },
  "G": {
    "path": "M1 0H6V1H2V5H4V4H3V3H6V6H1V5H0V1H1V0Z",
    "width": 6,
    "height": 7
  },
  "H": {
    "path": "M0 0H2V2H4V0H6V6H4V3H2V6H0V0Z",
    "width": 6,
    "height": 7
  },
  "I": {
    "path": "M0 0H6V1H4V5H6V6H0V5H2V1H0V0Z",
    "width": 6,
    "height": 7
  },
  "J": {
    "path": "M6 0H4V5H2V4H0V5H1V6H5V5H6V0Z",
    "width": 6,
    "height": 7
  },
  "K": {
    "path": "M2 0H0V6H2V4H3V5H4V6H6V5H5V4H4V2H5V1H6V0H4V1H3V2H2V0Z",
    "width": 6,
    "height": 7
  },
  "L": {
    "path": "M2 0H0V6H6V5H2V0Z",
    "width": 6,
    "height": 7
  },
  "M": {
    "path": "M0 0H2V1H3V2H4V1H5V0H7V6H5V3H4V4H3V3H2V6H0V0Z",
    "width": 7,
    "height": 7
  },
  "N": {
    "path": "M0 0H2V1H3V2H4V0H6V6H4V5H3V4H2V6H0V0Z",
    "width": 6,
    "height": 7
  },
  "O": {
    "path": "M5 0H1V1H0V5H1V6H5V5H6V1H5V0ZM4 1H2V5H4V1Z",
    "width": 6,
    "height": 7
  },
  "P": {
    "path": "M0 0V6H2V4H5V3H6V1H5V0H0ZM2 1V3H4V1H2Z",
    "width": 6,
    "height": 7
  },
  "Q": {
    "path": "M5 0H1V1H0V5H1V6H3V5H4V6H6V5H5V4H6V1H5V0ZM4 1H2V5H3V4H4V1Z",
    "width": 6,
    "height": 7
  },
  "R": {
    "path": "M0 0V6H2V4H3V5H4V6H6V5H5V3H6V1H5V0H0ZM4 1H2V3H4V1Z",
    "width": 6,
    "height": 7
  },
  "S": {
    "path": "M1 0H5V1H2V2H5V3H6V5H5V6H1V5H4V3H1V2H0V1H1V0Z",
    "width": 6,
    "height": 7
  },
  "T": {
    "path": "M6 0H0V1H2V6H4V1H6V0Z",
    "width": 6,
    "height": 7
  },
  "U": {
    "path": "M0 0H2V5H4V0H6V6H0V0Z",
    "width": 6,
    "height": 7
  },
  "V": {
    "path": "M2 0H0V4H1V5H2V6H4V5H5V4H6V0H4V4H2V0Z",
    "width": 6,
    "height": 7
  },
  "W": {
    "path": "M0 0H2V3H3V2H4V3H5V0H7V6H5V5H4V4H3V5H2V6H0V0Z",
    "width": 7,
    "height": 7
  },
  "X": {
    "path": "M0 0H2V2H4V0H6V2H5V4H6V6H4V4H2V6H0V4H1V2H0V0Z",
    "width": 6,
    "height": 7
  },
  "Y": {
    "path": "M2 0H0V2H1V3H2V6H4V3H5V2H6V0H4V2H2V0Z",
    "width": 6,
    "height": 7
  },
  "Z": {
    "path": "M6 0H0V1H3V2H2V3H1V4H0V6H6V5H2V4H3V3H4V2H5V1H6V0Z",
    "width": 6,
    "height": 7
  }
}

export default Devvit
