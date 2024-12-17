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
    const [RAnswer, setRAnswer] = useState<string>("");
    

    const Questions = [
      { "question": "You have a locked box with a 3-digit code. The clue says: 'The number of sides in a triangle.'", "answer": "3", "options": ["2", "3", "4", "5"] },
  { "question": "A locked door requires a 4-letter word. Clue: 'The color of the sky on a clear day.'", "answer": "Blue", "options": ["Red", "Blue", "Green", "Yellow"] },
  { "question": "To open the chest, the clue says: 'The square of 5.'", "answer": "25", "options": ["15", "25", "35", "45"] },
  { "question": "The clue on the wall reads: 'The number of continents on Earth.'", "answer": "7", "options": ["5", "6", "7", "8"] },
  { "question": "A hidden message is revealed when you rearrange the letters in: 'ELPH'. What word do you get?", "answer": "HELP", "options": ["HELP", "LEAP", "PEAL", "PHLA"] },
  { "question": "To unlock the drawer, the clue says: 'The capital city of Japan.'", "answer": "Tokyo", "options": ["Osaka", "Kyoto", "Tokyo", "Hokkaido"] },
  { "question": "You find a map with a grid. The clue says: 'The point where the X marks the spot is 4 rows down and 6 columns across.'", "answer": "The coordinates (4,6)", "options": ["(4,5)", "(4,6)", "(3,7)", "(5,5)"] },
  { "question": "The riddle on the wall reads: 'I am always hungry, I must always be fed. The finger I touch, will soon turn red.' What am I?", "answer": "Fire", "options": ["Water", "Fire", "Air", "Earth"] },
      { "question": "To unlock the secret compartment, the clue says: 'The number of players in a football team.'", "answer": "11", "options": ["9", "10", "11", "12"] },
  { "question": "You find a code on a wall: 'The number of planets in our solar system.'", "answer": "8", "options": ["7", "8", "9", "10"] },
  { "question": "A cryptic clue says: 'I can be cracked, I can be made, I can be told, I can be played. What am I?'", "answer": "A joke", "options": ["A joke", "A puzzle", "A riddle", "A secret"] },
      {"question": "A locked chest requires a 3-digit code. Clue: 'The number of bones in the human body.'", "answer": "206", "options": ["195", "206", "220", "250"] },
       { "question": "A code says: 'The number of hours in a day minus the number of months in a year.'", "answer": "12", "options": ["9", "11", "10", "12"] },
  { "question": "A puzzle reads: 'What is full of holes but still holds a lot of weight?'", "answer": "A net", "options": ["A sponge", "A net", "A basket", "A sieve"] },
      
    ];
    

    const [currentQuestion, setCurrentQuestion] = useState<null | { question: string; answer: string; options: string[] }>(null);
    const getRandomQuestion = () => {
  const randomIndex = Math.floor(Math.random() * Questions.length);
  return Questions[randomIndex];
};
const [randomQuestion, setRandomQuestion] = useState(getRandomQuestion());
    
    
  const questionForm = useForm(
  {
    fields: [
      {
        type: 'select',
        name: 'answer',
        label: randomQuestion.question, 
        options: randomQuestion.options.map((option) => ({
              label: option,
              value: option,
          }))
        
      },
    ],
  },
    
  (values) => {
    const userAnswer = Array.isArray(values.answer) ? values.answer[0] : values.answer ?? "";

    if (userAnswer === RAnswer) { 
      setScore((score)=>score+10)
      //setQuestionMode(false);
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

        setRandomQuestion(getRandomQuestion()); 
        setRAnswer(randomQuestion.answer);
        context.ui.showToast(randomQuestion.question)// Update question after each move
    context.ui.showForm(questionForm);  
        return { x, y };
      });
    };

    const pixels = data.map((pixel, index) => {
      let bgcol="white";
      const row = Math.floor(index / resolution);
      const col = index % resolution;
      const isSprite = row === spritePosition.y && col === spritePosition.x;
      if(row==2 && col==2){
        bgcol="red"
      }
      else if(row==0 && col==0){
        bgcol="green"
      }

      return (
        <hstack
          height={`${height}px`}
          width={`${width}px`}
          backgroundColor={bgcol}
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
        <vstack
          cornerRadius="none"
          border="thin"
          height={gridSize}
          width={gridSize}
        >
          {splitArray(pixels, resolution).map((row) => (
            <hstack>{row}</hstack>
          ))}
        </vstack>
        <vstack gap="small" alignment="bottom start">
          <hstack gap="small">
            <button
              icon="up-arrow-fill"
              width="70px"
              grow
              onPress={() => moveSprite("Up")}
            >
              Up
            </button>
            <button
              icon="back-fill"
              width="78px"
              grow
              onPress={() => moveSprite("Left")}
            >
              Left
            </button>
            <vstack alignment="middle center" padding="small">
              <text size="large">Score: {score}</text>
            </vstack>
          </hstack>
          <hstack gap="small">
            <button
              icon="down-arrow-fill"
              width="75px"
              grow
              onPress={() => moveSprite("Down")}
            >
              Down
            </button>
            <button
              icon="forward-fill"
              width="75px"
              grow
              onPress={() => moveSprite("Right")}
            >
              Right
            </button>
          </hstack>
        </vstack>
      </vstack>
    );
    const InstructionsScreen = () => (
  <vstack alignment="center middle" gap="medium" height="100%">
    <text size="medium" color="#d9c3a0">Welcome to Escape Grid!</text>
    <text size="small" color="#ffffff">
       Move the sprite using the directional buttons.</text>
      <text size="small" color="#ffffff">Answer questions correctly to proceed.</text>
      <text size="small" color="#ffffff">Reach the goal (red cell) to win the game.
    </text>
    <button
      appearance="primary"
      onPress={() => setCurrentScreen("Home")}
      minWidth="35%"
    >
      Back to Home
    </button>
  </vstack>
);

    const HomeScreen = () => (
      <vstack
        gap="medium"
        alignment="center middle"
        width="100%"
        height="100%"
        backgroundColor="#232054"
      >
        <PixelText size={3} color="#d9c3a0">
          ESCAPE GRID
        </PixelText>
        <button
          size="small"
          appearance="bordered"
          onPress={() => setCurrentScreen("Instructions")}
          minWidth="35%"
        >
          Instructions
        </button>
        <button
          size="small"
          appearance="bordered"
          onPress={() => setCurrentScreen("Game")}
          minWidth="35%"
        >
          Start Game
        </button>
      </vstack>
    );

    return (
      <blocks>
        {currentScreen === "Home" && <HomeScreen />}
        {currentScreen === "Game" && <Canvas />}
        {currentScreen === "Instructions" && <InstructionsScreen />}
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
