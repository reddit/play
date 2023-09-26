import {
  Devvit,
  type ContextAPIClients,
  type IconName,
  type UseStateResult
} from '@devvit/public-api'

export class CategoryPageState {
  readonly _category: UseStateResult<string>
  readonly _subcategory: UseStateResult<string>
  readonly _goHome: () => void

  constructor({useState, goHome}: StatefulProps) {
    this._category = useState<string>('')
    this._subcategory = useState<string>('')
    this._goHome = goHome
  }

  get category(): string {
    return this._category[0]
  }

  set category(value: string) {
    this._category[1](value)
    this.subcategory = ''
  }

  setCategory = (value: string): void => {
    this.category = value
  }

  get subcategory(): string {
    return this._subcategory[0]
  }

  set subcategory(value: string) {
    this._subcategory[1](value)
  }

  setSubCategory = (value: string): void => {
    this.subcategory = value
  }

  goHome = (): void => this._goHome()
}

function SpacerPage({state}: SharedCategoryPageProps): JSX.Element {
  const categories: CategoryProps[] = [
    {
      label: 'Size',
      category: 'size',
      content: <SpacerSizeCategory />
    }
  ]
  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={capitalize(Page.SPACERS)}
    />
  )
}

function SpacerSizeCategory(): JSX.Element {
  const options: [string, Devvit.Blocks.SpacerSize][] = [
    ['XSmall (4 dp)', 'xsmall'],
    ['Small (8 dp)', 'small'],
    ['Medium (16 dp)', 'medium'],
    ['Large (24 dp)', 'large']
  ]

  const content = options.map(([label, size]) => (
    <Tile label={label}>
      <zstack backgroundColor='#EAEDEF'>
        <hstack alignment='middle'>
          <hstack>
            <text color='#0008'>A</text>
          </hstack>
          <hstack border='thin' borderColor='#0045AC'>
            <spacer size={size} />
          </hstack>
          <hstack>
            <text color='#0008'>B</text>
          </hstack>
        </hstack>
        <vstack>
          <spacer size='large' />
        </vstack>
      </zstack>
    </Tile>
  ))

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  )
}

function getIcons(type: string = ''): JSX.Element[] {
  const iconNames = ['bot', 'topic-programming', 'original', 'karma']
  const iconColors = ['black', 'blue', 'green', 'red']

  return iconNames.map((name, index) => (
    <Tile label={name}>
      <icon
        name={`${name}${type ? '-' : ''}${type}` as IconName}
        color={iconColors[index]}
      />
    </Tile>
  ))
}

const defaultIcons = getIcons()
const outlineIcons = getIcons('outline')
const fillIcons = getIcons('fill')

const iconCategories = [
  {
    label: 'Default',
    category: 'default',
    content: <Columns count={2}>{defaultIcons}</Columns>
  },
  {
    label: 'Outline',
    category: 'outline',
    content: <Columns count={2}>{outlineIcons}</Columns>
  },
  {
    label: 'Fill',
    category: 'fill',
    content: <Columns count={2}>{fillIcons}</Columns>
  }
]

function IconsCategory({state}: SharedCategoryPageProps): JSX.Element {
  return (
    <CategoryPage
      state={state}
      categories={iconCategories}
      activeCategory={state.subcategory}
      onCategoryChanged={state.setSubCategory}
      subCategoryPage
    />
  )
}

const sizes: Devvit.Blocks.IconSize[] = ['xsmall', 'small', 'medium', 'large']

function IconSizeCategory(): JSX.Element {
  const icons = sizes.map(size => (
    <Tile label={size}>
      <icon name={'admin-fill'} size={size} />
    </Tile>
  ))

  return (
    <vstack>
      <Columns count={2}>{icons}</Columns>
    </vstack>
  )
}

function IconPage({state}: SharedCategoryPageProps): JSX.Element {
  const categories: CategoryProps[] = [
    {
      label: 'Examples',
      category: 'examples',
      content: <IconsCategory state={state} />
    },
    {
      label: 'Size',
      category: 'size',
      content: <IconSizeCategory />
    }
  ]
  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={capitalize(Page.ICON)}
    />
  )
}

