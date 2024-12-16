import {Devvit , useState} from '@devvit/public-api'

const resolution = 6;
const height = 40;
const width = 40;
const blankCanvas = new Array(resolution * resolution).fill(0);
const gridSize = `${resolution * width}px`


Devvit.addCustomPostType({
  name: 'Name',
  render: context => {
    const { useState } = context;
    const [data, setData] = useState(blankCanvas);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });



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

    

const pixels = data.map((pixel, index) => {
      const row = Math.floor(index / resolution);
      const col = index % resolution;
      const isSprite = row === spritePosition.y && col === spritePosition.x;
    return(
      <hstack
        height={`${height}px`}
        width={`${width}px`}
        backgroundColor={isSprite ? 'transparent' : "white"}
        border="thin"
        borderColor="grey"
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



    
  function splitArray<T>(array: T[], segmentLength: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += segmentLength) {
    result.push(array.slice(i, i + segmentLength));
    }
    return result;
  }

    
  return (
      <blocks>
      <vstack gap="small" width="100%" height="100%" alignment="center middle">
          <vstack
            cornerRadius="small"
            border="thin"
            height={gridSize}
            width={gridSize}
          >
            {splitArray(pixels, resolution).map((row) => (
              <hstack  >{row}</hstack>
            ))}
          </vstack>
        <hstack gap="small">
        <button onPress={() => moveSprite('Up')}>Up</button>
        <button onPress={() => moveSprite('Down')}>Down</button>
        <button onPress={() => moveSprite('Left')}>Left</button>
        <button onPress={() => moveSprite('Right')}>Right</button>
        </hstack>
      </vstack>
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
