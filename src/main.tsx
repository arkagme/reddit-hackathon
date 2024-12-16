import {Devvit , useState} from '@devvit/public-api'

const resolution = 3;
const height = 70;
const width = 70;
const blankCanvas = new Array(resolution * resolution).fill(0);
const gridSize = `${resolution * width}px`

Devvit.configure({
  redditAPI: true,
});

Devvit.addCustomPostType({
  name: 'Name',
  render: context => {
    const { useState } = context;
    const [data, setData] = useState(blankCanvas);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });
    let [score, setCounter] = useState(0)


const pixels = data.map((pixel, index) => {
      const row = Math.floor(index / resolution);
      const col = index % resolution;
      const isSprite = row === spritePosition.y && col === spritePosition.x;
    let backgroundColor = 'white';
        if (row === 2 && col === 2) {
          backgroundColor = '#FF2400'; 
          if( isSprite){setCounter((score) => score + 4)}
        } else if (
          (row === 2 && (col === 0 || col === 1)) || 
          (col === 2 && (row === 0 || row === 1))   
        ) {
          backgroundColor = '#1773FE';
          if( isSprite){setCounter((score) => score + 3)}
        } else if (
          (row === 1 && col === 0) ||               
          (row === 1 && col === 1) ||                
          (row === 0 && col === 1)                   
        ) {
          backgroundColor = 'yellow';
          if( isSprite){setCounter((score) => score + 2)}
        } else if (row === 0 && col === 0) {
          backgroundColor = 'green';
          if( isSprite){setCounter((score) => score + 1)}
        }


    return(
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
                description="Generative artwork: Fuzzy Fingers"
            />
          )}
        </hstack>
    );
});

const moveSprite = (direction : 'Up' | 'Down' | 'Left' | 'Right') => {
      setSpritePosition((prev) => {
        let { x, y } = prev;

        switch (direction) {
          case 'Up':
            y = Math.max(0, y - 1);
            break;
          case 'Down':
            y = Math.min(resolution - 1, y + 1);
            break;
          case 'Left':
            x = Math.max(0, x - 1);
            break;
          case 'Right':
            x = Math.min(resolution - 1, x + 1);
            break;
        }
        return { x, y };
      });
    };



    
  function splitArray<T>(array: T[], segmentLength: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += segmentLength) {
    result.push(array.slice(i, i + segmentLength));
    }
    return result;
  }

const Canvas = () => (
      <vstack gap="small" width="100%" height="100%" alignment="center middle">
          <vstack
            cornerRadius="none"
            border="thin"
            height={gridSize}
            width={gridSize}
          >
              {splitArray(pixels, resolution).map((row) => (
                <hstack  >{row}</hstack>
              ))}  
          </vstack>
        <vstack gap="small" alignment="bottom start">
            <hstack gap="small" >
              <button icon="up-arrow-fill" width="70px" grow onPress={() => moveSprite('Up')}>Up</button>
              <button icon="back-fill" width="78px" grow onPress={() => moveSprite('Left')}>Left</button>
               <vstack alignment="middle center" padding="small"><text size="large"> Score : {score} </text></vstack>
             </hstack>
            <hstack gap="small">
              <button icon="down-arrow-fill" width="75px" grow onPress={() => moveSprite('Down')}>Down</button>
              <button icon="forward-fill" width="75px" grow onPress={() => moveSprite('Right')}>Right</button>
            </hstack>
        </vstack>
      </vstack>
  
)
    
  return (
      <blocks>
        <Canvas />
      </blocks>
    )
  }
})

Devvit.addMenuItem({
  label: 'Add my post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Submitting your post - upon completion you'll navigate there.");

    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'My devvit post ',
      subredditName: subreddit.name,
      // The preview appears while the post loads
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    ui.navigateTo(post);
  },
});

export default Devvit