const boxesPerLine: number = 3
const boxes: JSX.Element[] = new Array(boxesPerLine).fill(
  <Box color='rgba(0, 69, 172, 0.5)' />
)

function StackDirectionCategory(): JSX.Element {
  return (
    <vstack gap='small'>
      <Tile label='HStack'>
        <hstack gap='small'>{boxes}</hstack>
      </Tile>

      <Tile label='VStack'>
        <vstack gap='small'>{boxes}</vstack>
      </Tile>

      <Tile label='ZStack'>
        <zstack>{boxes}</zstack>
      </Tile>
    </vstack>
  )
}

function StackRoundingCategory(): JSX.Element {
  const options: [string, Devvit.Blocks.ContainerCornerRadius][] = [
    ['None *', 'none'],
    ['Small (8 dp)', 'small'],
    ['Medium (16 dp)', 'medium'],
    ['Large (24 dp)', 'large'],
    ['Full (50%)', 'full']
  ]

  const content = options.map(([label, option]) => (
    <Tile label={label} padding='small'>
      <vstack backgroundColor='#0045AC' cornerRadius={option}>
        <Box size={2} />
      </vstack>
    </Tile>
  ))

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  )
}

function StacksPage({state}: SharedCategoryPageProps): JSX.Element {
  const categories: CategoryProps[] = [
    {
      label: 'Direction',
      category: 'direction',
      content: <StackDirectionCategory />
    },
    {
      label: 'Gap',
      category: 'gap',
      content: <StackGapCategory />
    },
    {
      label: 'Padding',
      category: 'padding',
      content: <StackPaddingCategory />
    },
    {
      label: 'Alignment',
      category: 'alignment',
      content: <StackAlignmentCategory state={state} />
    },
    {
      label: 'Corner radius',
      category: 'rounding',
      content: <StackRoundingCategory />
    },
    {
      label: 'Border',
      category: 'border',
      content: <StackBorderCategory />
    },
    {
      label: 'Reverse',
      category: 'reverse',
      content: <StackReverseCategory />
    }
  ]
  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={capitalize(Page.STACKS)}
    />
  )
}

const horizontalAlignment: Devvit.Blocks.Alignment[] = [
  'start',
  'center',
  'end'
]
const verticalAlignment: Devvit.Blocks.Alignment[] = ['top', 'middle', 'bottom']

function StackAlignmentPreview({mode}: {mode: string}): JSX.Element {
  const options: [string, string][] = []

  if (mode.includes('vertical')) {
    for (const vert of verticalAlignment) {
      if (mode.includes('horizontal')) {
        for (const horiz of horizontalAlignment) {
          options.push([`${horiz} + ${vert}`, `${horiz} ${vert}`])
        }
      } else {
        options.push([vert, vert])
      }
    }
  } else if (mode.includes('horizontal')) {
    for (const horiz of horizontalAlignment) {
      options.push([horiz, horiz])
    }
  }

  const content = options.map(([label, style]) => (
    <Tile label={label} padding='small'>
      <zstack
        alignment={style as Devvit.Blocks.Alignment}
        backgroundColor='#EAEDEF'
      >
        <Box size={2} />
        <Box size={1} color='#0045AC' rounded />
      </zstack>
    </Tile>
  ))

  return (
    <vstack grow>
      <Columns count={3}>{content}</Columns>
    </vstack>
  )
}

function StackBorderCategory(): JSX.Element {
  const options: [string, Devvit.Blocks.ContainerBorderWidth][] = [
    ['None *', 'none'],
    ['Thin (1 dp)', 'thin'],
    ['Thick (2 dp)', 'thick']
  ]

  const content = options.map(([label, option]) => (
    <Tile label={label}>
      <hstack backgroundColor='#EAEDEF' border={option}>
        <Box />
      </hstack>
    </Tile>
  ))

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  )
}

