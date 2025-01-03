import { Devvit, useState, useForm } from "@devvit/public-api";

const resolution = 3;
const height = 64;
const width = 64;
const blankCanvas = new Array(resolution * resolution).fill(0);
const gridSize = `${resolution * width}px`;

Devvit.configure({
  redditAPI: true,
  redis : true
});



Devvit.addMenuItem({
  label: 'Add my post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Submitting your post - upon completion you'll navigate there.");

    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'My devvit post',
      subredditName: subreddit.name,
   
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.navigateTo(post);
  },
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
    const [topPlayers, setTopPlayers] = useState<{ name: string; score: number }[]>([]);
    const [username, setUsername] = useState("");
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [blackCells, setBlackCells] = useState<{ x: number; y: number }[]>([]);

    const Questions = [
      { "question": "The number of sides in a triangle?", "answer": "3", "options": ["2", "3", "4", "5"] },
  { "question": "The color of the sky on a clear day?", "answer": "Blue", "options": ["Red", "Blue", "Green", "Yellow"] },
  { "question": "The square of 5?", "answer": "25", "options": ["15", "25", "35", "45"] },
  { "question": "The number of continents on Earth?", "answer": "7", "options": ["5", "6", "7", "8"] },
  { "question": "hidden message , when you rearrange the letters in: 'ELPH'. What word do you get?", "answer": "HELP", "options": ["HELP", "LEAP", "PEAL", "PHLA"] },
  { "question": "The capital city of Japan?", "answer": "Tokyo", "options": ["Osaka", "Kyoto", "Tokyo", "Hokkaido"] },
  { "question": "The point where the X marks the spot is 4 rows down and 6 columns across?", "answer": "The coordinates (4,6)", "options": ["(4,5)", "(4,6)", "(3,7)", "(5,5)"] },
  { "question": "'I am always hungry, I must always be fed. The finger I touch, will soon turn red.' What am I?", "answer": "Fire", "options": ["Water", "Fire", "Air", "Earth"] },
      { "question": "The number of players in a football team?", "answer": "11", "options": ["9", "10", "11", "12"] },
  { "question": "The number of planets in our solar system?", "answer": "8", "options": ["7", "8", "9", "10"] },
  { "question": "A cryptic clue says: 'I can be cracked, I can be made, I can be told, I can be played. What am I?'", "answer": "A joke", "options": ["A joke", "A puzzle", "A riddle", "A secret"] },
      {"question": "The number of bones in the human body?", "answer": "206", "options": ["195", "206", "220", "250"] },
       { "question": "The number of hours in a day minus the number of months in a year?", "answer": "12", "options": ["9", "11", "10", "12"] },
  { "question": "What is full of holes but still holds a lot of weight?", "answer": "A net", "options": ["A sponge", "A net", "A basket", "A sieve"] },
      
    ];
    
    

    const [currentQuestion, setCurrentQuestion] = useState<null | { question: string; answer: string; options: string[] }>(null);

    type Question = {
  question: string;          
  options: string[];         
  answer: string;            
};
    
    const [usedQuestions, setUsedQuestions] = useState<Question[]>([]); 
const [remainingQuestions, setRemainingQuestions] = useState<Question[]>(Questions);
    
    
const getRandomQuestion = (): Question => {
  
  const availableQuestions = remainingQuestions.filter(
    (q) => !usedQuestions.includes(q)
  );

  if (availableQuestions.length === 0) {
    context.ui.showToast("No more questions available!");
    return { question: "No questions left!", options: [], answer: "" }; 
  }

  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const newQuestion = availableQuestions[randomIndex];

  return newQuestion;
};

const [randomQuestion, setRandomQuestion] = useState(getRandomQuestion());

    const resetGame = () => {
      setSpritePosition({ x: 0, y: 0 });
      setScore(0);
      setCurrentScreen("Home");
      setBlackCells([]); 
      setUsedQuestions([]); 
      setRemainingQuestions(Questions); 
    };

const usernameForm = useForm(
      {
        fields: [
          {
            type: 'string',
            name: 'username',
            label: 'Enter Your Username',
            validation: {
              required: true,
              minLength: 2,
              maxLength: 20
            }
          }
        ]
      },
      (values) => {
        const submittedUsername = values.username;
        if (submittedUsername) {
          setUsername(submittedUsername);
          submitScore(submittedUsername);
        }
      }
    );
    
    
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
      context.ui.showToast("Correct! You can now move.");
      setBlackCells((prev) => [...prev, { x: spritePosition.x, y: spritePosition.y }]);
    } else {
      context.ui.showToast("Incorrect! Try again.");
    
    }
    setUsedQuestions((prev) => [...prev, randomQuestion]);
    setRemainingQuestions((prev) =>
      prev.filter((q) => q.question !== randomQuestion.question)
    );
  }
);



    const simpleReadWriteExample = async () => {
      try {
         await context.redis.set('score', `${score}`);
      } catch (error) {
        console.error('Error interacting with Redis:', error);
      }
    };

    const storeScore = async (username: string, score: number) => {
      const currentLeaderboardKey = "Leaderboard";
      try {
        const leaderboard = await context.redis.get(currentLeaderboardKey);
        const players: { name: string; score: number }[] = leaderboard ? JSON.parse(leaderboard) : [];
        players.push({ name: username, score });
        players.sort((a, b) => b.score - a.score);  
        await context.redis.set(currentLeaderboardKey, JSON.stringify(players));
        setTopPlayers(players.slice(0, 5));
      } catch (error) {
        context.ui.showToast('Error storing score:');
      }
    };
    
    const getTopPlayers = async () => {
      setLoadingLeaderboard(true);
      try {
        const leaderboard = await context.redis.get("Leaderboard");
        const players = leaderboard ? JSON.parse(leaderboard) : [];
        setTopPlayers(players.slice(0, 5)); 
      } catch (error) {
        context.ui.showToast("Error fetching leaderboard:");
        setTopPlayers([]); 
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    
      const submitScore = async (submittedUsername?: string) => {
      const usernameToUse = submittedUsername || username;
      if (usernameToUse && score > 0) {
        await storeScore(usernameToUse, score);
        context.ui.showToast("Score submitted!");
        await context.redis.set('score', `${score}`);
        setCurrentScreen("Leaderboard");
      } else {
        context.ui.showToast("Please enter a username and score before submitting.");
      }
    };



    const moveSprite = (direction: "Up" | "Down" | "Left" | "Right") => {
      setSpritePosition((prev) => {
    let { x, y } = prev;
    if (x === 2 && y === 2) {
      return { x, y }; 
    }
   
    const newPosition = { x, y };
    switch (direction) {
      case "Up":
        newPosition.y = Math.max(0, y - 1);
        break;
      case "Down":
        newPosition.y = Math.min(resolution - 1, y + 1);
        break;
      case "Left":
        newPosition.x = Math.max(0, x - 1);
        break;
      case "Right":
        newPosition.x = Math.min(resolution - 1, x + 1);
        break;
    }


    const isBlackCell = blackCells.some(
      (cell) => cell.x === newPosition.x && cell.y === newPosition.y
    );

    if (isBlackCell) {
      context.ui.showToast("You can't enter a green cell!");
      return prev; 
    }
        if (newPosition.x === 2 && newPosition.y === 2) {
      context.ui.showToast("Yay!! You have reached the final cube!!");
      context.ui.showForm(usernameForm);
      return newPosition;
    }

    setRandomQuestion(getRandomQuestion());
    setRAnswer(randomQuestion.answer);
    context.ui.showForm(questionForm);

     


        if (x === 2 && y === 2) {
          context.ui.showToast("Yay!! You have reached the final cube!!");
          context.ui.showForm(usernameForm);
        } else {
          setRandomQuestion(getRandomQuestion()); 
          setRAnswer(randomQuestion.answer);
          context.ui.showForm(questionForm);
        }
        
        return newPosition;
      });
    };

    const pixels = data.map((pixel, index) => {
  let bgcol = "white";
  const row = Math.floor(index / resolution);
  const col = index % resolution;
  const isSprite = row === spritePosition.y && col === spritePosition.x;


  const isBlack = blackCells.some((cell) => cell.x === col && cell.y === row);
  if (isBlack) {
    bgcol = "green";
  } else if (row === 2 && col === 2) {
    bgcol = "red";
  } else if (row === 0 && col === 0) {
    bgcol = "white";
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
          url="char1.png"
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
      <vstack gap="small" width="100%" height="100%" alignment="center middle" backgroundColor="#232054">
        <hstack alignment="top start" gap="medium" width="60%"> 
          <button
              size="small"
              appearance="bordered"
              onPress={() => {
                setCurrentScreen("Home");
                resetGame();
              }}
            >
              Home
            </button>
          <text size="large" color="#d9c3a0" alignment="end top">Score: {score}</text>
        </hstack>
        
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
        <vstack gap="small" alignment="middle center">
          <hstack gap="small">
            <button
          size="small"
          appearance="bordered"
          icon="up-arrow-fill"
          width="70px"
          grow
          onPress={() => moveSprite("Up")}>Up
            </button>
          </hstack>
          <hstack gap="small">
            <button
          size="small"
          appearance="bordered"
          icon="back-fill"
          width="70px"
          grow
          onPress={() => moveSprite("Left")}>Left
            </button>
             <button
          size="small"
          appearance="bordered"
          icon="down-arrow-fill"
          width="70px"
          grow
          onPress={() => moveSprite("Down")}>Down
            </button>
            
            <button
          size="small"
          appearance="bordered"
          icon="forward-fill"
          width="70px"
          grow
          onPress={() => moveSprite("Right")}>Right
            </button>
            
          </hstack>
        </vstack>
      </vstack>
    );
    const InstructionsScreen = () => (
  <vstack alignment="center middle" gap="medium" height="100%" backgroundColor="#232054">
    <PixelText size={1.7} color="#d9c3a0">
          WELCOME TO ANVESHAM
        </PixelText>
    <text size="small" color="#ffffff">
       Move the sprite using the directional buttons.</text>
      <text size="small" color="#ffffff">Answer questions correctly to proceed.</text>
      <text size="small" color="#ffffff">Reach the goal (red cell) to win the game.</text>
      <text size="small" color="#ffffff">More the number of correct answers ,
    </text>
    <text size="small" color="#ffffff">more the points !!
    </text>
    <button
          size="small"
          appearance="bordered"
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
          ANVESHAM
        </PixelText>
        <button
          size="medium"
          appearance="bordered"
          onPress={() => setCurrentScreen("Instructions")}
          minWidth="35%"
        >
          Instructions
        </button>
        <button
          size="medium"
          appearance="bordered"
          onPress={() => setCurrentScreen("Game")}
          minWidth="35%"
        >
          Start Game
        </button>
      <button
      size="medium"
      appearance="bordered"
      onPress={async () => {
        await getTopPlayers();
        setCurrentScreen("Leaderboard");
      }}
      minWidth="35%"
    >
      View Leaderboard
    </button>
      </vstack>
    );



const LeaderboardScreen = () => (
  <vstack gap="small" alignment="center middle" width="100%" height="100%">
    <text size="large" color="#d9c3a0">
      Top 5 Players
    </text>
    {loadingLeaderboard ? (
      <text size="small" color="#ffffff">
        Loading leaderboard...
      </text>
    ) : topPlayers.length === 0 ? (
      <text size="small" color="#ffffff">
        No players yet. Play the game first!
      </text>
    ) : (
      <vstack gap="small">
        {topPlayers.map((player, index) => (
          <hstack key={`${player.name}-${player.score}`} gap="small" alignment="center middle">
            <text size="medium" color="#ffffff">
              {index + 1}. {player.name} - {player.score}
            </text>
          </hstack>
        ))}
      </vstack>
    )}
    <button
      appearance="primary"
      onPress={() => {
        getTopPlayers(); 
        setCurrentScreen("Home");
      }}
      minWidth="35%"
    >
      Back to Home
    </button>
  </vstack>
);


    return (
      <blocks>
        {currentScreen === "Home" && <HomeScreen />}
        {currentScreen === "Game" && <Canvas />}
        {currentScreen === "Instructions" && <InstructionsScreen />}
        {currentScreen === "Leaderboard" && <LeaderboardScreen />}
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