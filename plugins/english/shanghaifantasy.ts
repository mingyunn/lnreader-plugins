import { fetchApi, fetchText } from '@libs/fetch';
import { Plugin } from '@/types/plugin';
import { Filters, FilterTypes } from '@libs/filterInputs';
import { load as loadCheerio } from 'cheerio';
import { defaultCover } from '@libs/defaultCover';
import { NovelStatus } from '@libs/novelStatus';

type APINovel = {
  title?: string;
  post_title?: string;
  name?: string;
  novelImage?: string;
  thumbnail?: string;
  image?: string;
  permalink?: string;
  link?: string;
  url?: string;
  novelIntro?: string;
  novelGenres?: string;
  novelStat?: string;
  id?: number;
};

type APIChapter = {
  post_title?: string;
  title?: string;
  name?: string;
  permalink?: string;
  guid?: string;
  url?: string;
  link?: string;
  post_date?: string;
  date?: string;
  locked?: boolean;
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

class ShanghaiFantasy implements Plugin.PluginBase {
  id = 'shanghaifantasy';
  name = 'Shanghai Fantasy';
  icon = 'src/en/shanghaifantasy/icon.png';
  site = 'https://shanghaifantasy.com';
  version = '1.0.1';
  webStorageUtilized = false;

  filters = {
    novelstatus: {
      type: FilterTypes.Picker,
      label: 'Status',
      value: '',
      options: [
        { label: 'All', value: '' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Draft', value: 'Draft' },
        { label: 'Dropped', value: 'Dropped' },
        { label: 'Hiatus', value: 'Hiatus' },
        { label: 'Ongoing', value: 'Ongoing' },
      ],
    },
    term: {
      type: FilterTypes.CheckboxGroup,
      label: 'Genre',
      value: [],
      options: [
        { label: '1960s', value: '1960s' },
        { label: '1960s Era', value: '1960s Era' },
        { label: '1970s', value: '1970s' },
        { label: '1970s Era', value: '1970s Era' },
        { label: '1970s Romance', value: '1970s Romance' },
        { label: '1970s Setting', value: '1970s Setting' },
        { label: '1980s', value: '1980s' },
        { label: '1990s', value: '1990s' },
        { label: '1v1 Romance', value: '1v1 Romance' },
        { label: 'ABO', value: 'ABO' },
        { label: 'Acting', value: 'Acting' },
        { label: 'Action', value: 'Action' },
        { label: 'Action Adventure', value: 'Action Adventure' },
        { label: 'Adapted to Drama CD', value: 'Adapted to Drama CD' },
        { label: 'Adult', value: 'Adult' },
        { label: 'Adventure', value: 'Adventure' },
        { label: 'Age Gap', value: 'Age Gap' },
        { label: 'AI Translated', value: 'AI Translated' },
        { label: 'All-Around Genius', value: 'All-Around Genius' },
        { label: 'Alternate Ancient China', value: 'Alternate Ancient China' },
        { label: 'Alternate History', value: 'Alternate History' },
        { label: 'Alternate World', value: 'Alternate World' },
        { label: 'Alternative History', value: 'Alternative History' },
        { label: 'Amnesia', value: 'Amnesia' },
        { label: 'Ancient China', value: 'Ancient China' },
        { label: 'Ancient Chinese', value: 'Ancient Chinese' },
        { label: 'Ancient Romance', value: 'Ancient Romance' },
        { label: 'Ancient Setting', value: 'Ancient Setting' },
        { label: 'Ancient Times', value: 'Ancient Times' },
        { label: 'Androgynous Characters', value: 'Androgynous Characters' },
        { label: 'Angst', value: 'Angst' },
        { label: 'Apocalypse', value: 'Apocalypse' },
        { label: 'Arranged Marriage', value: 'Arranged Marriage' },
        { label: 'Autism', value: 'Autism' },
        { label: 'Base Building', value: 'Base Building' },
        { label: 'Beautiful Female Lead', value: 'Beautiful Female Lead' },
        { label: 'Bickering Couple', value: 'Bickering Couple' },
        { label: 'Billionaire', value: 'Billionaire' },
        { label: 'BL', value: 'BL' },
        { label: 'Blind Date Romance', value: 'Blind Date Romance' },
        { label: 'Book Transmigration', value: 'Book Transmigration' },
        { label: 'Business', value: 'Business' },
        { label: 'Business management', value: 'Business management' },
        { label: 'Bussiness', value: 'Bussiness' },
        { label: 'Cannon Fodder', value: 'Cannon Fodder' },
        { label: 'Career Woman', value: 'Career Woman' },
        { label: 'Career-Focused', value: 'Career-Focused' },
        { label: 'Caring Protagonist', value: 'Caring Protagonist' },
        { label: 'CEO', value: 'CEO' },
        { label: 'Character Growth', value: 'Character Growth' },
        { label: 'Charming Protagonist', value: 'Charming Protagonist' },
        { label: 'Child Protagonist', value: 'Child Protagonist' },
        { label: 'Child-Rearing', value: 'Child-Rearing' },
        { label: 'Childcare', value: 'Childcare' },
        { label: 'Childhood Friends', value: 'Childhood Friends' },
        { label: 'Childhood Love', value: 'Childhood Love' },
        { label: 'College', value: 'College' },
        { label: 'Comedy', value: 'Comedy' },
        { label: 'Coming of Age', value: 'Coming of Age' },
        { label: 'Completely Unlocked', value: 'Completely Unlocked' },
        {
          label: 'Complex Family Relationships',
          value: 'Complex Family Relationships',
        },
        { label: 'Concubine', value: 'Concubine' },
        { label: 'Contemporary', value: 'Contemporary' },
        { label: 'Contemporary Romance', value: 'Contemporary Romance' },
        { label: 'Cooking', value: 'Cooking' },
        { label: 'counterattack', value: 'counterattack' },
        { label: 'Countryside', value: 'Countryside' },
        { label: "Coup d'État", value: "Coup d'État" },
        { label: 'Court Nobility', value: 'Court Nobility' },
        { label: 'Court Politics', value: 'Court Politics' },
        { label: 'Crime', value: 'Crime' },
        { label: 'Crime Investigation', value: 'Crime Investigation' },
        { label: 'Cross-Dressing', value: 'Cross-Dressing' },
        { label: 'Cultivation', value: 'Cultivation' },
        { label: 'Cute Child', value: 'Cute Child' },
        { label: 'Cute Children', value: 'Cute Children' },
        { label: 'Daily Life', value: 'Daily Life' },
        { label: 'Dark Romance', value: 'Dark Romance' },
        { label: 'Demons', value: 'Demons' },
        { label: 'Detective', value: 'Detective' },
        { label: 'Devoted Couple', value: 'Devoted Couple' },
        { label: 'Devoted Love Interests', value: 'Devoted Love Interests' },
        { label: 'Devoted Male Lead', value: 'Devoted Male Lead' },
        { label: 'Dimensional Space', value: 'Dimensional Space' },
        { label: 'Divorce', value: 'Divorce' },
        { label: 'Doctors', value: 'Doctors' },
        { label: 'Domestic Drama', value: 'Domestic Drama' },
        { label: 'Domestic Intrigue', value: 'Domestic Intrigue' },
        { label: 'Domestic Life', value: 'Domestic Life' },
        { label: 'Domestic Romance', value: 'Domestic Romance' },
        { label: 'Doomsday Survival', value: 'Doomsday Survival' },
        { label: 'Doting Husband', value: 'Doting Husband' },
        { label: 'Doting Love Interest', value: 'Doting Love Interest' },
        { label: 'Doting Love Interests', value: 'Doting Love Interests' },
        { label: 'Double CP', value: 'Double CP' },
        { label: 'Drama', value: 'Drama' },
        { label: 'Dramatic', value: 'Dramatic' },
        { label: 'Dual Transmigration', value: 'Dual Transmigration' },
        { label: 'Ecchi', value: 'Ecchi' },
        { label: 'Emotional Healing', value: 'Emotional Healing' },
        { label: 'empire', value: 'empire' },
        { label: 'Empowering', value: 'Empowering' },
        { label: 'Enemies Become Lovers', value: 'Enemies Become Lovers' },
        { label: 'Enemies to Lovers', value: 'Enemies to Lovers' },
        { label: 'Ensemble Cast', value: 'Ensemble Cast' },
        { label: 'Entertainment Industry', value: 'Entertainment Industry' },
        { label: 'Era', value: 'Era' },
        { label: 'Era novel', value: 'Era novel' },
        { label: 'Exile', value: 'Exile' },
        { label: 'Face-Slapping', value: 'Face-Slapping' },
        { label: 'Face-Slapping Revenge', value: 'Face-Slapping Revenge' },
        { label: 'Fake Heiress', value: 'Fake Heiress' },
        { label: 'family', value: 'family' },
        { label: 'Family Betrayal', value: 'Family Betrayal' },
        { label: 'Family Bonds', value: 'Family Bonds' },
        { label: 'Family Conflict', value: 'Family Conflict' },
        { label: 'Family Doting', value: 'Family Doting' },
        { label: 'Family Drama', value: 'Family Drama' },
        { label: 'Family Favoritism', value: 'Family Favoritism' },
        { label: 'Family Life', value: 'Family Life' },
        { label: 'Family Problem', value: 'Family Problem' },
        { label: 'Fanfiction', value: 'Fanfiction' },
        { label: 'Fantasy', value: 'Fantasy' },
        { label: 'Fantasy Romance', value: 'Fantasy Romance' },
        { label: 'Farming', value: 'Farming' },
        { label: 'fated match', value: 'fated match' },
        { label: 'feel-good', value: 'feel-good' },
        { label: 'Female Friendship', value: 'Female Friendship' },
        { label: 'Female Lead', value: 'Female Lead' },
        { label: 'Female Protagonist', value: 'Female Protagonist' },
        { label: 'Female-Centered Story', value: 'Female-Centered Story' },
        { label: 'female-dominant world', value: 'female-dominant world' },
        { label: 'Female-oriented', value: 'Female-oriented' },
        { label: 'Fertility System', value: 'Fertility System' },
        { label: 'Flash Marriage', value: 'Flash Marriage' },
        { label: 'Food', value: 'Food' },
        { label: 'Forced Love', value: 'Forced Love' },
        { label: 'Forced Marriage', value: 'Forced Marriage' },
        { label: 'Found Family', value: 'Found Family' },
        { label: 'FREE NOVEL', value: 'FREE NOVEL' },
        { label: 'FREE NOVEL‼️', value: 'FREE NOVEL‼️' },
        { label: 'Gender Bender', value: 'Gender Bender' },
        { label: 'Getting Rich', value: 'Getting Rich' },
        { label: 'Ghosts', value: 'Ghosts' },
        { label: 'Gourmet Food', value: 'Gourmet Food' },
        { label: 'Group favorite', value: 'Group favorite' },
        { label: 'handsome male lead', value: 'handsome male lead' },
        { label: 'Happy Ending', value: 'Happy Ending' },
        { label: 'Harem', value: 'Harem' },
        { label: 'Harem Politics', value: 'Harem Politics' },
        { label: 'HE', value: 'HE' },
        { label: 'Heartwarming', value: 'Heartwarming' },
        { label: 'Heartwarming Romance', value: 'Heartwarming Romance' },
        { label: 'Hidden Child', value: 'Hidden Child' },
        { label: 'Hidden Identity', value: 'Hidden Identity' },
        { label: 'Hidden Powers', value: 'Hidden Powers' },
        { label: 'Hidden Strength', value: 'Hidden Strength' },
        { label: 'Hidden Tenderness', value: 'Hidden Tenderness' },
        { label: 'Hiding True Abilities', value: 'Hiding True Abilities' },
        { label: 'Historical', value: 'Historical' },
        { label: 'Historical Fantasy', value: 'Historical Fantasy' },
        {
          label: 'Historical Fantasy Romance',
          value: 'Historical Fantasy Romance',
        },
        { label: 'Historical Fiction', value: 'Historical Fiction' },
        { label: 'Historical Romance', value: 'Historical Romance' },
        { label: 'Hoarding Supplies', value: 'Hoarding Supplies' },
        { label: 'Horror', value: 'Horror' },
        { label: 'Humorous', value: 'Humorous' },
        { label: 'Imperial Examination', value: 'Imperial Examination' },
        { label: 'Imperial Family', value: 'Imperial Family' },
        { label: 'Infinite Storage Space', value: 'Infinite Storage Space' },
        {
          label: 'Infrastructure Development',
          value: 'Infrastructure Development',
        },
        { label: 'Interstellar', value: 'Interstellar' },
        { label: 'Isekai', value: 'Isekai' },
        { label: 'Josei', value: 'Josei' },
        { label: 'Kingdom Building', value: 'Kingdom Building' },
        { label: 'Lazy Protagonist', value: 'Lazy Protagonist' },
        { label: 'Light Romance', value: 'Light Romance' },
        { label: 'Light-hearted', value: 'Light-hearted' },
        { label: 'Lighthearted', value: 'Lighthearted' },
        { label: 'Live Streaming', value: 'Live Streaming' },
        { label: 'Livestreaming', value: 'Livestreaming' },
        { label: 'Love After Marriage', value: 'Love After Marriage' },
        {
          label: 'Love Interest Falls in Love First',
          value: 'Love Interest Falls in Love First',
        },
        { label: 'Love Triangle', value: 'Love Triangle' },
        { label: 'Love-Hate Relationship', value: 'Love-Hate Relationship' },
        { label: 'Loyal Male Lead', value: 'Loyal Male Lead' },
        { label: 'Lucky Protagonist', value: 'Lucky Protagonist' },
        { label: 'magical space', value: 'magical space' },
        { label: 'Male Protagonist', value: 'Male Protagonist' },
        { label: 'Male Rivalry', value: 'Male Rivalry' },
        { label: 'Marriage', value: 'Marriage' },
        { label: 'Marriage Before Love', value: 'Marriage Before Love' },
        { label: 'Marriage First', value: 'Marriage First' },
        {
          label: 'Marriage First Love Later',
          value: 'Marriage First Love Later',
        },
        { label: 'Martial Arts', value: 'Martial Arts' },
        { label: 'Mature', value: 'Mature' },
        { label: 'Mecha', value: 'Mecha' },
        { label: 'Medical Knowledge', value: 'Medical Knowledge' },
        { label: 'Medical Romance', value: 'Medical Romance' },
        { label: 'medical skills', value: 'medical skills' },
        { label: 'Military', value: 'Military' },
        { label: 'Military Marriage', value: 'Military Marriage' },
        { label: 'Military Romance', value: 'Military Romance' },
        { label: 'mind reading', value: 'mind reading' },
        { label: 'Mistaken Identity', value: 'Mistaken Identity' },
        { label: 'misunderstandings', value: 'misunderstandings' },
        { label: 'Modern', value: 'Modern' },
        { label: 'Modern Day', value: 'Modern Day' },
        { label: 'Modern Knowledge', value: 'Modern Knowledge' },
        { label: 'Modern Romance', value: 'Modern Romance' },
        { label: 'Mountain Village', value: 'Mountain Village' },
        { label: 'Mpreg', value: 'Mpreg' },
        { label: 'Music', value: 'Music' },
        { label: 'Mutated Animal', value: 'Mutated Animal' },
        { label: 'Mutual Firsts', value: 'Mutual Firsts' },
        { label: 'Mutual Healing', value: 'Mutual Healing' },
        { label: 'Mystery', value: 'Mystery' },
        { label: 'Mystery Investigation', value: 'Mystery Investigation' },
        { label: 'Naruto', value: 'Naruto' },
        { label: 'Natural Disasters', value: 'Natural Disasters' },
        { label: 'No Female Rivalry', value: 'No Female Rivalry' },
        { label: 'NoCP', value: 'NoCP' },
        { label: 'Obsessive love', value: 'Obsessive love' },
        { label: 'Older Love Interests', value: 'Older Love Interests' },
        { label: 'omegaverse', value: 'omegaverse' },
        { label: 'Organized Crime', value: 'Organized Crime' },
        { label: 'Otome-style', value: 'Otome-style' },
        { label: 'Overpowered protagonist', value: 'Overpowered protagonist' },
        { label: 'Palace Intrigue', value: 'Palace Intrigue' },
        { label: 'Pampering Wife', value: 'Pampering Wife' },
        { label: 'Parallel Worlds', value: 'Parallel Worlds' },
        { label: 'past and present lives', value: 'past and present lives' },
        { label: 'Past Plays a Big Role', value: 'Past Plays a Big Role' },
        { label: 'Period Drama', value: 'Period Drama' },
        { label: 'Period Novel', value: 'Period Novel' },
        { label: 'Police', value: 'Police' },
        { label: 'Political Intrigue', value: 'Political Intrigue' },
        { label: 'Poor to rich', value: 'Poor to rich' },
        { label: 'possessive male lead', value: 'possessive male lead' },
        { label: 'Post-Apocalyptic', value: 'Post-Apocalyptic' },
        {
          label: 'Post-Apocalyptic Fantasy',
          value: 'Post-Apocalyptic Fantasy',
        },
        { label: 'Power Couple', value: 'Power Couple' },
        { label: 'Power Fantasy', value: 'Power Fantasy' },
        { label: 'Power Imbalance', value: 'Power Imbalance' },
        { label: 'Power Progression', value: 'Power Progression' },
        { label: 'Power Struggle', value: 'Power Struggle' },
        { label: 'Pregnancy', value: 'Pregnancy' },
        { label: 'Progression Fantasy', value: 'Progression Fantasy' },
        {
          label: 'Protagonist Strong from the Start',
          value: 'Protagonist Strong from the Start',
        },
        { label: 'Protective Husband', value: 'Protective Husband' },
        { label: 'Protective Male Lead', value: 'Protective Male Lead' },
        { label: 'Psychological', value: 'Psychological' },
        { label: 'Psychological Romance', value: 'Psychological Romance' },
        { label: 'Quick transmigration', value: 'Quick transmigration' },
        { label: 'Rebirth', value: 'Rebirth' },
        {
          label: 'rebirth/transmigration fantasy',
          value: 'rebirth/transmigration fantasy',
        },
        { label: 'Reborn', value: 'Reborn' },
        { label: 'Reconciliation', value: 'Reconciliation' },
        { label: 'Redemption', value: 'Redemption' },
        { label: 'Redemption Arc', value: 'Redemption Arc' },
        { label: 'reincarnation', value: 'reincarnation' },
        { label: 'Rekindled Romance', value: 'Rekindled Romance' },
        { label: 'Revenge', value: 'Revenge' },
        { label: 'Revenge on Scum', value: 'Revenge on Scum' },
        { label: 'Reverse Harem', value: 'Reverse Harem' },
        { label: 'Reversible Couple', value: 'Reversible Couple' },
        { label: 'Rich to Poor', value: 'Rich to Poor' },
        { label: 'Rise to Power', value: 'Rise to Power' },
        { label: 'Rivalry', value: 'Rivalry' },
        { label: 'Rivals to Lovers', value: 'Rivals to Lovers' },
        { label: 'Romance', value: 'Romance' },
        { label: 'Romantic Comedy', value: 'Romantic Comedy' },
        { label: 'Royal court', value: 'Royal court' },
        { label: 'Royal Family', value: 'Royal Family' },
        { label: 'Royal Romance', value: 'Royal Romance' },
        { label: 'Royalty', value: 'Royalty' },
        { label: 'Runaway Pregnancy', value: 'Runaway Pregnancy' },
        { label: 'Rural life', value: 'Rural life' },
        { label: 'Rural Slice of Life', value: 'Rural Slice of Life' },
        { label: 'Ruthless Female Lead', value: 'Ruthless Female Lead' },
        { label: 'Satisfying Revenge', value: 'Satisfying Revenge' },
        {
          label: 'Schemes and Conspiracies',
          value: 'Schemes and Conspiracies',
        },
        { label: 'Scheming Female Lead', value: 'Scheming Female Lead' },
        { label: 'Scheming Protagonists', value: 'Scheming Protagonists' },
        { label: 'School Life', value: 'School Life' },
        { label: 'Sci-fi', value: 'Sci-fi' },
        { label: 'Science Fiction', value: 'Science Fiction' },
        { label: 'Scum Tormenting', value: 'Scum Tormenting' },
        { label: 'Second Chance', value: 'Second Chance' },
        {
          label: 'Second Chance at Happiness',
          value: 'Second Chance at Happiness',
        },
        { label: 'Secret Crush', value: 'Secret Crush' },
        { label: 'Secret Identity', value: 'Secret Identity' },
        { label: 'Secret Organizations', value: 'Secret Organizations' },
        { label: 'Sect management', value: 'Sect management' },
        { label: 'seinen', value: 'seinen' },
        { label: 'Seme Protagonist', value: 'Seme Protagonist' },
        { label: 'Shadow Guard Romance', value: 'Shadow Guard Romance' },
        { label: 'Short Story', value: 'Short Story' },
        { label: 'Shoujo', value: 'Shoujo' },
        { label: 'Shoujo Ai', value: 'Shoujo Ai' },
        { label: 'Shounen', value: 'Shounen' },
        { label: 'Shounen Ai', value: 'Shounen Ai' },
        { label: 'Showbiz', value: 'Showbiz' },
        { label: 'Sibling Bond', value: 'Sibling Bond' },
        { label: 'simple life', value: 'simple life' },
        { label: 'simple minded', value: 'simple minded' },
        { label: 'Single Mother', value: 'Single Mother' },
        { label: 'Slice of Life', value: 'Slice of Life' },
        { label: 'Slow Burn', value: 'Slow Burn' },
        { label: 'Slow Romance', value: 'Slow Romance' },
        { label: 'Slow-burn Romance', value: 'Slow-burn Romance' },
        { label: 'Smut', value: 'Smut' },
        {
          label: 'Song Dynasty Transmigration',
          value: 'Song Dynasty Transmigration',
        },
        { label: 'Soul Transmigration', value: 'Soul Transmigration' },
        { label: 'Space', value: 'Space' },
        { label: 'Space Ability', value: 'Space Ability' },
        { label: 'Special Ability', value: 'Special Ability' },
        { label: 'Special Powers', value: 'Special Powers' },
        { label: 'Spiritual', value: 'Spiritual' },
        { label: 'Spy', value: 'Spy' },
        { label: 'Stockpiling', value: 'Stockpiling' },
        { label: 'Storage Space', value: 'Storage Space' },
        { label: 'Strong Female Lead', value: 'Strong Female Lead' },
        { label: 'Strong Female Leads', value: 'Strong Female Leads' },
        { label: 'Strong Love Interest', value: 'Strong Love Interest' },
        { label: 'Strong Male Lead', value: 'Strong Male Lead' },
        { label: 'Stubborn Protagonist', value: 'Stubborn Protagonist' },
        { label: 'Supernatural', value: 'Supernatural' },
        { label: 'Supernatural Abilities', value: 'Supernatural Abilities' },
        { label: 'Superpowers', value: 'Superpowers' },
        { label: 'Survival', value: 'Survival' },
        { label: 'Suspense', value: 'Suspense' },
        { label: 'Sweet Doting', value: 'Sweet Doting' },
        { label: 'sweet love', value: 'sweet love' },
        { label: 'Sweet Pampering', value: 'Sweet Pampering' },
        { label: 'Sweet Romance', value: 'Sweet Romance' },
        { label: 'Sweet Story', value: 'Sweet Story' },
        { label: 'SweetNovel', value: 'SweetNovel' },
        { label: 'system', value: 'system' },
        { label: 'System Assistance', value: 'System Assistance' },
        { label: 'system/cheat ability', value: 'system/cheat ability' },
        { label: 'Team Building', value: 'Team Building' },
        { label: 'Thriller', value: 'Thriller' },
        { label: 'Time Regression', value: 'Time Regression' },
        { label: 'Time Travel', value: 'Time Travel' },
        { label: 'Tragedy', value: 'Tragedy' },
        { label: 'Tragic Past', value: 'Tragic Past' },
        { label: 'Transmigration', value: 'Transmigration' },
        {
          label: 'Transmigration into a Book',
          value: 'Transmigration into a Book',
        },
        {
          label: 'Transmigration into a Novel',
          value: 'Transmigration into a Novel',
        },
        {
          label: 'True and False Young Mistress',
          value: 'True and False Young Mistress',
        },
        { label: 'True Heiress', value: 'True Heiress' },
        { label: 'Tsundere Male Lead', value: 'Tsundere Male Lead' },
        { label: 'Unrequited Love', value: 'Unrequited Love' },
        { label: 'Urban', value: 'Urban' },
        { label: 'Urban Fantasy', value: 'Urban Fantasy' },
        { label: 'Urban Romance', value: 'Urban Romance' },
        { label: 'Village Life', value: 'Village Life' },
        { label: 'Villain', value: 'Villain' },
        { label: 'Villain Male Lead', value: 'Villain Male Lead' },
        { label: 'Villainess', value: 'Villainess' },
        { label: 'warm and sweet romance', value: 'warm and sweet romance' },
        { label: 'Weak to Strong', value: 'Weak to Strong' },
        { label: 'Wealth Accumulation', value: 'Wealth Accumulation' },
        { label: 'wealth building', value: 'wealth building' },
        { label: 'Wealth Gap Romance', value: 'Wealth Gap Romance' },
        { label: 'Wealthy Characters', value: 'Wealthy Characters' },
        { label: 'Wealthy Family', value: 'Wealthy Family' },
        { label: 'Wife Pursuit', value: 'Wife Pursuit' },
        {
          label: 'Wife-Chasing Crematorium',
          value: 'Wife-Chasing Crematorium',
        },
        { label: "Women's Fiction", value: "Women's Fiction" },
        { label: 'Wuxia', value: 'Wuxia' },
        { label: 'Xianxia', value: 'Xianxia' },
        { label: 'Xuanhuan', value: 'Xuanhuan' },
        { label: 'yandere', value: 'yandere' },
        { label: 'Yandere Male Lead', value: 'Yandere Male Lead' },
        { label: 'Yaoi', value: 'Yaoi' },
        { label: 'Younger Love Interests', value: 'Younger Love Interests' },
        { label: 'Yuri', value: 'Yuri' },
        { label: 'Zombie', value: 'Zombie' },
        { label: 'Zombie Apocalypse', value: 'Zombie Apocalypse' },
        { label: 'Zombies', value: 'Zombies' },
        {
          label: '🔓 Completely Unlocked 🔓',
          value: '🔓 Completely Unlocked 🔓',
        },
      ],
    },
  } satisfies Filters;

  private getNovelId(html: string): string | null {
    const dataCatMatch = html.match(/data-cat=["'](\d+)["']/);
    if (dataCatMatch) return dataCatMatch[1];

    const shortlinkMatch = html.match(/[?&]p=(\d+)/);
    if (shortlinkMatch) return shortlinkMatch[1];

    return null;
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '').trim();
  }

  async popularNovels(
    pageNo: number,
    options: Plugin.PopularNovelsOptions<typeof this.filters>,
  ): Promise<Plugin.NovelItem[]> {
    const novels: Plugin.NovelItem[] = [];
    const apiUrl = `${this.site}/wp-json/fiction/v1/novels/`;

    const { novelstatus, term } = options.filters;

    const params = new URLSearchParams();
    params.append('page', pageNo.toString());
    params.append('novelstatus', novelstatus.value);

    // Join the array of selected genres into a comma-separated string
    // This assumes the site's API handles multiple genres joined by commas
    params.append('term', term.value.join(','));

    params.append('orderby', 'date');
    params.append('order', 'desc');
    params.append('query', '');

    try {
      const response = await fetchApi(`${apiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Referer': `${this.site}/library/`,
          'User-Agent': USER_AGENT,
        },
      });

      const data = await response.json();
      const list = (Array.isArray(data) ? data : data.data || []) as APINovel[];

      list.forEach(novel => {
        if (novel.title) {
          novels.push({
            name: novel.title,
            cover: novel.novelImage || novel.thumbnail || defaultCover,
            path: (novel.permalink || '').replace(this.site, ''),
          });
        }
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('ShanghaiFantasy Popular Error:', e.message);
      }
    }

    return novels;
  }

  async parseNovel(novelPath: string): Promise<Plugin.SourceNovel> {
    const url = this.site + novelPath;
    const body = await fetchText(url);
    const $ = loadCheerio(body);

    const novel: Plugin.SourceNovel = {
      path: novelPath,
      name: 'Untitled',
      cover: defaultCover,
      status: NovelStatus.Unknown,
      chapters: [],
    };

    novel.name =
      $('p.text-lg.font-bold').text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      'Untitled';

    const coverUrl = $('img.rounded-lg, img.aspect-\\[3\\/4\\]').attr('src');
    if (coverUrl) novel.cover = coverUrl;

    $('span.font-bold').each((i, el) => {
      const label = $(el).text().trim();
      const value = $(el).parent().text().replace(label, '').trim();

      if (label.includes('Author')) novel.author = value;
    });

    const statusText = $('a[href*="status"]').text().trim().toLowerCase();
    if (statusText.includes('ongoing')) novel.status = NovelStatus.Ongoing;
    else if (statusText.includes('completed'))
      novel.status = NovelStatus.Completed;
    else if (statusText.includes('hiatus')) novel.status = NovelStatus.OnHiatus;

    const genres: string[] = [];
    $('a[href*="genre"]').each((i, el) => {
      genres.push($(el).text().trim());
    });
    if (genres.length > 0) novel.genres = genres.join(', ');

    const summaryDiv = $('div[x-show="activeTab===\'Synopsis\'"]');
    if (summaryDiv.length > 0) {
      novel.summary = summaryDiv
        .find('p')
        .map((i, el) => $(el).text().trim())
        .get()
        .join('\n\n');
    } else {
      novel.summary =
        $('meta[property="og:description"]').attr('content') || '';
    }

    const novelId = this.getNovelId(body);

    if (novelId) {
      const chapterApiUrl = `${this.site}/wp-json/fiction/v1/chapters`;

      // The API silently caps results at 200 per page regardless of
      // per_page, so long novels need to be paged through until empty.
      try {
        const allChapters: APIChapter[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const params = new URLSearchParams();
          params.append('category', novelId);
          params.append('order', 'asc');
          params.append('page', page.toString());
          params.append('per_page', '9999');

          const response = await fetchApi(
            `${chapterApiUrl}?${params.toString()}`,
            {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Referer': url,
                'User-Agent': USER_AGENT,
              },
            },
          );

          const data = await response.json();
          const chapterList = (
            Array.isArray(data) ? data : data.data || []
          ) as APIChapter[];

          if (chapterList.length === 0) {
            hasMore = false;
          } else {
            allChapters.push(...chapterList);
            page++;
          }
        }

        if (allChapters.length > 0) {
          novel.chapters = [];
          allChapters.forEach((chap, index) => {
            const rawTitle =
              chap.post_title || chap.title || `Chapter ${index + 1}`;
            const title = chap.locked ? `🔒 ${rawTitle}` : rawTitle;
            const link = chap.permalink || chap.url || chap.link;
            const date = chap.post_date || chap.date || '';

            if (link) {
              novel.chapters?.push({
                name: title,
                path: link.replace(this.site, ''),
                chapterNumber: index + 1,
                releaseTime: date,
              });
            }
          });
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.error('ShanghaiFantasy Chapter API Error:', e.message);
        }
      }
    }

    return novel;
  }

  async parseChapter(chapterPath: string): Promise<string> {
    const url = this.site + chapterPath;
    const body = await fetchText(url);
    const $ = loadCheerio(body);

    const contentDiv = $('.contenta, .entry-content, .reading-content').first();

    if (contentDiv.find('.mycred-sell-this-wrapper').length > 0) {
      throw new Error(
        'This chapter is locked. Please purchase it on the website to read it.',
      );
    }

    contentDiv
      .find('.ai-viewport-1, .ai-viewport-2, .ai-viewport-3, .code-block')
      .remove();
    contentDiv.find('script, ins, button, template, div[x-data]').remove();

    return contentDiv.html() || '';
  }

  async searchNovels(
    searchTerm: string,
    pageNo: number,
  ): Promise<Plugin.NovelItem[]> {
    const novels: Plugin.NovelItem[] = [];
    const apiUrl = `${this.site}/wp-json/fiction/v1/novels/`;

    const params = new URLSearchParams();
    params.append('page', pageNo.toString());
    params.append('novelstatus', '');
    params.append('term', '');
    params.append('query', searchTerm);
    params.append('orderby', '');
    params.append('order', '');

    try {
      const response = await fetchApi(`${apiUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Referer': `${this.site}/library/`,
          'User-Agent': USER_AGENT,
        },
      });

      const data = await response.json();
      const list = (Array.isArray(data) ? data : data.data || []) as APINovel[];

      list.forEach(novel => {
        const title = novel.title || novel.post_title || novel.name;
        const cover =
          novel.novelImage || novel.thumbnail || novel.image || defaultCover;
        const link = novel.permalink || novel.link || novel.url;

        if (title && link) {
          novels.push({
            name: title,
            cover: cover,
            path: link.replace(this.site, ''),
          });
        }
      });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error('ShanghaiFantasy Search Error:', e.message);
      }
    }

    return novels;
  }

  resolveUrl = (path: string) => this.site + path;
}

export default new ShanghaiFantasy();