function StackPaddingCategory(): JSX.Element {
  const options: [string, Devvit.Blocks.ContainerPadding][] = [
    ['None *', 'none'],
    ['XSmall (4 dp)', 'xsmall'],
    ['Small (8 dp)', 'small'],
    ['Medium (16 dp)', 'medium'],
    ['Large (32 dp)', 'large']
  ]

  const content = options.map(([label, option]) => (
    <Tile label={label} padding='small'>
      <hstack backgroundColor='#0045AC' padding={option}>
        <Box color='#EAEDEF' />
      </hstack>
    </Tile>
  ))

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  )
}

function StackAlignmentCategory({
  state
}: {
  state: CategoryPageState
}): JSX.Element {
  const subCategories = [
    ['Horizontal', 'horizontal'],
    ['Vertical', 'vertical'],
    ['Horiz + Vert', 'horizontal vertical']
  ] as const

  const content = subCategories.map(([label, subcategory]) => ({
    label,
    category: subcategory,
    content: <StackAlignmentPreview mode={subcategory} />
  }))

  return (
    <CategoryPage
      state={state}
      subCategoryPage
      categories={content}
      activeCategory={state.subcategory}
      onCategoryChanged={state.setSubCategory}
    />
  )
}

function StackGapCategory(): JSX.Element {
  const options: [string, Devvit.Blocks.ContainerGap][] = [
    ['None *', 'none'],
    ['Small (8 dp)', 'small'],
    ['Medium (16 dp)', 'medium'],
    ['Large (32 dp)', 'large']
  ]

  const boxCount = 3
  const content = options.map(([label, option]) => (
    <Tile label={label}>
      <hstack backgroundColor='#EAEDEF' gap={option}>
        {new Array(boxCount).fill(<Box color='#0045AC' />)}
      </hstack>
    </Tile>
  ))

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  )
}

function StackReverseCategory(): JSX.Element {
  const options: [string, boolean][] = [
    ['False *', false],
    ['True', true]
  ]

  const letters: string[] = ['A', 'B', 'C']

  const content = options.map(([label, option]) => (
    <Tile label={label}>
      <hstack reverse={option} gap='small'>
        {letters.map(letter => (
          <zstack backgroundColor='#0045AC'>
            <hstack>
              <spacer size='large' />
            </hstack>
            <vstack>
              <spacer size='large' />
            </vstack>
            <hstack alignment='center middle'>
              <text selectable={false} weight='bold' color='#ffffff'>
                {letter}
              </text>
            </hstack>
          </zstack>
        ))}
      </hstack>
    </Tile>
  ))

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  )
}

type ImageMode = [string, Devvit.Blocks.ImageResizeMode]

function ImagePage({state}: SharedCategoryPageProps): JSX.Element {
  const imageModes: ImageMode[] = [
    ['None', 'none'],
    ['Fit *', 'fit'],
    ['Fill', 'fill'],
    ['Cover', 'cover'],
    ['Scale Down', 'scale-down']
  ]

  const categories: CategoryProps[] = imageModes.map(([label, mode]) => ({
    label,
    category: mode,
    content: <ImageResizePreview mode={mode} />
  }))

  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={capitalize(Page.IMAGES)}
    />
  )
}

const ImageResizePreview = ({
  mode
}: {
  mode: Devvit.Blocks.ImageResizeMode
}): JSX.Element => {
  return (
    <Tile>
      <hstack backgroundColor='#EAEDEF'>
        <image
          url='data:image/png;base64,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'
          resizeMode={mode}
          imageHeight={128}
          imageWidth={512}
        />
      </hstack>
    </Tile>
  )
}

function ButtonPage({state}: SharedCategoryPageProps): JSX.Element {
  const categories: CategoryProps[] = [
    {
      label: 'Appearances',
      category: 'appearance',
      content: <ButtonAppearanceCategory />
    },
    {
      label: 'Sizes',
      category: 'size',
      content: <ButtonSizeCategory />
    },
    {
      label: 'Contents',
      category: 'content',
      content: <ButtonContentCategory />
    },
    {
      label: 'Grow',
      category: 'grow',
      content: <ButtonGrowCategory />
    },
    {
      label: 'Disabled',
      category: 'disabled',
      content: <ButtonDisabledCategory />
    },
    {
      label: 'Icons',
      category: 'icons',
      content: <ButtonIconCategory />
    }
  ]

  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={capitalize(Page.BUTTONS)}
    />
  )
}

function ButtonIconCategory(): JSX.Element {
  const icons: IconName[] = [
    'bot',
    'bot-fill',
    'topic-funny',
    'topic-funny-fill'
  ]

  const content = icons.map((icon: IconName) => (
    <Tile label={icon}>
      <button appearance={'primary'} icon={icon}>
        Label
      </button>
    </Tile>
  ))

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  )
}

function ButtonSizeCategory(): JSX.Element {
  const options: [string, Devvit.Blocks.ButtonSize][] = [
    ['Small (32 dp)', 'small'],
    ['Medium (40 dp) *', 'medium'],
    ['Large (48 dp)', 'large']
  ]

  const content = options.map(([label, size]) => {
    return (
      <Tile label={label}>
        <button appearance='secondary' size={size}>
          Label
        </button>
      </Tile>
    )
  })
  content.push(
    ...options.map(([label, size]) => {
      return (
        <Tile label={label}>
          <button appearance='secondary' size={size} icon='admin'>
            Label
          </button>
        </Tile>
      )
    })
  )

  return (
    <vstack>
      <Columns count={3}>{content}</Columns>
    </vstack>
  )
}

function ButtonContentCategory(): JSX.Element {
  return (
    <vstack>
      <Columns count={3}>
        <Tile label='Label'>
          <button>Label</button>
        </Tile>
        <Tile label='Icon'>
          <button icon='upvote-outline'>Label</button>
        </Tile>
        <Tile label='Label and icon'>
          <button icon='chat-outline'>Chat</button>
        </Tile>
      </Columns>
    </vstack>
  )
}

function ButtonDisabledCategory(): JSX.Element {
  const options: [string, Devvit.Blocks.ButtonAppearance][] = [
    ['Primary', 'primary'],
    ['Secondary *', 'secondary'],
    ['Plain', 'plain'],
    ['Bordered', 'bordered'],
    ['Destructive', 'destructive'],
    ['Media', 'media'],
    ['Success', 'success']
  ]

  const content = options.map(([label, appearance]) => (
    <Tile label={label} padding={'small'}>
      <hstack gap='small'>
        <button appearance={appearance}>Enabled</button>
        <button appearance={appearance} disabled>
          Disabled
        </button>
      </hstack>
    </Tile>
  ))

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  )
}

function ButtonGrowCategory(): JSX.Element {
  const options: [string, boolean][] = [
    ['False *', false],
    ['True', true]
  ]

  const content = options.map(([label, style]) => (
    <Tile label={label}>
      <button grow={style}>Label</button>
    </Tile>
  ))

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  )
}

function ButtonAppearanceCategory(): JSX.Element {
  const options: [string, Devvit.Blocks.ButtonAppearance][] = [
    ['Primary', 'primary'],
    ['Secondary *', 'secondary'],
    ['Plain', 'plain'],
    ['Bordered', 'bordered'],
    ['Destructive', 'destructive'],
    ['Media', 'media'],
    ['Success', 'success']
  ]

  const content = options.map(([label, appearance]) => {
    return (
      <Tile label={label} padding={'small'}>
        <button appearance={appearance}>Label</button>
      </Tile>
    )
  })

  return (
    <vstack>
      <Columns count={2}>{content}</Columns>
    </vstack>
  )
}
export enum Page {
  HOME = 'home',
  BUTTONS = 'buttons',
  IMAGES = 'images',
  SPACERS = 'spacers',
  STACKS = 'stacks',
  TEXT = 'text',
  ICON = 'icon'
}

function TextStyleCategory(): JSX.Element {
  const options: [string, Devvit.Blocks.TextStyle][] = [
    ['Metadata', 'metadata'],
    ['Body *', 'body'],
    ['Heading', 'heading']
  ]

  return (
    <vstack>
      <Columns count={1}>
        {options.map(([label, style]) => (
          <Tile label={label}>
            <text selectable={true} style={style}>
              The quick brown fox jumps over the lazy dog.
            </text>
          </Tile>
        ))}
      </Columns>
    </vstack>
  )
}

function TextPage({state}: SharedCategoryPageProps): JSX.Element {
  const categories: CategoryProps[] = [
    {
      label: 'Sizes',
      category: 'size',
      content: <TextSizeCategory />
    },
    {
      label: 'Weights',
      category: 'weight',
      content: <TextWeightCategory />
    },
    {
      label: 'Outline',
      category: 'outline',
      content: <TextOutlineCategory />
    },
    {
      label: 'Styles',
      category: 'style',
      content: <TextStyleCategory />
    }
  ]
  return (
    <CategoryPage
      state={state}
      categories={categories}
      activeCategory={state.category}
      onCategoryChanged={state.setCategory}
      title={capitalize(Page.TEXT)}
    />
  )
}

function TextSizeCategory(): JSX.Element {
  const options: [string, Devvit.Blocks.TextSize][] = [
    ['XSmall', 'xsmall'],
    ['Small', 'small'],
    ['Medium *', 'medium'],
    ['Large', 'large'],
    ['XLarge', 'xlarge'],
    ['XXLarge', 'xxlarge']
  ]

  return (
    <vstack>
      <Columns count={2}>
        {options.map(([label, value]) => (
          <Tile label={label}>
            <text selectable={true} size={value}>
              The quick brown fox jumps over the lazy dog.
            </text>
          </Tile>
        ))}
      </Columns>
    </vstack>
  )
}

function TextWeightCategory(): JSX.Element {
  const options: [string, Devvit.Blocks.TextWeight][] = [
    ['Regular *', 'regular'],
    ['Semibold', 'bold']
  ]

  return (
    <vstack>
      <Columns count={2}>
        {options.map(([label, style]) => (
          <Tile label={label}>
            <text size='large' weight={style}>
              The quick brown fox jumps over the lazy dog.
            </text>
          </Tile>
        ))}
      </Columns>
    </vstack>
  )
}

function TextOutlineCategory(): JSX.Element {
  const options: [string, Devvit.Blocks.Thickness, string][] = [
    ['None *', 'none', 'bright'],
    ['Thin', 'thin', 'bright'],
    ['Thick', 'thick', 'bright'],
    ['None *', 'none', 'dark'],
    ['Thin', 'thin', 'dark'],
    ['Thick', 'thick', 'dark']
  ]

  return (
    <vstack>
      <Columns count={3}>
        {options.map(([label, style, color]) => (
          <Tile label={label}>
            <hstack
              backgroundColor='#808080'
              padding='small'
              cornerRadius='small'
              grow
            >
              <text
                selectable={false}
                color={color === 'dark' ? 'tone-1' : 'tone-7'}
                outline={style}
              >
                Text
              </text>
            </hstack>
          </Tile>
        ))}
      </Columns>
    </vstack>
  )
}

function HomePage({state}: BlockGalleryProps): JSX.Element {
  const pages = [
    ['Button', 'buttons'],
    ['Image', 'images'],
    ['Stack', 'stacks'],
    ['Spacer', 'spacers'],
    ['Text', 'text'],
    ['Icon', 'icon']
  ] as const

  const pageButtons = pages.map(([label, id]) => (
    <button
      onPress={() => {
        state.currentPage = id
      }}
      grow
    >
      {label}
    </button>
  ))

  return (
    <vstack gap='medium'>
      <vstack>
        <text
          selectable={false}
          size='xlarge'
          weight='bold'
          color='#0F1A1C'
          onPress={() => {
            state.showToast('Hello, world!')
          }}
        >
          Block Gallery
        </text>
        <text selectable={false} size='medium' color='#576F76'>
          Version 2.0
        </text>
      </vstack>

      <Columns count={2}>{pageButtons}</Columns>
    </vstack>
  )
}

Devvit.addCustomPostType({
  name: 'Blocks Gallery',
  description: 'Demonstrates the blocks elements',
  render: (renderContext: ContextAPIClients) => {
    const state = new GalleryState(renderContext)
    return <BlockGallery state={state} />
  }
})

export default Devvit

export class IconPageState extends CategoryPageState {
  constructor(statefulProps: StatefulProps) {
    super(statefulProps)
  }
}

export class ImagePageState extends CategoryPageState {
  constructor(statefulProps: StatefulProps) {
    super(statefulProps)
  }
}

export class SpacerPageState extends CategoryPageState {
  constructor(statefulProps: StatefulProps) {
    super(statefulProps)
  }
}

export class ButtonPageState extends CategoryPageState {
  constructor(statefulProps: StatefulProps) {
    super(statefulProps)
  }
}

export interface StatefulProps {
  useState: ContextAPIClients['useState']
  goHome: () => void
}

export class GalleryState {
  readonly _currentPage: UseStateResult<Page>
  readonly _pageStates: Record<Page, CategoryPageState>
  readonly showToast: (message: string) => void

  constructor(renderContext: ContextAPIClients) {
    const {useState} = renderContext
    const goHome = (): void => {
      this.currentPage = Page.HOME
    }
    const statefulProps: StatefulProps = {useState, goHome}
    this._currentPage = useState<Page>(Page.HOME)
    this._pageStates = {
      [Page.HOME]: new CategoryPageState(statefulProps),
      [Page.BUTTONS]: new ButtonPageState(statefulProps),
      [Page.IMAGES]: new ImagePageState(statefulProps),
      [Page.STACKS]: new StackPageState(statefulProps),
      [Page.SPACERS]: new SpacerPageState(statefulProps),
      [Page.TEXT]: new TextPageState(statefulProps),
      [Page.ICON]: new IconPageState(statefulProps)
    }
    this.showToast = (message: string) => renderContext.ui.showToast(message)
  }

  get currentPage(): Page {
    return this._currentPage[0]
  }

  set currentPage(page: Page | string) {
    this._currentPage[1](page as Page)
  }

  pageState(page: Page): CategoryPageState {
    return this._pageStates[page]
  }
}

export class StackPageState extends CategoryPageState {
  constructor(statefulProps: StatefulProps) {
    super(statefulProps)
  }
}

export class TextPageState extends CategoryPageState {
  constructor(statefulProps: StatefulProps) {
    super(statefulProps)
  }
}

export interface BoxProps {
  spacerSize?: Devvit.Blocks.SpacerSize
  size?: number
  color?: string
  rounded?: boolean
}

export function Box({
  spacerSize = 'large',
  size = 1,
  color,
  rounded = false
}: BoxProps): JSX.Element {
  return (
    <zstack>
      <hstack>
        <vstack>
          <zstack
            backgroundColor={color}
            cornerRadius={rounded ? 'full' : 'none'}
          >
            <hstack>
              {new Array(size).fill(<spacer size={spacerSize} />)}
            </hstack>
            <vstack>
              {new Array(size).fill(<spacer size={spacerSize} />)}
            </vstack>
          </zstack>
        </vstack>
      </hstack>
    </zstack>
  )
}

export interface BlockGalleryProps {
  state: GalleryState
}

function BlockGallery({state}: BlockGalleryProps): JSX.Element {
  const page = state.currentPage
  const pageState = state.pageState(page)
  return (
    <blocks height='tall'>
      <vstack
        borderColor='gray'
        border='thick'
        cornerRadius='small'
        padding='medium'
        grow
      >
        {page === Page.HOME && <HomePage state={state} />}
        {page === Page.BUTTONS && <ButtonPage state={pageState} />}
        {page === Page.IMAGES && <ImagePage state={pageState} />}
        {page === Page.SPACERS && <SpacerPage state={pageState} />}
        {page === Page.STACKS && <StacksPage state={pageState} />}
        {page === Page.TEXT && <TextPage state={pageState} />}
        {page === Page.ICON && <IconPage state={pageState} />}
      </vstack>
    </blocks>
  )
}

type TabsProps = {tabs: TabProps[]}
type TabProps = {label: string; isActive: boolean; onPress: () => void}

const Tab = ({label, isActive, onPress}: TabProps): JSX.Element => {
  return (
    <button
      appearance={isActive ? 'primary' : 'secondary'}
      size='small'
      onPress={onPress}
    >
      {label}
    </button>
  )
}

function Tabs({tabs}: TabsProps): JSX.Element {
  return (
    <hstack alignment='start' gap='small'>
      {tabs.map(({label, isActive, onPress}) => (
        <Tab label={label} isActive={isActive} onPress={onPress} />
      ))}
    </hstack>
  )
}

export interface SharedCategoryPageProps {
  state: CategoryPageState
}

export type CategoryPageProps = SharedCategoryPageProps & {
  title?: string
  categories: CategoryProps[]
  activeCategory: string
  onCategoryChanged: (category: string) => void
  subCategoryPage?: boolean
}

export interface CategoryProps {
  label: string
  category: string
  content: JSX.Element | JSX.Element[]
}

function CategoryPage(props: CategoryPageProps): JSX.Element {
  const activeCategory = props.activeCategory || props.categories[0]!.category
  return (
    <vstack gap='small' grow>
      {/* Header */}
      {props.subCategoryPage ? (
        <></>
      ) : (
        <hstack alignment='start middle' gap='small'>
          <button
            onPress={props.state?.goHome}
            appearance='secondary'
            size='small'
          >
            {' ← '}
          </button>
          <text selectable={false} size='xlarge' weight='bold' color='#0F1A1C'>
            {props.title}
          </text>
        </hstack>
      )}

      {/* Tabs */}
      <Tabs
        tabs={props.categories.map(({label, category}) => ({
          label,
          isActive: category === activeCategory,
          onPress: () => {
            props.onCategoryChanged(category)
          }
        }))}
      />

      {
        // Page contents
        props.categories.find(page => page.category === activeCategory)?.content
      }
    </vstack>
  )
}

interface ColumnsProps {
  count: number
  children: JSX.Children
}

function Columns({count, children}: ColumnsProps): JSX.Element {
  const rows: JSX.Element[] = []

  // Divide the children into rows with N (count) children each.
  // Pad the last row if incomplete.
  for (let i = 0; i < children.length; i += count) {
    const row = children.slice(i, i + count)
    const rowHasRoom = (): boolean => row.length < count
    while (rowHasRoom()) row.push(<hstack grow />)
    rows.push(<hstack gap='small'>{row}</hstack>)
  }

  return <vstack gap='small'>{rows}</vstack>
}

export interface TileProps {
  label?: string | undefined
  padding?: Devvit.Blocks.ContainerPadding | undefined
  children: JSX.Element | JSX.Element[]
}

function Tile(props: TileProps): JSX.Element {
  const {label, children} = props
  return (
    <vstack
      padding={props.padding ?? 'medium'}
      border='thick'
      borderColor='#0002'
      cornerRadius='small'
      gap='small'
      grow
    >
      <hstack alignment='start middle' grow>
        {children}
      </hstack>
      {label ? (
        <text selectable={false} color='#576F76'>
          {label}
        </text>
      ) : (
        <></>
      )}
    </vstack>
  )
}

function capitalize<T extends string>(str: T): Capitalize<T> {
  if (str[0] == null) return str as Capitalize<T>
  return `${str[0].toLocaleUpperCase()}${str.slice(1)}` as Capitalize<T>
}
